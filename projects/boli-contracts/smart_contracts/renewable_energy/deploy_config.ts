// boli/boli-contracts/smart_contracts/renewable_energy/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { RenewableEnergyClient } from './artifacts/client';

/**
 * Deploys the Renewable Energy contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying RenewableEnergyContract ===');

  // Create app client
  const appClient = new RenewableEnergyClient(
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
      note: 'Funding RenewableEnergyContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Test the deployment by creating a sample energy project
  const projectName = 'Island Solar Farm';
  const energyType = 'solar';
  const installedCapacity = 1500000n; // 1.5 MW in watts
  const estimatedAnnualOutput = 2628000000n; // 2,628,000 kWh (assuming 20% capacity factor)
  const projectLifespan = 788400000n; // 25 years in seconds
  const location = '-18.1256,178.4289';
  const fractionalize = true;
  const fractionCount = 10000000n; // 10 million fractions
  const technicalSpecsHash = 'QmDefGhi123456789jklmnopqrst';
  const jurisdictionCode = 'FJI-VITI';

  try {
    const result = await appClient.createEnergyProject({
      projectName: projectName,
      energyType: energyType,
      installedCapacity: installedCapacity,
      estimatedAnnualOutput: estimatedAnnualOutput,
      projectLifespan: projectLifespan,
      location: location,
      fractionalize: fractionalize,
      fractionCount: fractionCount,
      technicalSpecsHash: technicalSpecsHash,
      jurisdictionCode: jurisdictionCode
    });

    console.log(`Created energy project with ID: ${result.return} for ${projectName}`);

    // Optionally, get energy project details
    const details = await appClient.getEnergyProjectDetails({
      projectId: result.return
    });

    console.log(`Energy project details: ${details.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error creating test energy project:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}