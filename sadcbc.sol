

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CBDCWallet {
    // Owner of the contract
    address public owner;

    // Total amount of Rands issued
    uint256 public totalIssued;

    // Event for fund issuance with trace ID
    event FundsIssued(address indexed to, uint256 amount, string traceId);

    // Event for withdrawal with trace ID
    event FundsWithdrawn(address indexed by, uint256 amount, string traceId);

    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Constructor sets the contract deployer as the owner
    constructor() {
        owner = msg.sender;
    }

    /**
     * Issue funds from the contract to an address
     * @param to The recipient address
     * @param amountInWei The amount in wei to send
     * @param traceId A unique trace ID for the transaction
     */
    function issueFunds(address payable to, uint256 amountInWei, string calldata traceId) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amountInWei > 0, "Amount must be greater than zero");
        require(address(this).balance >= amountInWei, "Insufficient contract balance");

        totalIssued += amountInWei;
        to.transfer(amountInWei);

        emit FundsIssued(to, amountInWei, traceId);
    }

    /**
     * Withdraw funds from the contract by the owner
     * @param amount The amount in wei to withdraw
     * @param traceId A unique trace ID for tracking the withdrawal
     */
    function withdrawFunds(uint256 amount, string calldata traceId) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= address(this).balance, "Insufficient contract balance");

        payable(owner).transfer(amount);

        emit FundsWithdrawn(owner, amount, traceId);
    }

    /**
     * View the contract's Ether balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * Fallback function to receive Ether
     */
    receive() external payable {}
}


