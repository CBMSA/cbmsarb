export default {
  async fetch(request) {
    const { method } = request;
    if (method === 'POST') {
      const data = await request.json();
      const message = \`CBDC Tx: R\${data.amount} sent by \${data.sender}\`;

      const smsResp = await fetch("https://sms-api.com/send", {
        method: 'POST',
        body: JSON.stringify({ to: data.phone, msg: message }),
        headers: { 'Content-Type': 'application/json' }
      });

      return new Response('Notification Sent', { status: 200 });
    }
    return new Response('Method not allowed', { status: 405 });
  }
}