// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VoteChain
 * @dev A decentralized voting system for elections using blockchain technology
 * @notice This contract allows for creating elections, adding candidates, and voting
 */
contract VoteChain {
    // Structs
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Election {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        address creator;
        bool initialized;
        mapping(uint256 => Candidate) candidates;
        mapping(address => bool) hasVoted;
        uint256 candidateCount;
    }

    // State Variables
    uint256 public electionCount;
    mapping(uint256 => Election) public elections;
    
    // Events
    event ElectionCreated(
        uint256 indexed electionId, 
        string title, 
        uint256 startTime, 
        uint256 endTime, 
        address creator
    );
    event CandidateAdded(uint256 indexed electionId, uint256 candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 candidateId, address voter);
    event ElectionEnded(uint256 indexed electionId, uint256 winningCandidateId, uint256 voteCount);

    // Modifiers
    modifier electionExists(uint256 _electionId) {
        require(_electionId < electionCount, "Election does not exist");
        require(elections[_electionId].initialized, "Election not initialized");
        _;
    }

    modifier onlyElectionCreator(uint256 _electionId) {
        require(elections[_electionId].creator == msg.sender, "Only election creator can perform this action");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(
            block.timestamp >= elections[_electionId].startTime && 
            block.timestamp <= elections[_electionId].endTime,
            "Election is not active"
        );
        _;
    }

    modifier electionEnded(uint256 _electionId) {
        require(block.timestamp > elections[_electionId].endTime, "Election has not ended yet");
        _;
    }

    modifier hasNotVoted(uint256 _electionId) {
        require(!elections[_electionId].hasVoted[msg.sender], "Already voted in this election");
        _;
    }

    /**
     * @dev Creates a new election
     * @param _title Title of the election
     * @param _description Description of the election
     * @param _startTime Start time of the election (unix timestamp)
     * @param _endTime End time of the election (unix timestamp)
     * @return electionId ID of the newly created election
     */
    function createElection(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime
    ) public returns (uint256 electionId) {
        require(_startTime >= block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");

        electionId = electionCount;
        
        Election storage newElection = elections[electionId];
        newElection.title = _title;
        newElection.description = _description;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.creator = msg.sender;
        newElection.initialized = true;
        newElection.candidateCount = 0;

        electionCount++;

        emit ElectionCreated(electionId, _title, _startTime, _endTime, msg.sender);
    }

    /**
     * @dev Adds a candidate to an election
     * @param _electionId ID of the election
     * @param _name Name of the candidate
     * @return candidateId ID of the added candidate
     */
    function addCandidate(
        uint256 _electionId, 
        string memory _name
    ) public electionExists(_electionId) onlyElectionCreator(_electionId) returns (uint256 candidateId) {
        require(block.timestamp < elections[_electionId].startTime, "Cannot add candidates after election has started");
        
        candidateId = elections[_electionId].candidateCount;
        
        elections[_electionId].candidates[candidateId] = Candidate({
            name: _name,
            voteCount: 0
        });
        
        elections[_electionId].candidateCount++;
        
        emit CandidateAdded(_electionId, candidateId, _name);
    }

    /**
     * @dev Adds multiple candidates to an election at once
     * @param _electionId ID of the election
     * @param _names Array of candidate names
     */
    function addMultipleCandidates(
        uint256 _electionId, 
        string[] memory _names
    ) public electionExists(_electionId) onlyElectionCreator(_electionId) {
        require(block.timestamp < elections[_electionId].startTime, "Cannot add candidates after election has started");
        
        for (uint i = 0; i < _names.length; i++) {
            uint256 candidateId = elections[_electionId].candidateCount;
            
            elections[_electionId].candidates[candidateId] = Candidate({
                name: _names[i],
                voteCount: 0
            });
            
            elections[_electionId].candidateCount++;
            
            emit CandidateAdded(_electionId, candidateId, _names[i]);
        }
    }

    /**
     * @dev Casts a vote for a candidate in an election
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     */
    function vote(
        uint256 _electionId, 
        uint256 _candidateId
    ) public electionExists(_electionId) electionActive(_electionId) hasNotVoted(_electionId) {
        require(_candidateId < elections[_electionId].candidateCount, "Candidate does not exist");
        
        elections[_electionId].candidates[_candidateId].voteCount++;
        elections[_electionId].hasVoted[msg.sender] = true;
        
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    /**
     * @dev Get election details
     * @param _electionId ID of the election
     * @return title Title of the election
     * @return description Description of the election
     * @return startTime Start time of the election
     * @return endTime End time of the election
     * @return creator Address of the election creator
     * @return candidateCount Number of candidates in the election
     */
    function getElectionDetails(uint256 _electionId) public view electionExists(_electionId) returns (
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        address creator,
        uint256 candidateCount
    ) {
        Election storage election = elections[_electionId];
        return (
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.creator,
            election.candidateCount
        );
    }

    /**
     * @dev Get candidate details
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     * @return name Name of the candidate
     * @return voteCount Number of votes for the candidate
     */
    function getCandidate(
        uint256 _electionId, 
        uint256 _candidateId
    ) public view electionExists(_electionId) returns (string memory name, uint256 voteCount) {
        require(_candidateId < elections[_electionId].candidateCount, "Candidate does not exist");
        
        Candidate storage candidate = elections[_electionId].candidates[_candidateId];
        return (candidate.name, candidate.voteCount);
    }

    /**
     * @dev Get all candidates for an election
     * @param _electionId ID of the election
     * @return names Array of candidate names
     * @return voteCounts Array of vote counts
     */
    function getAllCandidates(
        uint256 _electionId
    ) public view electionExists(_electionId) returns (string[] memory names, uint256[] memory voteCounts) {
        uint256 count = elections[_electionId].candidateCount;
        names = new string[](count);
        voteCounts = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            Candidate storage candidate = elections[_electionId].candidates[i];
            names[i] = candidate.name;
            voteCounts[i] = candidate.voteCount;
        }
    }

    /**
     * @dev Check if an address has voted in an election
     * @param _electionId ID of the election
     * @param _voter Address of the voter
     * @return True if the address has voted, false otherwise
     */
    function hasVoted(uint256 _electionId, address _voter) public view electionExists(_electionId) returns (bool) {
        return elections[_electionId].hasVoted[_voter];
    }

    /**
     * @dev Get the winning candidate of an election
     * @param _electionId ID of the election
     * @return winningCandidateId ID of the winning candidate
     * @return winningVoteCount Number of votes for the winning candidate
     */
    function getWinningCandidate(
        uint256 _electionId
    ) public view electionExists(_electionId) electionEnded(_electionId) returns (uint256 winningCandidateId, uint256 winningVoteCount) {
        uint256 count = elections[_electionId].candidateCount;
        require(count > 0, "No candidates in this election");
        
        winningVoteCount = 0;
        
        for (uint256 i = 0; i < count; i++) {
            uint256 votes = elections[_electionId].candidates[i].voteCount;
            if (votes > winningVoteCount) {
                winningVoteCount = votes;
                winningCandidateId = i;
            }
        }
    }

    /**
     * @dev Check if an election is active
     * @param _electionId ID of the election
     * @return True if the election is active, false otherwise
     */
    function isElectionActive(uint256 _electionId) public view electionExists(_electionId) returns (bool) {
        return (
            block.timestamp >= elections[_electionId].startTime && 
            block.timestamp <= elections[_electionId].endTime
        );
    }

    /**
     * @dev Get all active elections
     * @return activeElectionIds Array of active election IDs
     */
    function getActiveElections() public view returns (uint256[] memory activeElectionIds) {
        uint256 activeCount = 0;
        
        // First, count active elections
        for (uint256 i = 0; i < electionCount; i++) {
            if (elections[i].initialized && isElectionActive(i)) {
                activeCount++;
            }
        }
        
        // Then, populate the array
        activeElectionIds = new uint256[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < electionCount; i++) {
            if (elections[i].initialized && isElectionActive(i)) {
                activeElectionIds[currentIndex] = i;
                currentIndex++;
            }
        }
    }

    /**
     * @dev Get all completed (past) elections
     * @return pastElectionIds Array of completed election IDs
     */
    function getPastElections() public view returns (uint256[] memory pastElectionIds) {
        uint256 pastCount = 0;
        
        // First, count past elections
        for (uint256 i = 0; i < electionCount; i++) {
            if (elections[i].initialized && block.timestamp > elections[i].endTime) {
                pastCount++;
            }
        }
        
        // Then, populate the array
        pastElectionIds = new uint256[](pastCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < electionCount; i++) {
            if (elections[i].initialized && block.timestamp > elections[i].endTime) {
                pastElectionIds[currentIndex] = i;
                currentIndex++;
            }
        }
    }
}