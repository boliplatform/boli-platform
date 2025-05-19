# Boli

![Boli - Blockchain Tokenization Platform](https://via.placeholder.com/800x200?text=Boli+Tokenization+Platform)

Boli is a blockchain-based platform built on Algorand that enables the tokenization of real-world assets with a focus on unique locations and sustainable opportunities.

## 🌴 Overview

Boli empowers the tokenization of various real-world assets including:

- **Land & Property**: Real estate with integrated legal documentation
- **Blue Economy**: Sustainable marine resources and coastal ecosystems
- **Carbon Credits**: Verified carbon units for climate initiatives
- **Renewable Energy**: Clean energy infrastructure projects
- **Disaster Recovery**: Climate event-triggered financing instruments
- **Heritage Assets**: Cultural and historical preservation projects

The platform is built using Algorand blockchain technology to create transparent, secure, and fractionalizable tokenized assets.

## 🛠️ Project Structure

This repository is organized as a monorepo with the following main components:

```
boli/
├── boli-contracts/     # Algorand smart contracts for various asset types
├── boli-frontend/      # React-based web application
```

## 🚀 Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v22.0 or later
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli#install) v2.0.0 or later
- [Docker](https://www.docker.com/) for running an Algorand LocalNet (if developing locally)

### Initial Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/boli.git
   cd boli
   ```

2. Bootstrap the project:
   ```bash
   algokit project bootstrap all
   ```
   This will install all dependencies for both the smart contracts and frontend.

3. Set up environment files:
   ```bash
   cd boli-contracts
   algokit generate env-file -a target_network localnet
   cd ..
   ```

4. Build the project:
   ```bash
   algokit project run build
   ```

### Starting the Development Environment

1. Start the Algorand LocalNet (in a separate terminal):
   ```bash
   algokit localnet start
   ```

2. Start the frontend development server:
   ```bash
   cd boli-frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## 📝 Contracts

The `boli-contracts` directory contains several Algorand smart contracts built with AlgoKit and TealScript, including:

- **Land & Property Contract**: Handles legal documentation, fractional ownership, and property tokenization
- **Blue Economy Contract**: Manages marine resources, fishing rights, and coastal tourism
- **Carbon Credits Contract**: Implements the Verified Carbon Unit Framework
- **Renewable Energy Contract**: Handles tokenization of energy projects
- **Disaster Recovery Contract**: Provides climate event-triggered financing
- **Heritage Asset Contract**: Manages cultural preservation tokenization
- **Compliance Contract**: Oversees regulatory compliance across all asset types

For more details, see the [boli-contracts README](./boli-contracts/README.md).

## 💻 Frontend

The `boli-frontend` directory contains a React-based web application that provides a user interface for interacting with the Boli platform. Features include:

- Wallet integration with multiple Algorand wallets
- Asset browsing and filtering
- Investment functionalities
- Dashboard for tracking assets and investments
- Asset creation and management
- Responsive design for mobile and desktop

For more details, see the [boli-frontend README](./boli-frontend/README.md).

## 🔌 Connecting to Algorand Networks

By default, the project is configured to run against Algorand LocalNet for development. To connect to TestNet or MainNet, modify the environment variables in the respective `.env` files.

### Frontend Network Configuration

In `boli-frontend/.env`, comment/uncomment the appropriate network settings:

```
# LocalNet
VITE_ALGOD_SERVER=http://localhost
VITE_ALGOD_PORT=4001
VITE_ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
VITE_ALGOD_NETWORK=localnet

# TestNet (uncomment to use)
# VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
# VITE_ALGOD_PORT=
# VITE_ALGOD_TOKEN=
# VITE_ALGOD_NETWORK=testnet
```

## 🔐 Algorand Wallet Integrations

The frontend includes support for multiple wallet providers:

- **LocalNet**: KMD/Local Wallet
- **TestNet/MainNet**:
  - Pera Wallet
  - Defly Wallet
  - Exodus Wallet

## 🔁 Development Workflow

1. Modify smart contracts in the `boli-contracts` directory
2. Compile contracts: `cd boli-contracts && algokit project run build`
3. Update frontend components in the `boli-frontend` directory
4. Run the development server: `cd boli-frontend && npm run dev`
5. Run tests: `algokit project run test`

## 🧪 Testing

- **Smart Contracts**: Run unit tests with `cd boli-contracts && python -m pytest`
- **Frontend**: Run Jest tests with `cd boli-frontend && npm test`

## 🏗️ Building for Production

To build the projects for production:

```bash
algokit project run build
```

## 📄 License

This project is licensed under the [Apache license 2.0](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
