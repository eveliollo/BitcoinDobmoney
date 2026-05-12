
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function askAI(message, context) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: `Eres BitcoinDobmoney IA, experto en crypto P2P creado por EVELIO. Contexto: ${context}. Responde en español, corto y claro.` },
        { role: 'user', content: message }
      ],
      max_tokens: 300
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Error de IA';
}

async function getBTCPrice() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
  return await res.json();
}

let users = {};
let offers = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/prices', async (req, res) => {
  try { res.json(await getBTCPrice()); } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai', async (req, res) => {
  try {
    const prices = await getBTCPrice();
    const context = `BTC:$${prices.bitcoin?.usd} ETH:$${prices.ethereum?.usd} SOL:$${prices.solana?.usd}`;
    res.json({ reply: await askAI(req.body
