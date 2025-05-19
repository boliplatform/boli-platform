// boli/boli-contracts/smart_contracts/heritage_assets/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { HeritageAssetClient } from './artifacts/client';

/**
 * Deploys the Heritage Asset contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying HeritageAssetContract ===');

  // Create app client
  const appClient = new HeritageAssetClient(
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
      note: 'Funding HeritageAssetContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Test the deployment by creating a sample heritage asset
  const heritageAssetName = 'Waiqele Historic Village';
  const unitName = 'HERITAGE';
  const heritageType = 'indigenous';
  const culturalSignificance = 'Traditional ceremonial ground with archaeological significance';
  const legalStatus = 'protected';
  const jurisdictionCode = 'FJI-CAKAU';
  const geolocation = '-16.5778,179.8144';
  const communityIdentifier = deployer.addr; // For testing, using deployer
  const stewardshipModel = 'community-led';
  const documentationHash = 'QmHeritageDoc123456789abcdef';

  try {
    // Call the createHeritageAsset method
    const result = await appClient.createHeritageAsset({
      assetName: heritageAssetName,
      unitName: unitName,
      heritageType: heritageType,
      culturalSignificance: culturalSignificance,
      legalStatus: legalStatus,
      jurisdictionCode: jurisdictionCode,
      geolocation: geolocation,
      communityIdentifier: communityIdentifier,
      stewardshipModel: stewardshipModel,
      documentationHash: documentationHash
    });

    console.log(`Created heritage asset with ID: ${result.return} for ${heritageAssetName}`);

    // Set up a sample restoration project
    const currentTime = Math.floor(Date.now() / 1000);
    const oneYearInSeconds = 31536000;
    const projectDeadline = BigInt(currentTime + oneYearInSeconds); // 1 year from now
    const fundingTarget = BigInt(algokit.algos(500_000).microAlgos); // 500,000 ALGO target
    const projectPhasesCount = 3n; // Three phases
    const projectVerifier = deployer.addr; // For testing, using deployer
    const projectDetailsHash = 'QmProjectDetails123456789';

    await appClient.createRestorationProject({
      assetId: result.return,
      fundingTarget: fundingTarget,
      projectDeadline: projectDeadline,
      projectPhasesCount: projectPhasesCount,
      projectVerifier: projectVerifier,
      projectDetailsHash: projectDetailsHash
    });

    console.log(`Created restoration project for heritage asset ID: ${result.return}`);

    // Define the project phases
    const phaseOneFunding = BigInt(algokit.algos(150_000).microAlgos);
    await appClient.defineProjectPhase({
      assetId: result.return,
      phaseNumber: 1n,
      phaseDescription: 'Documentation and initial site protection',
      milestoneCriteria: 'Complete site survey, documentation, and initial protective measures',
      phaseFunding: phaseOneFunding
    });

    const phaseTwoFunding = BigInt(algokit.algos(200_000).microAlgos);
    await appClient.defineProjectPhase({
      assetId: result.return,
      phaseNumber: 2n,
      phaseDescription: 'Structural stabilization and preservation',
      milestoneCriteria: 'Stabilize key structures and implement preservation techniques',
      phaseFunding: phaseTwoFunding
    });

    const phaseThreeFunding = BigInt(algokit.algos(150_000).microAlgos);
    await appClient.defineProjectPhase({
      assetId: result.return,
      phaseNumber: 3n,
      phaseDescription: 'Community facilities and education center',
      milestoneCriteria: 'Complete visitor facilities and education materials',
      phaseFunding: phaseThreeFunding
    });

    console.log(`Defined project phases for heritage asset ID: ${result.return}`);

    // Get heritage asset details
    const details = await appClient.getHeritageAssetDetails({
      assetId: result.return
    });

    console.log(`Heritage asset details: ${details.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error creating test heritage asset:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}