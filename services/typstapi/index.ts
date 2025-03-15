import { Server } from "bun";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { nanoid } from "nanoid";
import pino from "pino";

const MAX_CONCURRENT_RENDERS = parseInt(process.env.MAX_CONCURRENT_RENDERS || "10");
const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");
const PORT = parseInt(process.env.PORT || "3001");  // Changed default to 3001

// Setup logger
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

// Track active renders
const activeRenders = new Set<string>();

// Semaphore for limiting concurrent renders
const renderSemaphore = {
  acquire: async (): Promise<boolean> => {
    if (activeRenders.size >= MAX_CONCURRENT_RENDERS) {
      return false;
    }
    const id = nanoid();
    activeRenders.add(id);
    return true;
  },
  release: (): void => {
    if (activeRenders.size > 0) {
      const id = activeRenders.values().next().value;
      activeRenders.delete(id);
    }
  },
};

// Ensure data directory exists
try {
  await mkdir(DATA_DIR, { recursive: true });
  logger.info(`Data directory created at ${DATA_DIR}`);
} catch (err) {
  logger.error(`Error creating data directory: ${err}`);
  process.exit(1);
}

// Type definitions
interface RenderRequest {
  template: string;
  data: Record<string, any>;
}

// Function to render a Typst document using Docker container only
async function renderDocument(templateContent: string, jsonData: any): Promise<{ 
  success: boolean; 
  path?: string; 
  error?: string;
  cleanup?: () => Promise<void>; 
}> {
  // Check if we can acquire the semaphore
  const acquired = await renderSemaphore.acquire();
  if (!acquired) {
    return { success: false, error: "Too many concurrent render jobs" };
  }

  // Create a unique job ID and directory
  const jobId = randomUUID();
  const jobDir = join(DATA_DIR, jobId);
  
  try {
    // Create job directory
    await mkdir(jobDir, { recursive: true });
    
    // Write template and data files
    const templatePath = join(jobDir, "template.typ");
    const dataPath = join(jobDir, "data.json");
    const outputPath = join(jobDir, "output.pdf");
    
    await writeFile(templatePath, templateContent);
    await writeFile(dataPath, JSON.stringify(jsonData));
    
    logger.info(`Rendering document using Docker container...`);
    
    // Use the official Typst Docker image from GitHub Container Registry
    const proc = Bun.spawn([
      "docker", "run", "--rm",
      "-v", `${jobDir}:/workdir`,
      "ghcr.io/typst/typst:latest",
      "compile", "/workdir/template.typ", "/workdir/output.pdf"
    ]);
    
    // Capture stdout, stderr, and exit code
    const output = await new Response(proc.stdout).text();
    const error = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    
    // Log the output for debugging
    if (output) logger.info(`Docker stdout: ${output}`);
    if (error) logger.info(`Docker stderr: ${error}`);
    
    // Check if Docker command was successful
    if (exitCode !== 0) {
      logger.error(`Docker exited with code ${exitCode}: ${error}`);
      throw new Error(`Docker rendering failed with exit code ${exitCode}: ${error || output}`);
    }
    
    // Check if output file exists
    try {
      const stats = await Bun.file(outputPath).size;
      if (stats <= 0) {
        throw new Error("Output PDF file is empty");
      }
    } catch (err) {
      throw new Error(`Output PDF file not created or cannot be read: ${err}`);
    }
    
    logger.info(`Document rendered successfully via Docker`);
    
    // Return path to the generated PDF
    return { 
      success: true, 
      path: outputPath,
      cleanup: async () => {
        try {
          await rm(jobDir, { recursive: true, force: true });
          logger.info(`Cleaned up job directory: ${jobDir}`);
        } catch (cleanupErr) {
          logger.error(`Failed to clean up job directory: ${cleanupErr}`);
        }
      }
    };
  } catch (err) {
    logger.error(`Error rendering document: ${err}`);
    
    // Try to clean up on error too
    try {
      await rm(jobDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      logger.error(`Failed to clean up job directory after error: ${cleanupErr}`);
    }
    
    return { 
      success: false, 
      error: `Rendering failed: ${err}` 
    };
  } finally {
    // Release the semaphore
    renderSemaphore.release();
  }
}

// HTTP server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    // Health check endpoint
    if (req.url.endsWith("/health")) {
      return new Response("OK", { status: 200 });
    }
    
    // Render endpoint
    if (req.url.endsWith("/render") && req.method === "POST") {
      try {
        // Parse request body
        const body = await req.json() as RenderRequest;
        
        // Validate request
        if (!body.template || !body.data) {
          return new Response(JSON.stringify({ error: "Missing template or data" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        // Check if we're at capacity
        if (activeRenders.size >= MAX_CONCURRENT_RENDERS) {
          return new Response(JSON.stringify({ error: "Server is at capacity" }), { 
            status: 503,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        // Render document
        const result = await renderDocument(body.template, body.data);
        
        if (!result.success) {
          return new Response(JSON.stringify({ error: result.error }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        // Return PDF file
        const file = Bun.file(result.path!);
        const pdfContent = await file.arrayBuffer();
        
        // Clean up the job directory after reading the file
        if (result.cleanup) {
          result.cleanup().catch(err => logger.error(`Cleanup error: ${err}`));
        }
        
        return new Response(pdfContent, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": "attachment; filename=document.pdf"
          }
        });
      } catch (err) {
        logger.error(`Error processing request: ${err}`);
        return new Response(JSON.stringify({ error: "Internal server error" }), { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    
    // Status endpoint
    if (req.url.endsWith("/status")) {
      return new Response(JSON.stringify({
        activeRenders: activeRenders.size,
        maxConcurrentRenders: MAX_CONCURRENT_RENDERS
      }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Not found
    return new Response("Not found", { status: 404 });
  },
});

logger.info(`Server running at http://localhost:${PORT}`);

// Check if Docker is running and pull the Typst image if needed
async function ensureTypstImage() {
  logger.info("Checking Docker and ensuring Typst image is available...");
  
  try {
    // First check if Docker is running
    const dockerCheck = Bun.spawn(["docker", "info"]);
    const dockerCheckExitCode = await dockerCheck.exited;
    
    if (dockerCheckExitCode !== 0) {
      logger.error("Docker is not running or not accessible");
      throw new Error("Docker is not running");
    }
    
    // Check if the official Typst image exists
    const checkImage = Bun.spawn([
      "docker", "image", "ls",
      "--format", "{{.Repository}}:{{.Tag}}",
      "ghcr.io/typst/typst:latest"
    ]);
    
    const output = await new Response(checkImage.stdout).text();
    const exitCode = await checkImage.exited;
    
    // If image doesn't exist, pull it
    if (exitCode !== 0 || !output.trim()) {
      logger.info("Pulling the official Typst Docker image...");
      
      const pullImage = Bun.spawn([
        "docker", "pull",
        "ghcr.io/typst/typst:latest"
      ]);
      
      const pullOutput = await new Response(pullImage.stdout).text();
      const pullExitCode = await pullImage.exited;
      
      if (pullExitCode !== 0) {
        logger.error("Failed to pull Typst Docker image");
        throw new Error("Failed to pull Typst Docker image");
      }
      
      logger.info("Successfully pulled Typst Docker image");
    } else {
      logger.info("Typst Docker image is already available");
    }
  } catch (err) {
    logger.error(`Error ensuring Typst Docker image: ${err}`);
    logger.error("Make sure Docker is running and you have internet access to pull the image");
    process.exit(1);
  }
}

// Ensure the Typst image is available on startup
ensureTypstImage().catch(err => {
  logger.error(`Startup failed: ${err}`);
  process.exit(1);
});