const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const transactionsRoute = require('./routes/transactions');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/transactions', transactionsRoute);

app.listen(3000, () => {
  console.log('SADC CBDC backend running on port 3000');
});