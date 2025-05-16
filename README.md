# VoteChain

Live Site - https://votechain-iota.vercel.app/

VoteChain is a decentralized voting system built on blockchain technology, enabling secure, transparent, and tamper-proof elections. It allows users login using Civic Auth (through their social media) to create elections, add candidates, and cast votes in a trustless environment. The project leverages smart contracts on the Base Sepolia testnet and integrates with Civic for wallet authentication.

## Features

- **Immutable & Secure**: Blockchain-backed records ensure no vote can be changed, lost, or manipulated.
- **Private & Anonymous**: Voters retain privacy through cryptographic anonymity without sacrificing transparency.
- **Borderless Access**: With the aid of Civic Auth, Users can login using their socials (Google, Twitter, Facebook and Discord).
- **Real-time Verifiability**: All votes are recorded on the blockchain and can be verified in real-time.
- **Gas-efficient & Scalable**: Built on Base Sepolia, the system is optimized for low gas costs and scalability.

## Tech Stack

- **Frontend**: React, TailwindCSS, Wagmi, Civic Auth
- **Smart Contracts**: Solidity, Base Sepolia Testnet
- **State Management**: React Query
- **Routing**: React Router
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn or npm
- A wallet (e.g., MetaMask) connected to the Base Sepolia testnet

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/VoteChain.git
   cd VoteChain
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Smart Contract Deployment

The smart contract is deployed on the Base Sepolia testnet. You can interact with it using the following address and ABI:

- **Contract Address**: `0x296Ecf33a2c64F7A858133E60aC5d732Cd1b654c`
- **ABI**: Available in `src/utils.js`

### Usage

1. **Create an Election**:
   - Navigate to the Dashboard.
   - Click "New Election" and fill in the election details (title, description, start/end dates, and candidate names).
   - Submit the transaction to create the election.

2. **Vote in an Election**:
   - Browse active elections on the Dashboard.
   - Click "Vote" on the election you want to participate in.
   - Select a candidate and confirm your vote.

3. **View Election Results**:
   - Archived elections display the results, including the winning candidate and vote counts.

## Project Structure
