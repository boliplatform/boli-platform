// boli/boli-contracts/smart_contracts/index.ts

import algosdk from 'algosdk';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Base directory
const baseDir = path.resolve(__dirname);

// Define contract deployment order to handle dependencies
// Compliance should be deployed first as other contracts may depend on it
const deploymentOrder = [
  'compliance',         // Deploy compliance first
  'land_property',      // Then asset contracts
  'blue_economy',
  'renewable_energy',
  'carbon_credits',
  'disaster_recovery',
  // Add any new contract types here
];

// Function to validate and dynamically import a module
async function importDeployerIfExists(dir: string) {
  const deployerPath = path.resolve(dir, 'deploy_config');
  if (fs.existsSync(deployerPath + '.ts') || fs.existsSync(deployerPath + '.js')) {
    try {
      const deployer = await import(deployerPath);
      return { ...deployer, name: path.basename(dir) };
    } catch (error) {
      console.error(`Error importing deployer from ${dir}:`, error);
      return null;
    }
  }
  return null;
}

// Get a list of all deployers from the subdirectories
async function getDeployers() {
  const directories = fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.resolve(baseDir, dirent.name));

  const deployers = await Promise.all(directories.map(importDeployerIfExists));
  return deployers.filter((deployer) => deployer !== null); // Filter out null values
}

// Sort deployers according to the deployment order
function sortDeployersByOrder(deployers: any[], order: any[]) {
  // Create a map of names to index in the order array
  const orderMap = order.reduce((map: { [key: string]: number }, name: string, index: number) => {
    map[name] = index;
    return map;
  }, {});

  // Sort the deployers based on their index in the order array
  return [...deployers].sort((a, b) => {
    const aIndex = orderMap[a.name] !== undefined ? orderMap[a.name] : Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap[b.name] !== undefined ? orderMap[b.name] : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

// Execute all the deployers
(async () => {
  const contractName = process.argv.length > 2 ? process.argv[2] : undefined;
  const allDeployers = await getDeployers();
  
  // By default, deploy in the defined order
  let sortedDeployers = sortDeployersByOrder(allDeployers, deploymentOrder);
  
  // If a specific contract is requested, filter to only that one
  const filteredDeployers = contractName
    ? sortedDeployers.filter(deployer => deployer.name === contractName)
    : sortedDeployers;

  if (contractName && filteredDeployers.length === 0) {
    console.warn(`No deployer found for contract name: ${contractName}`);
    return;
  }

  // Get Algorand client
  const algodServer = 'http://localhost';
  const algodPort = 4001;
  const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const algod = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  
  // For testing, use a test account
  // In production, you would use a securely stored and managed account
  try {
    // For security, never hardcode mnemonics or use the comment below
    // But for development, you'll need to get a test account somehow
    // Create a test account for local development
    // NOTE: In production, use secure key management, such as AWS KMS or environment variables
    let testAccount;
    
    try {
      // Try to get account from environment variable (safer)
      const testMnemonic = process.env.TEST_MNEMONIC;
      if (testMnemonic) {
        testAccount = algosdk.mnemonicToSecretKey(testMnemonic);
      } else {
        // Fallback to a known test account for local development only
        console.warn("No TEST_MNEMONIC found in environment variables. Using fallback test account.");
        testAccount = {
          addr: "REPLACE_WITH_TEST_ADDRESS",
          sk: new Uint8Array(32) // Empty placeholder
        };
        
        // For local development with sandbox, you would get an account like this:
        // const kmdclient = new algosdk.Kmd(kmdToken, kmdServer, kmdPort);
        // testAccount = await kmdclient.getDefaultAccount();
      }
    } catch (e) {
      console.error("Error getting test account:", e);
      return;
    }
    
    console.log(`Deploying with account: ${testAccount.addr}`);
    
    // Store deployed app IDs for possible cross-referencing
    const deployedApps = new Map<string, number>();

    for (const deployer of filteredDeployers) {
      try {
        console.log(`\nDeploying ${deployer.name}...`);
        const appInfo = await deployer.deploy(algod, testAccount);
        
        // Store the app ID if returned
        if (appInfo && appInfo.appId) {
          deployedApps.set(deployer.name, appInfo.appId);
          console.log(`Successfully deployed ${deployer.name} with App ID: ${appInfo.appId}`);
        } else {
          console.log(`Successfully deployed ${deployer.name}`);
        }
      } catch (e) {
        console.error(`Error deploying ${deployer.name}:`, e);
      }
    }
    
    // Display summary of all deployed contracts
    if (deployedApps.size > 0) {
      console.log("\n=== Deployment Summary ===");
      deployedApps.forEach((appId, name) => {
        console.log(`${name}: App ID ${appId}`);
      });
    }
  } catch (e) {
    console.error("Error during deployment:", e);
  }
})();