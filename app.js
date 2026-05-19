// ========================================================
// BITCOIN DOB MONEY - SOLANA P2P APPLICATION
// Motor funcional completo v1.0
// ========================================================

const RPC = 'https://api.mainnet-beta.solana.com';
let connection, walletPubkey, videoStream = null;

// ========================================================
// INICIALIZACIÓN RPC
// ========================================================

async function initRPC() {
  try {
    connection = new solanaWeb3.Connection(RPC, 'confirmed');
    const version = await connection.getVersion();
    console.log('✅ RPC conectado:', version['solana-core']);
    return true;
  } catch (e) {
    console.error('❌ Error RPC:', e);
    showToast('Error conectando a RPC', 'error');
    return false;
  }
}

// ========================================================
// PHANTOM WALLET - CONEXIÓN
// ========================================================

async function connectWallet() {
  const provider = window.solana;
  
  if (!provider?.isPhantom) {
    showToast('⚠️ Instala Phantom Wallet', 'error');
    setTimeout(() => window.open('https://phantom.app/', '_blank'), 1000);
    return;
  }

  try {
    const resp = await provider.connect();
    walletPubkey = resp.publicKey.toString();
    
    // Listeners para cambios de cuenta
    provider.on('accountChanged', (pubkey) => {
      if (pubkey) {
        walletPubkey = pubkey.toString();
        onConnected();
      } else {
        disconnectWallet();
      }
    });

    onConnected();
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

async function onConnected() {
  if (!walletPubkey) return;

  // Actualizar UI
  const short = walletPubkey.slice(0, 4) + '...' + walletPubkey.slice(-4);
  
  const walletBtn = document.getElementById('wallet-btn');
  if (walletBtn) {
    walletBtn.textContent = short;
    walletBtn.classList.add('connected');
  }

  const mainConnectBtn = document.getElementById('main-connect-btn');
  if (mainConnectBtn) {
    mainConnectBtn.innerHTML = '✓ &nbsp;PHANTOM CONECTADA';
    mainConnectBtn.classList.add('connected');
  }

  const dispAddress = document.getElementById('disp-address');
  if (dispAddress) {
    dispAddress.textContent = walletPubkey.slice(0, 8) + '...' + walletPubkey.slice(-6);
  }

  const walletPanel = document.getElementById('wallet-panel');
  if (walletPanel) {
    walletPanel.classList.add('show');
  }

  await fetchBalance();
  showToast('✅ Wallet conectada', 'success');
}

async function disconnectWallet() {
  try {
    await window.solana?.disconnect();
  } catch (e) {
    console.error(e);
  }

  walletPubkey = null;

  const walletBtn = document.getElementById('wallet-btn');
  if (walletBtn) {
    walletBtn.textContent = 'Conectar';
    walletBtn.classList.remove('connected');
  }

  const mainConnectBtn = document.getElementById('main-connect-btn');
  if (mainConnectBtn) {
    mainConnectBtn.innerHTML = '<div class="btn-dot"></div> CONECTAR PHANTOM';
    mainConnectBtn.classList.remove('connected');
  }

  const walletPanel = document.getElementById('wallet-panel');
  if (walletPanel) {
    walletPanel.classList.remove('show');
  }

  const statSol = document.getElementById('stat-sol');
  if (statSol) {
    statSol.textContent = '—';
  }

  showToast('🔌 Wallet desconectada', 'info');
}

// ========================================================
// SALDO Y BALANCE
// ========================================================

async function fetchBalance() {
  if (!walletPubkey || !connection) return;

  try {
    const pk = new solanaWeb3.PublicKey(walletPubkey);
    const lamports = await connection.getBalance(pk);
    const sol = (lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(4);

    const dispBalance = document.getElementById('disp-balance');
    if (dispBalance) {
      dispBalance.textContent = sol + ' SOL';
    }

    const statSol = document.getElementById('stat-sol');
    if (statSol) {
      statSol.textContent = sol + ' SOL';
    }

    // Auto-refresh cada 30 segundos
    setTimeout(fetchBalance, 30000);
  } catch (e) {
    console.error('Error fetching balance:', e);
    const statSol = document.getElementById('stat-sol');
    if (statSol) {
      statSol.textContent = 'error';
    }
  }
}

// ========================================================
// CÁMARA
// ========================================================

async function toggleCamera() {
  const videoEl = document.getElementById('video');
  const cameraBtn = document.getElementById('cameraBtn');

  if (!videoEl || !cameraBtn) return;

  if (!videoStream) {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: false
      });
      videoEl.srcObject = videoStream;
      cameraBtn.textContent = '⏹️ Detener Cámara';
      cameraBtn.style.background = 'linear-gradient(135deg, #f87171, #ef4444)';
      showToast('🎥 Cámara activada', 'success');
    } catch (e) {
      showToast('❌ Cámara no disponible', 'error');
      console.error(e);
    }
  } else {
    videoStream.getTracks().forEach(track => track.stop());
    videoEl.srcObject = null;
    videoStream = null;
    cameraBtn.textContent = '🎥 Activar Cámara';
    cameraBtn.style.background = 'linear-gradient(135deg, #C6A4FF, #8A63FF)';
    showToast('⏹️ Cámara detenida', 'info');
  }
}

