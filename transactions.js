const express = require('express');
const router = express.Router();
const db = require('../db/oracle');

router.post('/transfer', async (req, res) => {
  const { from, to, amount } = req.body;
  const fee = amount * 0.005;
  const tax = amount * 0.015;
  const net = amount - fee - tax;

  await db.logTransaction(from, to, amount, fee, tax, net);

  res.json({ success: true, message: 'CBDC transfer complete', net });
});

module.exports = router;