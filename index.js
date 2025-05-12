import Web3 from "web3";
import fetch from "node-fetch";

// Configuration
const PAYSTACK_SECRET_KEY = "sk_test_your_paystack_secret_key"; // Replace with your Paystack secret key
const CONTRACT_ADDRESS = "0xYourContractAddress"; // Replace with your deployed contract address
const CONTRACT_ABI = [/* Replace with your contract's ABI */]; //TRACT_ABI, CONTRACT_ADDRESS);

export default {
  async fetch(request) {
    const { method, url } = request;

    if (method === "POST") {
      const data = await request.json();

      // Handle different routes
      if (url.endsWith("/api/sendNotification")) {
        return await sendSmsNotification(data);
      } else if (url.endsWith("/api/verifyPayment")) {
        return await verifyPaystackPayment(data);
      } else if (url.endsWith("/api/depositToContract")) {
        return await depositToSmartContract(data);
      }
    }

    return new Response("Method not allowed", { status: 405 });
  },
};

// Function to send SMS notifications
async function sendSmsNotification(data) {
  const message = `CBDC Tx: R${data.amount} sent by ${data.sender}`;

  try {
    const smsResp = await fetch("https://sms-api.com/send", {
      method: "POST",
      body: JSON.stringify({ to: data.phone, msg: message }),
      headers: { "Content-Type": "application/json" },
    });

    if (smsResp.ok) {
      return new Response("Notification Sent", { status: 200 });
    } else {
      return new Response("Failed to Send Notification", { status: 500 });
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Function to verify Paystack payment
async function verifyPaystackPayment(data) {
  const { reference } = data;

  if (!reference) {
    return new Response("Payment reference is required", { status: 400 });
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (result.status && result.data.status === "success") {
      return new Response(JSON.stringify({ success: true, message: "Payment verified", data: result.data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Payment verification failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Function to deposit fees and taxes to the smart contract
async function depositToSmartContract(data) {
  const { senderAddress, privateKey, amountInEther } = data;

  if (!senderAddress || !privateKey || !amountInEther) {
    return new Response("Missing required fields (senderAddress, privateKey, amountInEther)", { status: 400 });
  }

  try {
    const amountInWei = web3.utils.toWei(amountInEther.toString(), "ether");

    const transaction = contract.methods.depositFeesAndTaxes();
    const txData = {
      from: senderAddress,
      to: CONTRACT_ADDRESS,
      gas: 2000000,
      data: transaction.encodeABI(),
      value: amountInWei,
    };

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return new Response(
      JSON.stringify({ success: true, message: "Deposit successful", transactionHash: receipt.transactionHash }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error depositing to contract:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}