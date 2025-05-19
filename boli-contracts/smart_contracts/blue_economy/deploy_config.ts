// boli/boli-contracts/smart_contracts/blue_economy/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { BlueEconomyClient } from './artifacts/client';

/**
 * Deploys the Blue Economy contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying BlueEconomyContract ===');

  // Create app client
  const appClient = new BlueEconomyClient(
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
      note: 'Funding BlueEconomyContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Test the deployment by creating a sample marine asset
  const resourceName = 'Coral Reef Conservation';
  const resourceType = 'conservation';
  const marineZone = 'Great Astrolabe Reef';
  const sustainabilityRating = 85n;
  const validityPeriod = 31536000n; // 1 year in seconds
  const documentsHash = 'QmAbC123456789defghijklmno';
  const geoBoundary = '-18.2356,178.4578';
  const jurisdictionCode = 'FJI-KADAVU';

  try {
    // Call the createMarineAsset method
    const result = await appClient.createMarineAsset({
      resourceName: resourceName,
      resourceType: resourceType,
      marineZone: marineZone,
      sustainabilityRating: sustainabilityRating,
      validityPeriod: validityPeriod,
      documentsHash: documentsHash,
      geoBoundary: geoBoundary,
      jurisdictionCode: jurisdictionCode
    });

    console.log(`Created marine asset with ID: ${result.return} for ${resourceName}`);

    // Get marine asset details
    const details = await appClient.getMarineAssetDetails({
      assetId: result.return
    });

    console.log(`Marine asset details: ${details.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error creating test marine asset:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}