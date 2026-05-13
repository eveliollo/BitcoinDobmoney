const express = require("express");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const app = express();

// Seguridad HTTP
app.use(helmet());

// Compresión de archivos
app.use(compression());

// Manejo de datos JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API de estado real
app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        app: "BitcoinDobmoney",
        server: "activo",
        time: new Date()
    });
});

// Página de error 404
app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada"
    });
});

// Puerto para Render
const PORT = process.env.PORT || 10000;

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
    console.log(`
====================================
🚀 BITCOINDOBMONEY ONLINE
🌍 PUERTO: ${PORT}
✅ SERVIDOR ACTIVO
====================================
`);
});
