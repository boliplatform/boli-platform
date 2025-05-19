// boli/boli-contracts/smart_contracts/disaster_recovery/deploy_config.ts

import algosdk from 'algosdk';
import * as algokit from '@algorandfoundation/algokit-utils';
import { DisasterRecoveryBondClient } from './artifacts/client';

/**
 * Deploys the Disaster Recovery Bond contract to the Algorand network
 */
export async function deploy(algod: algosdk.Algodv2, deployer: algosdk.Account) {
  console.log('=== Deploying DisasterRecoveryBondContract ===');

  // Create app client
  const appClient = new DisasterRecoveryBondClient(
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
      note: 'Funding DisasterRecoveryBondContract app'
    };
    
    await algokit.transferAlgos(fundParams, algod);
    console.log(`Funded app with 1 ALGO`);
  }

  // Test the deployment by creating a sample disaster recovery bond
  const bondName = 'Fiji Cyclone Protection Bond';
  const unitName = 'FCPB';
  const bondType = 'cyclone';
  const triggerType = 'wind-speed';
  const triggerThreshold = 185n; // km/h wind speed
  const coverageAmount = BigInt(algokit.algos(1_000_000).microAlgos); // 1 million Algos
  
  // Set maturity date to 1 year from now
  const currentTime = BigInt(Math.floor(Date.now() / 1000));
  const maturityDate = currentTime + 31536000n; // 1 year in seconds
  
  const interestRate = 500n; // 5.00% annual interest rate (in basis points)
  const jurisdictionCode = 'FJI-ALL';
  const geolocation = 'Fiji Islands';
  const oracleProvider = 'Pacific Weather Services';
  const bondDocumentHash = 'QmRst987654321uvwxyzABC';
  const totalBondValue = BigInt(algokit.algos(1_500_000).microAlgos); // 1.5 million Algos

  try {
    const result = await appClient.createBond({
      bondName: bondName,
      unitName: unitName,
      bondType: bondType,
      triggerType: triggerType,
      triggerThreshold: triggerThreshold,
      coverageAmount: coverageAmount,
      maturityDate: maturityDate,
      interestRate: interestRate,
      jurisdictionCode: jurisdictionCode,
      geolocation: geolocation,
      oracleProvider: oracleProvider,
      bondDocumentHash: bondDocumentHash,
      totalBondValue: totalBondValue
    });

    console.log(`Created disaster recovery bond with ID: ${result.return} for ${bondName}`);

    // Optionally, get bond status
    const status = await appClient.getBondStatus({
      bondId: result.return
    });

    console.log(`Bond status: ${status.return}`);
    
    return { appId: app.appId, appAddress: app.appAddress };
  } catch (e) {
    console.error('Error creating test disaster recovery bond:', e);
    return { appId: app.appId, appAddress: app.appAddress };
  }
}
