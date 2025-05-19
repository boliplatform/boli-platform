// boli/boli-contracts/smart_contracts/land_property/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { LandPropertyClient } from './artifacts/client';

/**
 * Deploys the Land Property contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying LandPropertyContract ===');

  // Create app client
  const appClient = new LandPropertyClient(
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
      note: 'Funding LandPropertyContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Test the deployment by creating a sample property
  const propertyName = 'Test Beach Villa';
  const unitName = 'PROP';
  const propertyType = 'residential';
  const legalIdentifier = 'DEED-123456';
  const jurisdictionCode = 'FJI-NADI';
  const geolocation = '-17.7765,177.4356';
  const valuationAmount = BigInt(algokit.algos(500_000).microAlgos);
  const legalDocumentHash = 'QmXyZ123456789abcdef';

  try {
    // Call the createProperty method
    const result = await appClient.createProperty({
      propertyName: propertyName,
      unitName: unitName,
      propertyType: propertyType,
      legalIdentifier: legalIdentifier,
      jurisdictionCode: jurisdictionCode,
      geolocation: geolocation,
      valuationAmount: valuationAmount,
      legalDocumentHash: legalDocumentHash
    });

    console.log(`Created property asset with ID: ${result.return} for ${propertyName}`);

    // Optionally, get property details
    const details = await appClient.getPropertyDetails({
      propertyId: result.return
    });

    console.log(`Property details: ${details.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error creating test property:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}
