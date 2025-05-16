// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VoteChain} from "../src/VoteChain.sol";

contract VoteChainTest is Test {
    VoteChain public votechain;
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    uint256 public electionId;

    function setUp() public {
        votechain = new VoteChain();

        // Set up users with ETH
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(charlie, 100 ether);
    }

    function testCreateElection() public {
        vm.startPrank(alice);

        // Current time + 1 day for start time
        uint256 startTime = block.timestamp + 1 days;
        // Start time + 7 days for end time
        uint256 endTime = startTime + 7 days;

        string[] memory candidateNames = new string[](4);
        candidateNames[0] = "Alice";
        candidateNames[1] = "Bob";
        candidateNames[2] = "Charlie";
        candidateNames[3] = "Dave";

        // Create an election
        electionId = votechain.createElection(
            "Presidential DAO Election 2025",
            "A decentralized election to choose the next president of the DAO",
            startTime,
            endTime,
            candidateNames
        );

        // Verify election was created
        assertEq(votechain.electionCount(), 1);

        // Get election details and verify
        (string memory title, , uint256 returnedStartTime, uint256 returnedEndTime, address creator, ) =
            votechain.getElectionDetails(electionId);

        assertEq(title, "Presidential DAO Election 2025");
        assertEq(returnedStartTime, startTime);
        assertEq(returnedEndTime, endTime);
        assertEq(creator, alice);

        vm.stopPrank();
    }


    function testVoting() public {

        // Warp to election start time
        (, , uint256 startTime, , , ) = votechain.getElectionDetails(electionId);
        vm.warp(startTime + 1 hours); // 1 hour after start

        // Vote as different users
        vm.prank(alice);
        votechain.vote(electionId, 0); // Alice votes for candidate 0 (Alice)

        vm.prank(bob);
        votechain.vote(electionId, 1); // Bob votes for candidate 1 (Bob)

        vm.prank(charlie);
        votechain.vote(electionId, 0); // Charlie votes for candidate 0 (Alice)

        // Verify vote counts
        (, uint256[] memory voteCounts) = votechain.getAllCandidates(electionId);
        assertEq(voteCounts[0], 2); // Alice should have 2 votes
        assertEq(voteCounts[1], 1); // Bob should have 1 vote

        // Verify users have voted
        assertTrue(votechain.hasVoted(electionId, alice));
        assertTrue(votechain.hasVoted(electionId, bob));
        assertTrue(votechain.hasVoted(electionId, charlie));
    }

    function testGetWinningCandidate() public {
        // First create votes
        testVoting();

        // Warp to election end time
        (, , , uint256 endTime, , ) = votechain.getElectionDetails(electionId);
        vm.warp(endTime + 1 hours); // 1 hour after end

        // Get winning candidate
        (uint256 winningCandidateId, uint256 winningVoteCount) = votechain.getWinningCandidate(electionId);

        // Verify winner
        assertEq(winningCandidateId, 0); // Candidate 0 (Alice) should win
        assertEq(winningVoteCount, 2); // With 2 votes
    }

    function testActiveAndPastElections() public {
        // Create two elections
        vm.startPrank(alice);

        string[] memory candidateNames = new string[](4);
        candidateNames[0] = "Alice";
        candidateNames[1] = "Bob";
        candidateNames[2] = "Charlie";
        candidateNames[3] = "Dave";

        // Election 1: Active now
        uint256 election1Id = votechain.createElection(
            "Active Election",
            "This election is active now",
            block.timestamp, // Starts now
            block.timestamp + 5 days,  // Ends in 5 days
            candidateNames
        );

        // Election 2: Already ended
        uint256 election2Id = votechain.createElection(
            "Past Election",
            "This election has ended",
            block.timestamp, // Starts now
            block.timestamp + 2 days,   // Ends in 2 days
            candidateNames
        );

        vm.stopPrank();
        skip(3 days);

        // Check active elections
        uint256[] memory activeElections = votechain.getActiveElections();
        assertEq(activeElections.length, 1);
        assertEq(activeElections[0], election1Id);

        // Check past elections
        uint256[] memory pastElections = votechain.getPastElections();
        assertEq(pastElections.length, 1);
        assertEq(pastElections[0], election2Id);
    }
}
