
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CBDCWallet {
    address public owner;
    uint256 public totalIssued;

    // Mapping to track balances by address (if needed)
    mapping(address => uint256) public issuedBalances;

    event FundsIssued(address indexed to, uint256 amount, string traceId);
    event FundsWithdrawn(address indexed by, uint256 amount, string traceId);
    event Received(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Issue funds to a recipient (admin or user) with trace ID
    function issueFunds(address payable to, uint256 amountInWei, string calldata traceId) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(amountInWei > 0, "Amount must be greater than zero");
        require(address(this).balance >= amountInWei, "Insufficient contract balance");

        totalIssued += amountInWei;
        issuedBalances[to] += amountInWei;
        to.transfer(amountInWei);

        emit FundsIssued(to, amountInWei, traceId);
    }

    // Owner-only withdrawal from contract
    function withdrawFunds(uint256 amount, string calldata traceId) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(address(this).balance >= amount, "Insufficient balance");

        payable(owner).transfer(amount);

        emit FundsWithdrawn(owner, amount, traceId);
    }

    // View balance held by this contract
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // View total funds issued to a specific address
    function getIssuedBalance(address account) external view returns (uint256) {
        return issuedBalances[account];
    }

    // Receive Ether from admin or users
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }
}



