const express = require('express');
const bitcoin = require('bitcoinjs-lib');
const ECPair = require('ecpair');
const tinysecp = require('tiny-secp256k1');
const cors = require('cors');
const crypto = require('crypto');

bitcoin.initEccLib(tinysecp);
const { ECPairFactory } = ECPair;
const ECPairLib = ECPairFactory(tinysecp);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/crear', (req, res) => {
  try {
    const clavePrivada = crypto.randomBytes(32);
    const parClaves = ECPairLib.fromPrivateKey(clavePrivada);
    const { address } = bitcoin.payments.p2pkh({ pubkey: parClaves.publicKey });

    res.json({
      exito: true,
      direccion_bitcoin: address,
      clave_privada_wif: parClaves.toWIF()
    });
  } catch (err) {
    res.status(500).json({ exito: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send(`
    <h1>✅ Bitcoin Dobmoney IA - ACTIVO</h1>
    <p>Creado por EVELIO</p>
    <p>👉 Ve a <a href="/crear">/crear</a></p>
  `);
});

app.listen(PORT, () => {
  console.log('✅ Servidor BitcoinDobmoney activo en puerto ' + PORT);
});
