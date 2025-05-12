import Web3 from "web3";
import fetch from "node-fetch";

// Configuration
const CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace with your deployed contract address
const CONTRACT_ABI = [/* Replace with your contract ABI */]; // Replace with the ABI of your smart contract
const INFURA_PROJECT_ID = "your_infura_project_id"; // Replace with your Infura Project ID
const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

export default {
  async fetch(request) {
    const { method, url } = request;

    if (method === "POST" && url.endsWith("/api/issueFunds")) {
      return await issueFunds(request);
    }

    return new Response("Method not allowed", { status: 405 });
  },
};

// Function to issue funds
async function issueFunds(request) {
  const { recipientAddress, amountInRand, privateKey } = await request.json();

  if (!recipientAddress || !amountInRand || !privateKey) {
    return new Response("Missing required fields (recipientAddress, amountInRand, privateKey)", { status: 400 });
  }

  try {
    // Convert Rand to Wei (assuming 1 Rand = 0.00000001 Ether as an example)
    const amountInWei = Web3.utils.toWei((amountInRand * 0.00000001).toString(), "ether");

    const transaction = contract.methods.issueFunds(recipientAddress, amountInWei);
    const txData = {
      from: recipientAddress,
      to: CONTRACT_ADDRESS,
      gas: 2000000,
      data: transaction.encodeABI(),
    };

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return new Response(
      JSON.stringify({ success: true, message: "Funds issued successfully", transactionHash: receipt.transactionHash }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error issuing funds:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}