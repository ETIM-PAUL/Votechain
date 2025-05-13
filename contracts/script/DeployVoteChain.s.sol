// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {VoteChain} from "../src/VoteChain.sol";

contract DeployVoteChain is Script {
    function run() public returns (VoteChain) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the contract
        VoteChain votechain = new VoteChain();

        // Stop broadcasting
        vm.stopBroadcast();

        return votechain;
    }
}
