
app.use(cors());
app.use(express.json());

// Generador de billeteras Bitcoin
app.get('/crear', (req, res) => {
  const keyPair = bitcoin.ECPair.makeRandom();
  const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
  const privateKey = keyPair.toWIF();

  res.json({
    direccion_bitcoin: address,
    clave_privada: privateKey
  });
});

app.get('/', (req, res) => {
  res.send('✅ BitcoinDobmoney FUNCIONANDO | Ve a /crear para generar tu billetera');
});

app.listen(port, () => {
  console.log(`✅ Servidor activo en puerto ${port}`);
});
