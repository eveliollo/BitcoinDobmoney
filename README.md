# 💰 BitcoinDobmoney - Solana P2P Trading Platform

## 🚀 Descripción

**BitcoinDobmoney** es una aplicación descentralizada (DApp) construida en **Solana** que permite a los usuarios operar criptomonedas de forma segura y sin custodia a través de Phantom Wallet. La plataforma combina comunicación P2P en tiempo real con integración directa a la blockchain de Solana.

### Características Principales

✅ **Conexión Phantom Wallet** - Autenticación segura sin custodia  
✅ **Balance en tiempo real** - Saldo SOL actualizado desde la blockchain  
✅ **Cámara web integrada** - Video en vivo para verificación P2P  
✅ **Chat P2P** - Comunicación directa entre usuarios  
✅ **Red Solana Mainnet** - Transacciones rápidas y económicas  
✅ **Interfaz moderna** - Dark theme con gradientes púrpura y verde mint  
✅ **Responsive design** - Compatible con desktop, tablet y mobile  

---

## 📂 Estructura del Proyecto

```
BitcoinDobmoney/
├── index.html           # Página principal (landing)
├── style.css            # Estilos completos (CSS externo)
├── app.js               # Lógica de Solana, Phantom y chat
├── README.md            # Este archivo
└── solana-p2p.html      # Página avanzada P2P (opcional)
```

---

## 🛠️ Requisitos Previos

1. **Navegador moderno** (Chrome, Firefox, Edge, Safari)
2. **Phantom Wallet** - Extensión o app móvil
   - Descargar: https://phantom.app/
3. **Cuenta en Solana Mainnet** con SOL para gas fees
4. **Acceso a internet** (conexión a RPC de Solana)

---

## 🔧 Instalación y Uso

### Opción 1: GitHub Pages (Recomendado)

1. El proyecto ya está hosteado en GitHub Pages
2. Acceder a: https://eveliollo.github.io/BitcoinDobmoney/
3. Conectar Phantom Wallet
4. ¡Listo!

### Opción 2: Uso Local

```bash
# Clonar el repositorio
git clone https://github.com/eveliollo/BitcoinDobmoney.git
cd BitcoinDobmoney

# Servir localmente (necesita un servidor HTTP)
python -m http.server 8000
# o
npx http-server

# Abrir en navegador
http://localhost:8000
```

---

## 📖 Guía de Uso

### 1️⃣ Conectar Wallet

1. Hacer clic en **"Conectar"** en la esquina superior derecha
2. Aprobar la conexión en Phantom
3. Ver tu dirección y saldo SOL

### 2️⃣ Ver Balance

- El balance se actualiza automáticamente cada 30 segundos
- Se muestra en SOL (◎) desde la blockchain de Solana
- Consulta en vivo: Solana Mainnet

### 3️⃣ Usar la Cámara

1. Hacer clic en **"🎥 Activar Cámara"**
2. Permitir acceso a la cámara en el navegador
3. La transmisión aparece en el recuadro de video
4. Hacer clic en **"⏹️ Detener Cámara"** para terminar

### 4️⃣ Chat P2P

1. Escribir mensaje en el campo de entrada
2. Presionar **Enter** o hacer clic en **"Enviar"**
3. Los mensajes aparecen en tiempo real
4. Sistema de confirmación automática

### 5️⃣ Plataforma Avanzada

- Hacer clic en **"NexTrade P2P"** para acceder a funcionalidades avanzadas
- Combina: Video + IA + Transacciones SOL/SPL/NFT

---

## 🔌 API y Endpoints

### RPC de Solana
```
Mainnet: https://api.mainnet-beta.solana.com
```

### Funciones Disponibles (app.js)

```javascript
// Wallet
connectWallet()                    // Conectar Phantom
disconnectWallet()                // Desconectar
isWalletConnected()               // Verificar conexión

// Balance
fetchBalance()                    // Obtener saldo SOL

// Transacciones
sendTransaction(address, amount)  // Enviar SOL

// Cámara
toggleCamera()                    // Activar/desactivar

// Chat
sendMessage()                     // Enviar mensaje

// Utilidades
getWalletAddress()               // Dirección de wallet
getConnection()                  // Conexión RPC
showToast(msg, type)            // Notificación
```

---

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo principal | `#050508` | Background |
| Superficie | `#0d0d14` | Cards |
| Acento púrpura | `#7c3aed` | Botones primarios |
| Acento verde | `#06d6a0` | Estados, badges |
| Acento naranja | `#f59e0b` | Advertencias |
| Peligro | `#ef4444` | Errores |
| Éxito | `#10b981` | Confirmaciones |

---

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px
- **Small mobile**: < 480px

---

## 🔒 Seguridad

✅ **Sin custodia** - Las claves privadas nunca salen de tu wallet  
✅ **Phantom validado** - Solo usa extensión oficial  
✅ **HTTPS recomendado** - Usa siempre conexión segura  
✅ **Open source** - Código verificable en GitHub  
✅ **Mainnet oficial** - Conecta a Solana Mainnet verificado  

---

## ⚠️ Disclaimers

- Este es software experimental. **Usa bajo tu propio riesgo**
- No es auditoría de seguridad profesional
- Guarda tus frases seed de forma segura
- Nunca compartas tu clave privada
- Verifica siempre la dirección del destinatario

---

## 🚀 Roadmap

- [ ] Soporte para tokens SPL (USDC, USDT, etc.)
- [ ] Transacciones de NFT
- [ ] Escrow y arbitraje P2P
- [ ] Sistema de reputación
- [ ] Historial de transacciones
- [ ] Dark/Light mode toggle
- [ ] Soporte multi-idioma
- [ ] Mobile app nativa

---

## 📞 Soporte y Contacto

- **GitHub**: https://github.com/eveliollo/BitcoinDobmoney
- **Issues**: Reportar bugs en GitHub
- **Discussiones**: Comunidad en GitHub Discussions

---

## 📜 Licencia

MIT License - Libre para usar, modificar y distribuir

```
Copyright (c) 2024 BitcoinDobmoney Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📊 Estadísticas del Proyecto

- **Lenguaje principal**: JavaScript (HTML5, CSS3)
- **Blockchain**: Solana
- **Wallet**: Phantom
- **RPC Node**: QuickNode / Alchemy (vía api.mainnet-beta.solana.com)
- **Estado**: ✅ Activo y en desarrollo

---

## 🎓 Aprender Más

- [Solana Docs](https://docs.solana.com/)
- [Phantom Wallet Docs](https://docs.phantom.app/)
- [Web3.js API Reference](https://solana-labs.github.io/solana-web3.js/)
- [Solana Pay](https://solanapay.com/)

---

## 💝 Donaciones

Si te es útil, considera apoyar:

- **Solana**: `solana-address-aqui`
- **GitHub Sponsors**: ⭐ Star este repositorio

---

**Hecho con ❤️ para la comunidad Solana**

*Last updated: 2024*
