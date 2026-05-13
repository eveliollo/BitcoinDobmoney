const express = require("express");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/status", (req, res) => {
  res.json({
    online: true,
    app: "BitcoinDobmoney",
    server: "activo",
    time: new Date()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
