// boli/boli-contracts/smart_contracts/compliance/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { ComplianceClient } from './artifacts/client';

/**
 * Deploys the Compliance contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying ComplianceContract ===');

  // Create app client
  const appClient = new ComplianceClient(
    {
      resolveBy: 'creatorAndName',
      sender: deployer,
      creatorAddress: deployer.addr,
    },
    algod
  );

  // Deploy the contract
  const app = await appClient.deploy({
    allowDelete: true,
    allowUpdate: true,
    onSchemaBreak: 'replace',
    onUpdate: 'update',
  });

  console.log(`App deployed with ID: ${app.appId} and address: ${app.appAddress}`);

  // If app was just created, fund the app account
  if (app.operationPerformed === 'create' || app.operationPerformed === 'replace') {
    // Fund the app account
    const fundParams = {
      amount: algokit.algos(1),
      from: deployer,
      to: app.appAddress,
      note: 'Funding ComplianceContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Initialize the compliance contract with the deployer as both the regulator and KYC provider
  try {
    // For demo purposes, we'll use the deployer address
    const mainRegulator = deployer.addr;
    const kycProvider = deployer.addr;
    
    await appClient.initialize({
      mainRegulator: mainRegulator,
      kycProvider: kycProvider
    });
    
    console.log(`Initialized compliance contract with main regulator: ${mainRegulator}`);
    
    // Set up some demo jurisdiction regulators
    const jurisdictions = ['FJI-ALL', 'VUT-ALL', 'SLB-ALL']; // Fiji, Vanuatu, Solomon Islands
    
    for (const jurisdiction of jurisdictions) {
      await appClient.registerJurisdictionRegulator({
        jurisdiction: jurisdiction,
        regulator: deployer.addr // For demo, use deployer as regulator
      });
      console.log(`Registered regulator for jurisdiction: ${jurisdiction}`);
    }
    
    // Set up some demo compliance rules
    const assetTypes = ['land-property', 'blue-economy', 'renewable-energy', 'carbon-credit', 'disaster-bond'];
    
    for (const assetType of assetTypes) {
      const rules = `{"kycRequired": true, "transferRestrictions": "approved_only", "minimumHoldingPeriod": 0}`;
      
      await appClient.setJurisdictionRules({
        jurisdiction: 'ALL',
        assetType: assetType,
        rules: rules
      });
      console.log(`Set compliance rules for asset type: ${assetType}`);
    }
    
    // Set demo KYC status for deployer account
    const expirationTimestamp = BigInt(Math.floor(Date.now() / 1000) + 31536000); // 1 year from now
    
    await appClient.setKycStatus({
      address: deployer.addr,
      status: 'approved',
      expirationTimestamp: expirationTimestamp
    });
    console.log(`Set KYC status for deployer account: approved`);
    
    // Get KYC status to verify
    const kycStatus = await appClient.getKycStatus({
      address: deployer.addr
    });
    console.log(`KYC status for deployer account: ${kycStatus.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error initializing compliance contract:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}