import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { embeddedWallet } from "@civic/auth-web3/wagmi";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import { mainnet, sepolia, optimismSepolia } from "wagmi/chains";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
if (!CLIENT_ID) throw new Error("CLIENT_ID is required");

const wagmiConfig = createConfig({
  chains: [optimismSepolia],
  transports: {
    [optimismSepolia.id]: http(),
  },
  connectors: [embeddedWallet()],
});

// Wagmi requires react-query
const queryClient = new QueryClient();

// Wrap the content with the necessary providers to give access to hooks: react-query, wagmi & civic auth provider
export const Providers = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider
          chains={[optimismSepolia]}
          clientId="23a84303-96a0-4e6f-bdca-ba3b9bd20a84"
          // oauthServer and wallet are not necessary for production.
          // config={{ oauthServer: AUTH_SERVER || 'https://auth.civic.com/oauth'}}
          // endpoints={{ wallet: WALLET_API_BASE_URL }}
        >
          {children}
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
