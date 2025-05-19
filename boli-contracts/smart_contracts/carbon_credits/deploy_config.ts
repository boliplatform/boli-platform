// boli/boli-contracts/smart_contracts/carbon_credits/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { CarbonCreditClient } from './artifacts/client';

/**
 * Deploys the Carbon Credits contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying CarbonCreditContract ===');

  // Create app client
  const appClient = new CarbonCreditClient(
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
      note: 'Funding CarbonCreditContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Test the deployment by creating a sample carbon credit project
  const projectName = 'Pacific Mangrove Conservation';
  const unitName = 'MCC';
  const creditType = 'mangrove';
  const carbonRegistry = 'Verra';
  const registryProjectId = 'VCS-1234';
  const jurisdictionCode = 'FJI-REWA';
  const geolocation = '-18.1503,178.4231';
  const vintageStart = BigInt(Math.floor(Date.now() / 1000)); // Current time
  const vintageEnd = vintageStart + BigInt(31536000); // 1 year later
  const totalOffset = 10000n; // 10,000 tonnes of CO2
  const verificationMethodology = 'VM0033';
  const monitoringReportHash = 'QmStu123456789vwxyzABC';
  const verifier = 'EcoFiji Verification Services';

  try {
    const result = await appClient.createCarbonProject({
      projectName: projectName,
      unitName: unitName,
      creditType: creditType,
      carbonRegistry: carbonRegistry,
      registryProjectId: registryProjectId,
      jurisdictionCode: jurisdictionCode,
      geolocation: geolocation,
      vintageStart: vintageStart,
      vintageEnd: vintageEnd,
      totalOffset: totalOffset,
      verificationMethodology: verificationMethodology,
      monitoringReportHash: monitoringReportHash,
      verifier: verifier
    });

    console.log(`Created carbon credit project with ID: ${result.return} for ${projectName}`);

    // Optionally, get carbon credit details
    const details = await appClient.getCarbonCreditDetails({
      projectId: result.return
    });

    console.log(`Carbon credit details: ${details.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error creating test carbon credit project:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}