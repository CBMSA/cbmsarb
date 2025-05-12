// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CBDCWallet {
    // Variables to store contract metadata
    address public owner; // Owner of the contract
    uint256 public totalIssued; // Total amount of issued Rands

    // Events for logging
    event FundsIssued(address indexed to, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Constructor to set the deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    // Function to issue funds
    function issueFunds(address payable to, uint256 amountInWei) external onlyOwner {
        require(amountInWei > 0, "Amount must be greater than zero");
        require(address(this).balance >= amountInWei, "Insufficient balance in contract");

        // Transfer funds
        to.transfer(amountInWei);

        // Track the total issued funds
        totalIssued += amountInWei;

        // Emit event for issued funds
        emit FundsIssued(to, amountInWei);
    }

    // Function to withdraw contract funds (only owner can withdraw)
    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance in contract");
        payable(owner).transfer(amount);

        // Emit event for withdrawal
        emit FundsWithdrawn(owner, amount);
    }

    // Function to get the contract's balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Allow the contract to receive Ether
    receive() external payable {}
}