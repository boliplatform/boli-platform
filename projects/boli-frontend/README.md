# Boli Frontend

![Boli - Blockchain Tokenization Platform](https://via.placeholder.com/800x200?text=Boli+Frontend)

A React-based web application for the Boli platform, enabling users to interact with tokenized real-world assets on the Algorand blockchain.

## 🌟 Features

- **Asset Discovery**: Browse and search tokenized assets across multiple categories
- **Wallet Integration**: Connect with multiple Algorand wallet providers
- **Investment Portal**: Invest in fractional or whole tokenized assets
- **Asset Creation**: Create and tokenize new real-world assets
- **Dashboard**: Track investments and monitor asset performance
- **Responsive Design**: Optimized for both desktop and mobile devices

## 🛠️ Technology Stack

- **Framework**: React with TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom design system
- **Blockchain**: Algorand integration via AlgoKit Utils
- **Wallet Connectivity**: txnlab's use-wallet library
- **Notifications**: Notistack for toast notifications
- **Routing**: React Router
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js v22.0 or later
- npm v9.0 or later
- An Algorand wallet (Pera, Defly, Exodus, or local KMD wallet for development)

### Installation

1. Clone the repository (if not already done for the main project):
   ```bash
   git clone https://github.com/yourusername/boli.git
   cd boli/boli-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.template .env
   ```
   
   Then edit `.env` to configure your Algorand connection.

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

The built application will be in the `dist` directory.

## 🧩 Project Structure

```
boli-frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── Account.tsx         # User account details
│   │   ├── BlueEconomy.tsx     # Blue Economy assets page
│   │   ├── CarbonCredits.tsx   # Carbon Credits assets page
│   │   ├── ConnectWallet.tsx   # Wallet connection modal
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── DisasterRecovery.tsx # Disaster Recovery bonds page
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   ├── HeritageAssets.tsx  # Heritage assets page
│   │   ├── LandProperty.tsx    # Land & Property assets page
│   │   └── RenewableEnergy.tsx # Renewable Energy assets page
│   ├── contexts/         # React contexts
│   │   └── WalletContext.tsx   # Wallet state management
│   ├── contracts/        # Generated Algorand contract clients
│   ├── hooks/            # Custom React hooks
│   │   └── useAlgorand.ts      # Algorand connection hook
│   ├── styles/           # CSS and styling files
│   │   ├── globals.css         # Global styles
│   │   └── *.module.css        # Component-specific styles
│   ├── utils/            # Utility functions
│   │   ├── ellipseAddress.ts   # Address shortening
│   │   └── network/            # Network configuration utilities
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 🔌 Algorand Network Configuration

The application can connect to different Algorand networks. Configure this in your `.env` file:

```
# LocalNet
VITE_ALGOD_SERVER=http://localhost
VITE_ALGOD_PORT=4001
VITE_ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
VITE_ALGOD_NETWORK=localnet

# TestNet
# VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
# VITE_ALGOD_PORT=
# VITE_ALGOD_TOKEN=
# VITE_ALGOD_NETWORK=testnet

# MainNet
# VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
# VITE_ALGOD_PORT=
# VITE_ALGOD_TOKEN=
# VITE_ALGOD_NETWORK=mainnet
```

## 🔐 Wallet Integration

The application integrates with Algorand wallets using the [use-wallet](https://github.com/txnlab/use-wallet) library:

- **For LocalNet**: KMD/Local Wallet is supported
- **For TestNet/MainNet**: Pera Wallet, Defly Wallet, and Exodus Wallet are supported

The wallet connection is managed through the `ConnectWallet` component and `WalletContext`.

## 🔄 Integrating with Smart Contracts

The frontend interacts with Algorand smart contracts through auto-generated TypeScript client classes.

When smart contracts are compiled, the frontend automatically generates TypeScript application clients from the artifacts and places them in the `src/contracts` folder.

Import and use these client classes in your components:

```typescript
import { HeritageAssetClient } from '../contracts/HeritageAsset';

// Create a client instance
const appClient = new HeritageAssetClient({
  // Configuration options
});

// Call a contract method
const result = await appClient.getHeritageAssetDetails({
  assetId: assetId
});
```

## 🧪 Testing

Run tests with:

```bash
npm test
```

For end-to-end testing:

```bash
npm run test:e2e
```

## 🎨 Styling

The application uses Tailwind CSS with a custom design system defined in `globals.css`. Key styling features include:

- **Color Palette**: Custom brand colors defined as CSS variables
- **Typography**: Font sizes, weights, and spacing
- **Components**: Pre-styled buttons, cards, and form elements
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## 📋 Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview the production build
- `npm test`: Run tests
- `npm run generate:app-clients`: Generate TypeScript clients from smart contract artifacts

## 🔄 Working with Contract Updates

When smart contracts are updated:

1. The contracts need to be rebuilt in the `boli-contracts` directory
2. Run `npm run generate:app-clients` to update the TypeScript clients
3. Update any component code that interacts with modified contract methods

## 📝 License

This project is licensed under the [Apache license 2.0](../LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request following the guidelines in the main repository README.