// ========================================================
// CHAT
// ========================================================

function sendMessage() {
  const msgInputEl = document.getElementById('msgInput');
  const chatBoxEl = document.getElementById('chatBox');

  if (!msgInputEl || !chatBoxEl) return;

  const text = msgInputEl.value.trim();
  if (!text) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'msg';
  msgDiv.textContent = '📤 ' + text;

  chatBoxEl.appendChild(msgDiv);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  msgInputEl.value = '';

  // Simular respuesta después de 500ms
  setTimeout(() => {
    const respDiv = document.createElement('div');
    respDiv.className = 'msg';
    respDiv.textContent = '🤖 [Sistema] Mensaje recibido';
    chatBoxEl.appendChild(respDiv);
    chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
  }, 500);
}

// ========================================================
// RED Y ESTADO
// ========================================================

async function checkNetworkStatus() {
  const networkStatusEl = document.getElementById('networkStatus');
  if (!networkStatusEl) return;

  try {
    const version = await connection.getVersion();
    networkStatusEl.innerHTML = `✅ Solana Mainnet (${version['solana-core']})`;
    networkStatusEl.style.color = '#10b981';
  } catch (e) {
    networkStatusEl.innerHTML = '❌ Sin conexión RPC';
    networkStatusEl.style.color = '#ef4444';
    setTimeout(checkNetworkStatus, 5000);
  }
}

// ========================================================
// NOTIFICACIONES (TOAST)
// ========================================================

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = msg;
  toast.className = 'show ' + type;

  clearTimeout(window._tt);
  window._tt = setTimeout(() => {
    toast.className = '';
  }, 3000);
}

// ========================================================
// EVENT LISTENERS
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Wallet buttons
  const walletBtn = document.getElementById('wallet-btn');
  const mainConnectBtn = document.getElementById('main-connect-btn');
  const disconnectBtn = document.getElementById('disconnect-btn');

  if (walletBtn) walletBtn.onclick = connectWallet;
  if (mainConnectBtn) mainConnectBtn.onclick = connectWallet;
  if (disconnectBtn) disconnectBtn.onclick = disconnectWallet;

  // Camera button
  const cameraBtn = document.getElementById('cameraBtn');
  if (cameraBtn) cameraBtn.onclick = toggleCamera;

  // Chat
  const sendBtn = document.getElementById('sendBtn');
  const msgInputEl = document.getElementById('msgInput');

  if (sendBtn) sendBtn.onclick = sendMessage;
  if (msgInputEl) {
    msgInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // Init
  initRPC().then(() => {
    checkNetworkStatus();
    
    // Auto-reconnect si Phantom está conectado
    if (window.solana?.isConnected && window.solana?.publicKey) {
      walletPubkey = window.solana.publicKey.toString();
      onConnected();
    }
  });
});

// ========================================================
// TRANSACCIONES (FUNCIÓN AUXILIAR)
// ========================================================

async function sendTransaction(toAddress, amount) {
  if (!walletPubkey || !connection) {
    showToast('Conecta tu wallet primero', 'error');
    return false;
  }

  try {
    const fromPubkey = new solanaWeb3.PublicKey(walletPubkey);
    const toPubkey = new solanaWeb3.PublicKey(toAddress);

    // Obtener blockhash reciente
    const { blockhash } = await connection.getLatestBlockhash();

    // Crear instrucción de transferencia
    const instruction = solanaWeb3.SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
    });

    // Construir transacción
    const transaction = new solanaWeb3.Transaction().add(instruction);
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    // Firmar y enviar
    const signedTx = await window.solana.signTransaction(transaction);
    const txid = await connection.sendRawTransaction(signedTx.serialize());

    // Esperar confirmación
    await connection.confirmTransaction(txid);

    showToast(`✅ Transacción: ${txid.slice(0, 10)}...`, 'success');
    return true;
  } catch (e) {
    showToast(`❌ Error: ${e.message}`, 'error');
    console.error(e);
    return false;
  }
}

// ========================================================
// UTILIDADES
// ========================================================

function getWalletAddress() {
  return walletPubkey;
}

function isWalletConnected() {
  return !!walletPubkey;
}

function getConnection() {
  return connection;
}

// Exportar para uso global
window.BitcoinDobMoney = {
  connectWallet,
  disconnectWallet,
  fetchBalance,
  toggleCamera,
  sendMessage,
  sendTransaction,
  getWalletAddress,
  isWalletConnected,
  getConnection,
  showToast
};
