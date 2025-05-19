// boli/boli-contracts/compile-all-with-algokit.js

/**
 * This script uses AlgoKit to compile all Algorand TypeScript contracts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Base directory
const baseDir = path.resolve('./smart_contracts');

// Define contract types in deployment order
const contractTypes = [
  'compliance',
  'land_property',
  'blue_economy',
  'renewable_energy',
  'carbon_credits',
  'disaster_recovery'
];

// Compile all contracts using AlgoKit
console.log('========= Compiling all contracts with AlgoKit =========');

// Check if AlgoKit is installed
let algokitInstalled = false;
try {
  execSync('algokit --version', { stdio: 'ignore' });
  algokitInstalled = true;
  console.log('AlgoKit is installed');
} catch (e) {
  console.log('AlgoKit is not installed, will use npx');
}

// Check Node.js version
try {
  console.log('Checking Node.js version (PuyaTs requires Node 22+):');
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`Node.js version: ${nodeVersion.trim()}`);
  
  // A version like v20.15.1 would be too old
  const majorVersion = parseInt(nodeVersion.trim().substring(1).split('.')[0], 10);
  if (majorVersion < 22) {
    console.log('⚠️ Your Node.js version is below the required version 22+ for PuyaTs');
    console.log('You might encounter issues during compilation.');
    console.log('Please consider upgrading your Node.js version to use PuyaTs.');
  }
} catch (e) {
  console.error('Could not check Node.js version:', e.message);
}

try {
  for (const contractType of contractTypes) {
    const contractFile = path.join(baseDir, contractType, 'contract.algo.ts');
    
    // Check if contract file exists
    if (fs.existsSync(contractFile)) {
      console.log(`\nCompiling ${contractType} contract...`);
      
      try {
        // Create artifacts directory if it doesn't exist
        const artifactsDir = path.join(baseDir, contractType, 'artifacts');
        if (!fs.existsSync(artifactsDir)) {
          fs.mkdirSync(artifactsDir, { recursive: true });
          console.log(`Created artifacts directory: ${artifactsDir}`);
        }
        
        // Build command based on whether AlgoKit is installed
        let command;
        if (algokitInstalled) {
          command = `algokit compile typescript ${contractFile} --out-dir ${artifactsDir}`;
        } else {
          command = `npx -y --quiet algokit compile typescript ${contractFile} --out-dir ${artifactsDir}`;
        }
        
        console.log(`Running command: ${command}`);
        execSync(command, { stdio: 'inherit' });
        
        // Check for application.json specifically
        const appJsonPath = path.join(artifactsDir, 'application.json');
        if (fs.existsSync(appJsonPath)) {
          console.log(`✅ Successfully compiled ${contractType} contract with application.json`);
        } else {
          console.log(`⚠️ Compilation completed but application.json not found for ${contractType}`);
        }
      } catch (compileError) {
        console.error(`❌ Error compiling ${contractType} contract`);
        // Error details already displayed via stdio: 'inherit'
      }
    } else {
      console.error(`❌ Contract file not found: ${contractFile}`);
    }
  }
  
  console.log('\n========= Compilation complete =========');
  
  // Suggest next steps
  console.log('\nNext steps:');
  console.log('1. If compilation was successful, generate type-safe clients with:');
  console.log('   node generate-clients-updated.js');
  console.log('2. If you encountered Node.js version issues, consider upgrading Node.js to 22+');
  console.log('3. For more information on AlgoKit and PuyaTs, see:');
  console.log('   https://developer.algorand.org/docs/get-details/algokit/tools/compile/');
  
} catch (error) {
  console.error('❌ Error during compilation process:', error.message);
}