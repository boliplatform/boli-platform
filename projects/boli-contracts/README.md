# Boli Smart Contracts

This repository contains the smart contracts for the Boli platform, which enables tokenization of various real-world assets (RWAs) on the Algorand blockchain. The contracts are implemented using TealScript, a TypeScript-like language that compiles to TEAL for execution on the Algorand Virtual Machine (AVM).

## Project Overview

Boli aims to facilitate sustainable development and climate resilience through tokenization of various assets across different sectors:

1. **Land & Property**: Tokenization of real estate with legal document integration
2. **Blue Economy**: Tokenization of marine resources, fishing rights, and coastal concessions
3. **Renewable Energy**: Tokenization of renewable energy projects and energy certificates
4. **Carbon Credits**: Implementation of Verified Carbon Units (VCUs) for climate initiatives
5. **Disaster Recovery Bonds**: Climate event-triggered financing instruments for vulnerable regions
6. **Compliance**: Regulatory compliance management across all asset types

## Directory Structure

```
boli-contracts/
├── smart_contracts/
│   ├── shared/
│   │   ├── contract_base.algo.ts     # Base contract with common functionality
│   ├── compliance/
│   │   ├── contract.algo.ts          # Regulatory compliance contract
│   │   ├── deploy_config.ts          # Deployment configuration
│   ├── land_property/
│   │   ├── contract.algo.ts          # Land property tokenization contract
│   │   ├── deploy_config.ts          # Deployment configuration
│   ├── blue_economy/
│   │   ├── contract.algo.ts          # Blue economy asset contract
│   │   ├── deploy_config.ts          # Deployment configuration
│   ├── renewable_energy/
│   │   ├── contract.algo.ts          # Renewable energy project contract
│   │   ├── deploy_config.ts          # Deployment configuration
│   ├── carbon_credits/
│   │   ├── contract.algo.ts          # Carbon credit generation contract
│   │   ├── deploy_config.ts          # Deployment configuration
│   ├── disaster_recovery/
│   │   ├── contract.algo.ts          # Disaster recovery bond contract
│   │   ├── deploy_config.ts          # Deployment configuration
│   ├── index.ts                      # Main deployment script
```

## Prerequisites

- Node.js v18+
- AlgoKit CLI
- Algorand LocalNet (for testing)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the contracts:
   ```
   npm run build
   ```
4. Start Algorand LocalNet:
   ```
   algokit localnet start
   ```
5. Deploy contracts to LocalNet:
   ```
   npm run deploy
   ```

## Deploying Individual Contracts

To deploy a specific contract:

```
npm run deploy -- [contract_name]
```

For example:
```
npm run deploy -- land_property
```

## Contract Descriptions

### ContractBase

The base contract that all other contracts extend. Implements common functionality for tokenization, such as asset creation, compliance status updates, and metadata management.

### ComplianceContract

Manages regulatory compliance across all asset types, providing:
- KYC (Know Your Customer) tracking for accounts
- Jurisdiction-specific rule management
- Asset compliance status monitoring
- Verification of transaction compliance
- Regulatory authority management

### LandPropertyContract

Enables tokenization of real estate properties with the ability to:
- Create property NFTs with legal document integration
- Fractionalize properties for shared ownership
- Update valuations and legal documentation
- Transfer property ownership

### BlueEconomyContract

Handles tokenization of marine resources and rights with features for:
- Creating marine asset tokens with sustainability metrics
- Validating validity periods for rights
- Updating sustainability ratings based on assessments
- Transferring marine asset rights

### RenewableEnergyContract

Facilitates tokenization of renewable energy projects with capabilities for:
- Creating energy project tokens
- Issuing renewable energy certificates (RECs)
- Updating project performance metrics
- Transferring project ownership

### CarbonCreditContract

Implements the Verified Carbon Unit framework with functionality for:
- Creating carbon credit projects
- Issuing carbon credits to recipients
- Retiring credits with beneficiary designation
- Adding verification documentation
- Transferring credits between accounts

### DisasterRecoveryBondContract

Provides climate event-triggered financing instruments with features for:
- Creating bonds with specific trigger conditions
- Managing investments from bondholders
- Processing trigger events via oracle data
- Distributing payouts when triggered
- Handling bond maturity and returns

## Deployment Process

The main deployment script (`index.ts`) handles the deployment of all contracts in a specific order to ensure dependencies are resolved correctly:

1. First, the Compliance contract is deployed
2. Then, the asset-specific contracts are deployed in a predetermined order
3. Each contract is initialized with basic configuration and test data
4. A deployment summary is displayed with all contract App IDs

This orchestrated deployment process ensures that all contracts can interact with each other correctly and that the entire system is properly configured.

## Testing

Each contract directory contains deployment scripts that also run basic tests. To execute all tests:

```
npm test
```

## License

This project is licensed under the Apache license 2.0 - see the LICENSE file for details.

