const oracledb = require('oracledb');

async function logTransaction(from, to, amount, fee, tax, net) {
  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONN
  });

  await conn.execute(
    \`INSERT INTO cbdc_transactions (sender, receiver, amount, fee, tax, net_amount, tx_time)
     VALUES (:from, :to, :amount, :fee, :tax, :net, SYSDATE)\`,
    { from, to, amount, fee, tax, net },
    { autoCommit: true }
  );

  await conn.close();
}

module.exports = { logTransaction };