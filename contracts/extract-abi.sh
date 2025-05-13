#!/bin/bash

# Extract the ABI from the compiled JSON and save it to a file that the frontend can use
forge build

# Create directory if it doesn't exist
mkdir -p ../src/contracts

# Extract ABI from the compiled contract and save it as a separate file
jq '.abi' artifacts/contracts/src/VoteChain.sol/VoteChain.json > ../src/contracts/VoteChainABI.json

echo "ABI extracted and saved to ../src/contracts/VoteChainABI.json"