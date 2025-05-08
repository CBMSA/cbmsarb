# SADC CBDC Backend + Cloudflare Worker

## Setup

1. Install dependencies:
```bash
npm install express body-parser cors oracledb dotenv
```

2. Configure `.env` from `.env.example`

3. Run backend:
```bash
node server/app.js
```

4. Deploy Cloudflare worker with:
```bash
wrangler publish
```

## Features

- CBDC Transaction Logging with Fee + Tax
- Oracle DB Integration
- Cloudflare Worker for SMS notifications