
import Web3 from "web3";
import fetch from "node-fetch";
import twilio from "twilio";

// Blockchain Config
const CONTRACT_ADDRESS = "0x40ccc6bf35440Fe7041b3b4bB9e20C4ABd6760e6";
const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsIssued",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
const INFURA_PROJECT_ID = "123abc456def789ghi";
const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`);
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

// Twilio Config (update with actual values)
const TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace
const TWILIO_AUTH_TOKEN = "your_auth_token";                     // Replace
const TWILIO_VERIFY_SID = "VA63c1fe6eb6b6946abf3f469f6cf6f652"; // Found in your verifier.html

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default {
  async fetch(request) {
    const { method, url } = request;

    if (method === "POST" && url.endsWith("/api/issueFunds")) {
      return await issueFunds(request);
    }

    if (method === "POST" && url.endsWith("/api/verifyAccount")) {
      return await verifyAccount(request);
    }

    if (method === "POST" && url.endsWith("/api/sendOtp")) {
      return await sendOtp(request);
    }

    if (method === "POST" && url.endsWith("/api/verifyOtp")) {
      return await verifyOtp(request);
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};

// Issue Funds
async function issueFunds(request) {
  try {
    const { recipientAddress, amountInRand, privateKey } = await request.json();

    if (!recipientAddress || !amountInRand || !privateKey) {
      return new Response("Missing required fields", { status: 400 });
    }

    if (!web3.utils.isAddress(recipientAddress)) {
      return new Response(JSON.stringify({ error: "Invalid Ethereum address" }), { status: 400 });
    }

    const amountInWei = Web3.utils.toWei((amountInRand * 0.00000001).toString(), "ether");
    const transaction = contract.methods.issueFunds(recipientAddress, amountInWei);

    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const txData = {
      from: account.address,
      to: CONTRACT_ADDRESS,
      gas: 2000000,
      data: transaction.encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return new Response(JSON.stringify({
      success: true,
      message: "Funds issued successfully",
      transactionHash: receipt.transactionHash
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("IssueFunds error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// Account Verification
async function verifyAccount(request) {
  try {
    const { walletAddress } = await request.json();

    if (!web3.utils.isAddress(walletAddress)) {
      return new Response(JSON.stringify({ valid: false, message: "Invalid Ethereum address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const contractBalance = await contract.methods.getContractBalance().call();
    const balanceInEther = web3.utils.fromWei(contractBalance, "ether");

    return new Response(JSON.stringify({
      valid: true,
      walletAddress,
      contractBalanceInEther: balanceInEther
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("VerifyAccount error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// Send OTP via Twilio
async function sendOtp(request) {
  try {
    const { phoneNumber } = await request.json();

    const verification = await twilioClient.verify.services(TWILIO_VERIFY_SID).verifications.create({
      to: phoneNumber,
      channel: "sms"
    });

    return new Response(JSON.stringify({ status: verification.status }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return new Response(JSON.stringify({ error: "Failed to send OTP" }), { status: 500 });
  }
}

// Verify OTP Code
async function verifyOtp(request) {
  try {
    const { phoneNumber, code } = await request.json();

    const verificationCheck = await twilioClient.verify.services(TWILIO_VERIFY_SID).verificationChecks.create({
      to: phoneNumber,
      code: code
    });

    return new Response(JSON.stringify({ valid: verificationCheck.valid }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return new Response(JSON.stringify({ error: "Failed to verify code" }), { status: 500 });
  }
}
