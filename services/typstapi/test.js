const fs = require('fs');
const path = require('path');

async function main() {
  const template = `#set document(title: "Test Document")
#set page(margin: 2cm)

= Hello from TypstAPI!

This document was rendered successfully.`;

  const data = {
    name: "Test User"
  };

  try {
    console.log("Sending test request to API...");
    
    const response = await fetch('http://localhost:3001/render', {
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

    const pdfData = await response.arrayBuffer();
    const outputPath = path.join(process.cwd(), 'test-output.pdf');
    fs.writeFileSync(outputPath, Buffer.from(pdfData));
    
    console.log(`PDF successfully generated and saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();