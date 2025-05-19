// boli/boli-contracts/compile-with-algokit.js

/**
 * This script uses AlgoKit to compile Algorand TypeScript contracts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Command line args
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node compile-with-algokit.js <input_file_or_dir> <output_dir>');
  process.exit(1);
}

const input = path.resolve(args[0]);
const outputDir = path.resolve(args[1]);

// Validate input
if (!fs.existsSync(input)) {
  console.error(`Error: Input ${input} does not exist`);
  process.exit(1);
}

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`Compiling ${input} to ${outputDir}...`);

// Check if AlgoKit is installed
let algokitInstalled = false;
try {
  execSync('algokit --version', { stdio: 'ignore' });
  algokitInstalled = true;
  console.log('AlgoKit is installed');
} catch (e) {
  console.log('AlgoKit is not installed, will use npx');
}

try {
  let command;
  if (algokitInstalled) {
    command = `algokit compile typescript ${input} --out-dir ${outputDir}`;
  } else {
    command = `npx -y --quiet algokit compile typescript ${input} --out-dir ${outputDir}`;
  }
  
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
  
  // Check if files were generated
  const files = fs.readdirSync(outputDir);
  if (files.length > 0) {
    console.log('Generated files:');
    files.forEach(file => console.log(`- ${file}`));
    console.log('✅ Compilation successful');
  } else {
    console.log('⚠️ No files were generated');
  }
} catch (error) {
  console.error('❌ Compilation failed');
  console.error('Error details:', error.message);
  
  // Try to check if the issue is related to PuyaTs or its dependencies
  try {
    console.log('\nChecking Node.js version (PuyaTs requires Node 22+):');
    const nodeVersion = execSync('node --version', { encoding: 'utf8' });
    console.log(`Node.js version: ${nodeVersion.trim()}`);
    
    // A version like v20.15.1 would be too old
    const majorVersion = parseInt(nodeVersion.trim().substring(1).split('.')[0], 10);
    if (majorVersion < 22) {
      console.log('⚠️ Your Node.js version is below the required version 22+ for PuyaTs');
      console.log('Please upgrade your Node.js version to use PuyaTs');
    }
  } catch (e) {
    console.error('Could not check Node.js version:', e.message);
  }
  
  console.log('\nIf you continue to experience issues, you may need to:');
  console.log('1. Install AlgoKit: npm install -g @algorandfoundation/algokit');
  console.log('2. Ensure you have Node.js 22+ and NPM 10+ installed');
  console.log('3. Try installing PuyaTs: npm install -g @algorandfoundation/puya-ts');
}