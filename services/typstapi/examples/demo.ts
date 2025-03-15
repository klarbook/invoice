#!/usr/bin/env bun
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function main() {
  try {
    // Get the template and data
    const templatePath = join(import.meta.dir, 'template.typ');
    const dataPath = join(import.meta.dir, 'data.json');
    
    const template = await readFile(templatePath, 'utf-8');
    const data = JSON.parse(await readFile(dataPath, 'utf-8'));
    
    console.log('Sending render request to API...');
    
    // Send the request
    const response = await fetch('http://localhost:3000/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template,
        data,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    // Get the PDF and save it
    const pdfData = await response.arrayBuffer();
    const outputPath = join(import.meta.dir, 'output.pdf');
    await writeFile(outputPath, Buffer.from(pdfData));
    
    console.log(`PDF successfully generated and saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();