const { ethers } = require('ethers');
const Web3 = require('web3');

// Initialize providers
const ethProvider = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
);

const web3 = new Web3(
  `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`
);

// Validate wallet address
const validateAddress = (address, network = 'ethereum') => {
  try {
    if (network === 'ethereum' || network === 'polygon' || network === 'bsc') {
      return ethers.utils.isAddress(address);
    }
    if (network === 'solana') {
      // Solana validation
      const base58 = require('bs58');
      try {
        const decoded = base58.decode(address);
        return decoded.length === 32;
      } catch {
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('Error validating address:', error);
    return false;
  }
};

// Get balance
const getBalance = async (address, network = 'ethereum', tokenAddress = null) => {
  try {
    if (network === 'ethereum') {
      const balance = await ethProvider.getBalance(address);
      return ethers.utils.formatEther(balance);
    }
    
    // For tokens, use Web3
    if (tokenAddress) {
      const ABI = ['function balanceOf(address) public view returns (uint256)'];
      const contract = new web3.eth.Contract(ABI, tokenAddress);
      const balance = await contract.methods.balanceOf(address).call();
      return web3.utils.fromWei(balance, 'ether');
    }
    
    return '0';
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// Send transaction
const sendTransaction = async (
  fromAddress,
  toAddress,
  amount,
  privateKey,
  network = 'ethereum',
  tokenAddress = null
) => {
  try {
    if (!validateAddress(toAddress, network)) {
      throw new Error('Dirección de destino inválida');
    }

    if (network === 'ethereum' || network === 'polygon' || network === 'bsc') {
      const wallet = new ethers.Wallet(privateKey, ethProvider);
      
      if (tokenAddress) {
        // Send token
        const ABI = [
          'function transfer(address to, uint256 amount) public returns (bool)'
        ];
        const contract = new ethers.Contract(tokenAddress, ABI, wallet);
        const amountWei = ethers.utils.parseEther(amount.toString());
        const tx = await contract.transfer(toAddress, amountWei);
        return tx.hash;
      } else {
        // Send native token
        const tx = await wallet.sendTransaction({
          to: toAddress,
          value: ethers.utils.parseEther(amount.toString())
        });
        return tx.hash;
      }
    }
    
    throw new Error('Red no soportada');
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

// Verify transaction
const verifyTransaction = async (txHash, network = 'ethereum') => {
  try {
    if (network === 'ethereum') {
      const receipt = await ethProvider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { confirmed: false, confirmations: 0 };
      }

      const currentBlock = await ethProvider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber;

      return {
        confirmed: receipt.status === 1,
        confirmations,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
        to: receipt.to
      };
    }
    
    return { confirmed: false, confirmations: 0 };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { confirmed: false, confirmations: 0 };
  }
};

// Get gas price
const getGasPrice = async (network = 'ethereum') => {
  try {
    if (network === 'ethereum') {
      const gasPrice = await ethProvider.getGasPrice();
      return {
        standard: ethers.utils.formatUnits(gasPrice, 'gwei'),
        fast: ethers.utils.formatUnits(gasPrice.mul(1.2), 'gwei'),
        fastest: ethers.utils.formatUnits(gasPrice.mul(1.5), 'gwei')
      };
    }
    
    return { standard: '0', fast: '0', fastest: '0' };
  } catch (error) {
    console.error('Error getting gas price:', error);
    return { standard: '0', fast: '0', fastest: '0' };
  }
};

// Calculate transaction fee
const calculateFee = async (network = 'ethereum', gasLimit = 21000) => {
  try {
    const gasPrice = await getGasPrice(network);
    const standardPrice = parseFloat(gasPrice.standard);
    const fee = (standardPrice * gasLimit) / 1e9; // Convert from wei to ETH
    
    return {
      standard: fee,
      fast: fee * 1.2,
      fastest: fee * 1.5
    };
  } catch (error) {
    console.error('Error calculating fee:', error);
    return { standard: 0, fast: 0, fastest: 0 };
  }
};

module.exports = {
  validateAddress,
  getBalance,
  sendTransaction,
  verifyTransaction,
  getGasPrice,
  calculateFee,
  ethProvider,
  web3
};
