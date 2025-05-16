// LandingPage.tsx
import {
  FaVoteYea,
  FaShieldAlt,
  FaGlobe,
  FaUserSecret,
  FaRocket,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { userHasWallet, AuthStatus } from "@civic/auth-web3";
import { UserButton, useUser } from "@civic/auth-web3/react";
import { useConnect } from "wagmi";
// import { useAutoConnect } from "@civic/auth-web3/wagmi";

export default function LandingPage() {
  const userContext = useUser();
  const { connectAsync, connectors } = useConnect();
  const navigate = useNavigate();

  // A function to connect an existing civic embedded wallet
  const connectExistingWallet = async () => {
    connectAsync({
      connector: connectors?.[0],
    })
      .then(() => {
        navigate("/dashboard");
      })
      .catch(console.error("Error connecting wallet:"));
  };

  const connectWalletAndLaunchApp = async () => {
    try {
      if (userContext.user && !userHasWallet(userContext)) {
        await userContext.createWallet();
        await connectExistingWallet();
      } else if (userContext.user && userHasWallet(userContext)) {
        await connectExistingWallet();
      } else {
        console.error("Error connecting wallet:");
      }
      // navigate("/dashboard");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-extrabold tracking-wide">VoteChain</h1>
        <div className="space-x-4 flex items-center">
          {userContext.authStatus === AuthStatus.AUTHENTICATED &&
          userContext.user && (
            <button
              onClick={connectWalletAndLaunchApp}
              className="bg-white text-blue-900 px-5 py-2 rounded font-semibold hover:bg-gray-200"
            >
              Launch App
            </button>
          )}

            <UserButton className="bg-white text-blue-900 px-5 py-2 rounded font-semibold hover:bg-gray-200" />
          
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-28">
        <div className="max-w-4xl">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Redefining Trust in Elections with Web3
          </h2>

          <p className="text-lg text-blue-200 mb-8">
            VoteChain enables secure, tamper-proof, and transparent voting for
            DAOs, communities, and real-world elections using blockchain
            technology.
          </p>
          <div className="space-x-4 w-full flex justify-center">
            <button className="bg-white text-blue-900 text-lg font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200">
              <FaVoteYea className="text-xl" />
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white text-blue-900 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <FaShieldAlt className="text-4xl mx-auto text-blue-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">Immutable & Secure</h3>
            <p className="text-gray-700">
              Blockchain-backed records ensure no vote can be changed, lost, or
              manipulated.
            </p>
          </div>
          <div>
            <FaUserSecret className="text-4xl mx-auto text-blue-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">Private & Anonymous</h3>
            <p className="text-gray-700">
              Voters retain privacy through cryptographic anonymity without
              sacrificing transparency.
            </p>
          </div>
          <div>
            <FaGlobe className="text-4xl mx-auto text-blue-700 mb-4" />
            <h3 className="text-xl font-bold mb-2">Borderless Access</h3>
            <p className="text-gray-700">
              Anyone with a wallet can vote — whether part of a DAO or a global
              citizen.
            </p>
          </div>
        </div>
      </section>

      {/* Callout Section */}
      <section className="py-20 px-6 text-center bg-blue-800">
        <h3 className="text-4xl font-extrabold mb-6">
          Your Election. Your Voice. Your Chain.
        </h3>
        <p className="max-w-2xl mx-auto text-blue-200 text-lg mb-8">
          From student unions to nation-states, VoteChain provides the framework
          to run verifiable, auditable, and anonymous elections — accessible
          from anywhere in the world.
        </p>
        <button className="bg-white text-blue-900 px-8 py-3 text-lg rounded-lg font-semibold hover:bg-gray-100">
          Explore Use Cases
        </button>
      </section>

      {/* Highlights Section */}
      <section className="bg-white text-blue-900 py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h4 className="text-3xl font-bold mb-4">Why Choose VoteChain?</h4>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-green-600 mt-1" /> Real-time
                verifiability of all votes
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-green-600 mt-1" /> No central
                authority, no tampering
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-green-600 mt-1" /> Gas-efficient
                and scalable architecture
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-green-600 mt-1" /> Integrates
                with wallets like MetaMask
              </li>
            </ul>
          </div>
          <div className="bg-blue-100 p-6 rounded-lg shadow">
            <h4 className="text-xl font-semibold mb-2">
              Get Started Instantly
            </h4>
            <p className="text-gray-700 mb-4">
              No KYC. No forms. Just connect your wallet or signin with socials
              and participate in your first on-chain election.
            </p>
            <button className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-700">
              Connect Wallet
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-sm text-center py-6">
        <p className="mb-2">© 2025 VoteChain. All rights reserved.</p>
        <div className="space-x-4">
          <a href="#" className="hover:underline">
            Terms
          </a>
          <a href="#" className="hover:underline">
            Privacy
          </a>
          <a href="#" className="hover:underline">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
