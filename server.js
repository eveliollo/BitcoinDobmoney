
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Usar CORS para permitir conexiones
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal: cargar el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Usar el puerto que asigna Render, o el 10000 por defecto
const PORT = process.env.PORT || 10000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
