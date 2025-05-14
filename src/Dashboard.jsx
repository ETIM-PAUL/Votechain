// App.tsx
import { useState } from "react";
import { FaVoteYea } from "react-icons/fa";
import { LiaVoteYeaSolid } from "react-icons/lia";
import { useNavigate } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";

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

  const disconnectWallet = () => {
    disconnect();
    navigate("/");
  };

  const elections = [
    { id: "1", name: "Election 1", description: "Description of the election" },
    { id: "2", name: "Election 2", description: "Description of a election" },
    { id: "3", name: "Election 3", description: "Description of the election" },
  ];

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div key={election.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg text-blue-900 font-bold mb-2">
                  {election.name}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {election.description}
                </p>
                <div className="flex">
                  <button
                    className="bg-blue-900 cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    onClick={() => setElectionDetailsModal(true)}
                  >
                    <FaVoteYea /> Vote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-semibold mb-4 text-blue-900">
            Archived Elections
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election) => (
              <div key={election.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-2 text-blue-900">
                  {election.name}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {election.description}
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
                    onClick={() => {
                      setSelectedCandidate(null);
                      setElectionDetailsModal(true);
                    }}
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
                <form className="space-y-6">
                  <div>
                    <label className="block font-semibold mb-2">
                      Election Title
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded"
                      placeholder="e.g. Board Member Election"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2">
                      Description
                    </label>
                    <textarea
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
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
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
                      className="w-full p-3 border border-gray-300 rounded"
                      placeholder="Alice, Bob, Charlie"
                    />
                  </div>
                  <div className="text-center flex justify-end gap-3">
                    <button
                      onClick={() => setNewElectionModal(false)}
                      className="bg-white border border-black cursor-pointer rounded-md text-black hover:bg-gray-500 hover:text-white px-4 py-2"
                    >
                      Close Election
                    </button>
                    <button className="bg-blue-800 cursor-pointer rounded-md text-white px-4 py-2 hover:bg-blue-900">
                      Create Election
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      )}

      {electionDetailsModal && (
        <div className="fixed inset-0 z-50">
          {/* Background with opacity */}
          <div className="fixed inset-0 bg-black opacity-50"></div>
          {/* Modal content */}
          <div className="bg-white p-6 rounded shadow w-full md:max-w-xl relative mx-auto my-20">
            <button
              className="absolute cursor-pointer top-2 right-3 text-2xl font-bold text-gray-500"
              onClick={() => setElectionDetailsModal(false)}
            >
              &times;
            </button>
            <section className="bg-white text-blue-900 py-20 px-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">
                  Presidential DAO Election 2025
                </h2>
                <p className="text-gray-700 mb-6">
                  A decentralized election to choose the next president of the
                  DAO, ensuring fairness, transparency, and full community
                  participation.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">Start Date:</h4>
                    <p>May 1, 2025</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">End Date:</h4>
                    <p>May 10, 2025</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">Created By:</h4>
                    <p>0xA2F...39fB</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded shadow">
                    <h4 className="font-semibold">Status:</h4>
                    <p>Ongoing</p>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold mb-4">Candidates</h3>
                <div className="grid gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold">Alice</h4>
                      <p className="text-sm">Votes: 2,432</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCandidate("Alice");
                        setElectionDetailsModal(false);
                      }}
                      className="bg-blue-900 cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <FaVoteYea /> Vote
                    </button>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold">Bob</h4>
                      <p className="text-sm">Votes: 1,890</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCandidate("Bob");
                        setElectionDetailsModal(false);
                      }}
                      className="bg-blue-900 cursor-pointer text-white text-sm px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <FaVoteYea /> Vote
                    </button>
                  </div>
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
