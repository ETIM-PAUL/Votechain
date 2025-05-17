// App.tsx
import { useState, useEffect } from "react";
import { FaVoteYea } from "react-icons/fa";
import { LiaVoteYeaSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";
import { useReadContract, useAccount, useDisconnect } from 'wagmi';
import { VOTE_ADDRESS, VOTE_CHAIN_ABI } from './utils';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'wagmi/chains';

function App() {
  const userContext = useUser();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [electionDetailsModal, setElectionDetailsModal] = useState(false);
  const [newElectionModal, setNewElectionModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedElectionId, setSelectedElectionId] = useState(null);
  const [activeElections, setActiveElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [pastElections, setPastElections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [electionTitle, setElectionTitle] = useState("");
  const [electionDescription, setElectionDescription] = useState("");
  const [electionStartDate, setElectionStartDate] = useState("");
  const [electionEndDate, setElectionEndDate] = useState("");
  const [electionCandidates, setElectionCandidates] = useState([]);
  const { wallet } = userContext.ethereum;
  console.log("wallet", wallet);

  const publicClient = createPublicClient({
    chain: baseSepolia, // choose your chain
    transport: http(), // optional: pass a custom RPC endpoint like http('https://...')
  });
  
  const disconnectWallet = () => {
    disconnect();
    navigate("/");
  };

  const createNewElection = async () => {
    const candidatesArray = electionCandidates.split(",").map(name => name.trim());
    const startTime = Math.floor(new Date(electionStartDate).getTime() / 1000);
    const endTime = Math.floor(new Date(electionEndDate).getTime() / 1000);
    try {
      setIsLoading(true);
      const hash = await wallet.writeContract({
        address: VOTE_ADDRESS,
        abi: VOTE_CHAIN_ABI,
        functionName: 'createElection',
        args: [electionTitle, electionDescription, startTime, endTime, candidatesArray],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      fetchActiveElections();
      toast.success("Election created successfully");
      setElectionTitle("");
      setElectionDescription("");
      setElectionStartDate("");
      setElectionEndDate("");
      setElectionCandidates("");
      setNewElectionModal(false);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message);
      console.error("Error creating new election:", error);
      setIsLoading(false);
    }
  };

  const voteCandidate = async () => {
    try {
      setIsLoading(true);
      let hash = await wallet.writeContract({
        address: VOTE_ADDRESS,
        abi: VOTE_CHAIN_ABI,
        functionName: 'vote',
        args: [Number(selectedElectionId), Number(selectedCandidateId)],
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      fetchActiveElections();
      toast.success("Vote cast successfully");
      setSelectedCandidate(null);
      fetchActiveElections(true);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.message);
      console.error("Error casting vote:", error);
      setIsLoading(false);
    }
  };

  // Fetch active election IDs
  const { data: activeElectionIds, error: activeElectionError } = useReadContract({
    address: VOTE_ADDRESS,
    abi: VOTE_CHAIN_ABI,
    functionName: 'getActiveElections',
    chainId: 84532, // Base Sepolia chain ID
  });

  // Fetch upcoming election IDs
  const { data: upcomingElectionIds, error: upcomingElectionError } = useReadContract({
    address: VOTE_ADDRESS,
    abi: VOTE_CHAIN_ABI,
    functionName: 'getUpcomingElections',
    chainId: 84532, // Base Sepolia chain ID
  });

  // Fetch past election IDs
  const { data: pastElectionIds, error: pastElectionError } = useReadContract({
    address: VOTE_ADDRESS,
    abi: VOTE_CHAIN_ABI,
    functionName: 'getPastElections',
    chainId: 84532, // Base Sepolia chain ID
  });

  // Utility function to fetch election details
  const fetchElectionDetails = async (id) => {
    // Create a provider (e.g., using Base Sepolia RPC URL)
    const provider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/'); // Replace with your RPC URL

    // Create a contract instance
    const contract = new ethers.Contract(VOTE_ADDRESS, VOTE_CHAIN_ABI, provider);

    // Call the contract function
    const details = await contract.getElectionDetails(Number(id));
    const candidates = await contract.getAllCandidates(Number(id));
    return { id, ...details, candidates };
  };

  // Fetch details for active elections
  const fetchActiveElections = async () => {
    const activeElectionsData = await Promise.all(
      activeElectionIds.map((id) => fetchElectionDetails(id))
    );
    setActiveElections(activeElectionsData);
  };
  // Fetch details for upcoming elections
  const fetchUpcomingElections = async () => {
    const upcomingElectionsData = await Promise.all(
      upcomingElectionIds.map((id) => fetchElectionDetails(id))
    );
    setUpcomingElections(upcomingElectionsData);
  };

  useEffect(() => {
    if (activeElectionIds) {
      fetchActiveElections();
    } else {
      console.log('No active elections found.');
      setActiveElections([]); // Set to an empty array if no data
    }
  }, [activeElectionIds]);

  useEffect(() => {
    if (upcomingElectionIds) {
      fetchUpcomingElections();
    } else {
      console.log('No upcoming elections found.');
      setActiveElections([]); // Set to an empty array if no data
    }
  }, [upcomingElectionIds]);


  // Fetch details for past elections
  useEffect(() => {
    if (pastElectionIds) {
      const fetchPastElections = async () => {
        const pastElectionsData = await Promise.all(
          pastElectionIds.map((id) => fetchElectionDetails(id))
        );
        setPastElections(pastElectionsData);
      };
      fetchPastElections();
    } else {
      console.log('No past elections found.');
      setPastElections([]); // Set to an empty array if no data
    }
  }, [pastElectionIds]);


  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white p-4 flex justify-between">
        <h1
          onClick={() => navigate("/")}
          className="text-xl font-bold cursor-pointer"
        >
          VoteChain
        </h1>
        {/* <button className="hover:underline cursor-pointer">Disconnect</button> */}
        {userHasWallet(userContext) && isConnected ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-blue-50 p-2 px-4 rounded-lg">
              <p className="text-sm text-gray-600">Connected as</p>
              <p className="font-mono font-medium">
                {address?.substring(0, 6)}...
                {address?.substring(address.length - 4)}
              </p>
            </div>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          ""
        )}
      </nav>

      {/* Dashboard */}
      <main className="p-6">
        <div>
          <div className="flex w-full justify-between mb-5">
            <h2 className="text-2xl font-semibold mb-4 text-blue-900">
              Active Elections
            </h2>
            <button
              onClick={() => setNewElectionModal(true)}
              className="bg-white text-blue-900 text-md cursor-pointer font-semibold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-200"
            >
              <LiaVoteYeaSolid className="text-xl" />
              <span>New Election</span>
            </button>
          </div>
          {activeElections.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeElections.map((election, index) => (
              <div key={election.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg text-blue-900 font-bold mb-2">
                  {election[0]}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {election[1]}
                </p>
                <div className="flex">
                  <button
                    className="bg-blue-900 cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => {
                      setElectionDetailsModal(true);
                      setSelectedElection(election);
                      setSelectedElectionId(index);
                    }}
                  >
                    <FaVoteYea /> Vote
                  </button>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <p className="text-gray-600">No active elections yet.</p>
          )}
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">
            Upcoming Elections
          </h2>
          {upcomingElections.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingElections.map((election) => (
                <div key={election.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-bold mb-2 text-blue-900">
                    {election[0]}
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    {election[1]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No upcoming elections found.</p>
          )}
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">
            Archived Elections
          </h2>
          {pastElections.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastElections.map((election) => (
              <div key={election.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-2 text-blue-900">
                  {election[0]}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {election[1]}
                </p>
                <div className="flex justify-start gap-3">
                  <button
                    onClick={() => setElectionDetailsModal(true)}
                    className="bg-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-400 cursor-pointer text-black"
                  >
                    View More
                  </button>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <p className="text-gray-600">No past elections found.</p>
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          {/* Background with opacity */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal content */}
          <div className="bg-white rounded-md p-6 shadow w-full md:max-w-md relative">
            <section className="bg-white py-2 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xl font-bold mb-2 text-black text-center">
                  Make Your Vote Count
                </h2>
                <p className="text-lg text-center font-medium text-red-600 mb-8">
                  You are about to vote {selectedCandidate}
                </p>
                <div className="text-center flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setSelectedCandidate(null);
                      setElectionDetailsModal(true);
                    }}
                    className="bg-white border border-black cursor-pointer rounded-md text-black hover:bg-gray-500 hover:text-white px-4 py-2"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => 
                      voteCandidate()
                    }
                    className="bg-blue-800 cursor-pointer rounded-md text-white px-4 py-2 hover:bg-blue-900"
                  >
                    Vote
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {newElectionModal && (
        <div className="fixed inset-0 z-50">
          {/* Background with opacity */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal content */}
          <div className="bg-white p-6 rounded shadow w-full md:max-w-xl relative mx-auto my-20">
            <section className="bg-white text-blue-900 py-2 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  Create a New Election
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2">
                      Election Title
                    </label>
                    <input
                      type="text"
                      value={electionTitle}
                      onChange={(e) => setElectionTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded"
                      placeholder="e.g. Board Member Election"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      value={electionDescription}
                      onChange={(e) => setElectionDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded h-32"
                      placeholder="Describe the purpose of the election..."
                    ></textarea>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2">
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        value={electionStartDate}
                        onChange={(e) => setElectionStartDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">
                        End Date
                      </label>
                      <input
                        type="datetime-local"
                        value={electionEndDate}
                        onChange={(e) => setElectionEndDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">
                      Candidate Names (comma separated)
                    </label>
                    <input
                      type="text"
                      value={electionCandidates}
                      onChange={(e) => setElectionCandidates(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded"
                      placeholder="Alice, Bob, Charlie"
                    />
                  </div>
                  <div className="text-center flex justify-end gap-3">
                    <button
                      onClick={() => setNewElectionModal(false)}
                      disabled={isLoading}
                      className="bg-white disabled:opacity-50 disabled:cursor-not-allowed border border-black cursor-pointer rounded-md text-black hover:bg-gray-500 hover:text-white px-4 py-2"
                    >
                      Close Election
                    </button>
                    <button 
                      onClick={() => {
                        createNewElection();
                      }}
                      className="bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md text-white px-4 py-2 hover:bg-blue-900"
                    >
                      {isLoading ? "Creating..." : "Create Election"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {(electionDetailsModal && selectedElection) && (
        <div className="fixed inset-0 z-50">
          {/* Background with opacity */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal content */}
          <div className="bg-white p-6 rounded shadow w-full md:max-w-xl relative mx-auto my-10">
            <button
              className="absolute cursor-pointer top-2 right-3 text-2xl font-bold text-gray-500"
              onClick={() => setElectionDetailsModal(false)}
            >
              &times;
            </button>
            <section className="bg-white text-blue-900 py-20 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  {selectedElection[0]}
                </h2>
                <p className="text-gray-700 mb-6">
                  {selectedElection[1]}
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">Start Date:</h4>
                    <p>{new Date(Number(selectedElection[2]) * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                      })}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">End Date:</h4>
                    <p>{new Date(Number(selectedElection[3]) * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                      })}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">Created By:</h4>
                    <p>{selectedElection[4]?.substring(0, 6)}...{selectedElection[4]?.substring(selectedElection[4].length - 4)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">Status:</h4>
                    <p>
                      {(() => {
                        const now = Date.now(); // Current time in milliseconds
                        const startTime = Number(selectedElection[2]) * 1000; // Convert to milliseconds
                        const endTime = Number(selectedElection[3]) * 1000; // Convert to milliseconds

                        if (now > endTime) {
                          return "Ended"; // Election has ended
                        } else if (now > startTime && now < endTime) {
                          return "Active"; // Election is ongoing
                        } else {
                          return "Pending"; // Election has not started
                        }
                      })()}
                    </p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Candidates</h3>
                <div className="grid gap-4">
                  {selectedElection.candidates[0].map((candidate, index) => (
                  <div className="bg-blue-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold">{candidate}</h4>
                      <p className="text-sm">Votes: {Number(selectedElection.candidates[1][index])}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setSelectedCandidateId(index);
                        setElectionDetailsModal(false);
                      }}
                      className="bg-blue-900 cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <FaVoteYea /> Vote
                    </button>
                  </div>
                  ))}

                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
