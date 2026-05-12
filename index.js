const express = require('express');
const bitcoin = require('bitcoinjs-lib');
const tinysecp = require('tiny-secp256k1');
const ECPairFactory = require('ecpair').ECPairFactory;
const crypto = require('crypto');
const cors = require('cors');

bitcoin.initEccLib(tinysecp);
const ECPair = ECPairFactory(tinysecp);
const app = express();
app.use(express.json());
app.use(cors());

function crearWallet() {
    const keyPair = ECPair.makeRandom();
    const { address } = bitcoin.payments.p2pkh({
        pubkey: Buffer.from(keyPair.publicKey)
    });
    return {
        direccion: address,
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
        privateKey: keyPair.toWIF()
    };
}

const wallet = crearWallet();
console.log("Wallet creada:", wallet.direccion);

async function getBalance(address) {
    const res = await fetch(`https://blockstream.info/api/address/${address}`);
    const data = await res.json();
    const satoshis = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
    return satoshis / 100000000;
}

async function getTransacciones(address) {
    const res = await fetch(`https://blockstream.info/api/address/${address}/txs`);
    return await res.json();
}

app.get('/', (req, res) => {
    res.json({
        nombre: "BitcoinDobmoney IA",
        creador: "EVELIO",
        estado: "ACTIVA",
        wallet: wallet.direccion,
        rutas: ["/wallet", "/balance", "/transacciones"]
    });
});

app.get('/wallet', (req, res) => {
    res.json({
        direccion: wallet.direccion,
        publicKey: wallet.publicKey
    });
});

app.get('/balance', async (req, res) => {
    try {
        const balance = await getBalance(wallet.direccion);
        res.json({
            direccion: wallet.direccion,
            balanceBTC: balance,
            fuente: "blockstream.info"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/transacciones', async (req, res) => {
    try {
        const txs = await getTransacciones(wallet.direccion);
        res.json({
            direccion: wallet.direccion,
            total: txs.length,
            transacciones: txs.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/analizar/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const balance = await getBalance(address);
        const txs = await getTransacciones(address);
        res.json({
            IA: "BitcoinDobmoney",
            wallet: address,
            balance: balance,
            transacciones: txs.length,
            analisis: balance > 0 ? "Wallet activa con fondos" : "Wallet sin fondos aún"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BitcoinDobmoney IA corriendo en puerto ${PORT}`);
    console.log(`Wallet: ${wallet.direccion}`);
});
