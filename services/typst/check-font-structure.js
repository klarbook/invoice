import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const main = async () => {
  // Download the file with Bun
  console.log('Downloading Inter font...');
  const response = await fetch('https://github.com/rsms/inter/releases/download/v3.19/Inter-3.19.zip');
  const arrayBuffer = await response.arrayBuffer();
  
  // Write to disk
  fs.writeFileSync('inter.zip', Buffer.from(arrayBuffer));
  
  // Unzip using the spawn function
  console.log('Extracting zip file...');
  await new Promise((resolve, reject) => {
    const unzip = spawn('unzip', ['-q', 'inter.zip', '-d', 'temp_inter']);
    unzip.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Unzip process exited with code ${code}`));
      }
    });
  });
  
  // Find TTF files
  console.log('Looking for font files...');
  const findTTF = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        findTTF(filePath, fileList);
      } else if (file.endsWith('.ttf')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  };
  
  const ttfFiles = findTTF('temp_inter');
  console.log('Found TTF files:');
  ttfFiles.forEach(file => console.log(file));
  
  // Cleanup
  console.log('Cleaning up...');
  fs.unlinkSync('inter.zip');
  fs.rmSync('temp_inter', { recursive: true, force: true });
  
  console.log('Done!');
};

main().catch(console.error);