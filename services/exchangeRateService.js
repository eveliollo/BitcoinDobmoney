const axios = require('axios');

const COINGECKO_API = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

// Get current price
const getPrice = async (cryptoId, vsCurrency = 'usd') => {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: cryptoId,
        vs_currencies: vsCurrency,
        include_market_cap: true,
        include_24hr_change: true
      }
    });

    return response.data[cryptoId] || null;
  } catch (error) {
    console.error('Error getting price:', error);
    return null;
  }
};

// Get multiple prices
const getPrices = async (cryptoIds = [], vsCurrency = 'usd') => {
  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: cryptoIds.join(','),
        vs_currencies: vsCurrency,
        include_market_cap: true,
        include_24hr_change: true
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting prices:', error);
    return {};
  }
};

// Get market data
const getMarketData = async (cryptoId) => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${cryptoId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false
      }
    });

    const data = response.data;
    return {
      id: data.id,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      image: data.image.large,
      currentPrice: data.market_data.current_price.usd,
      marketCap: data.market_data.market_cap.usd,
      volume24h: data.market_data.total_volume.usd,
      change24h: data.market_data.price_change_percentage_24h,
      change7d: data.market_data.price_change_percentage_7d_in_currency?.usd || 0,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      circulatingSupply: data.market_data.circulating_supply,
      totalSupply: data.market_data.total_supply,
      maxSupply: data.market_data.max_supply,
      ath: data.market_data.ath.usd,
      atl: data.market_data.atl.usd
    };
  } catch (error) {
    console.error('Error getting market data:', error);
    return null;
  }
};

// Calculate exchange rate
const calculateExchangeRate = async (fromCrypto, toCrypto, amount) => {
  try {
    const fromPrice = await getPrice(fromCrypto, 'usd');
    const toPrice = await getPrice(toCrypto, 'usd');

    if (!fromPrice || !toPrice) {
      throw new Error('No se pudieron obtener precios');
    }

    const fromPriceUSD = fromPrice.usd;
    const toPriceUSD = toPrice.usd;

    const exchangeRate = fromPriceUSD / toPriceUSD;
    const receivedAmount = amount * exchangeRate;

    return {
      exchangeRate,
      receivedAmount,
      fromPrice: fromPriceUSD,
      toPrice: toPriceUSD
    };
  } catch (error) {
    console.error('Error calculating exchange rate:', error);
    return null;
  }
};

// Get historical data
const getHistoricalData = async (cryptoId, days = 7) => {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/${cryptoId}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days,
        interval: 'daily'
      }
    });

    return {
      prices: response.data.prices,
      marketCaps: response.data.market_caps,
      volumes: response.data.volumes
    };
  } catch (error) {
    console.error('Error getting historical data:', error);
    return null;
  }
};

// Get trending cryptos
const getTrending = async () => {
  try {
    const response = await axios.get(`${COINGECKO_API}/search/trending`);
    return response.data.coins.slice(0, 10).map(coin => ({
      id: coin.item.id,
      name: coin.item.name,
      symbol: coin.item.symbol.toUpperCase(),
      image: coin.item.large,
      price: coin.item.data.price,
      priceChange24h: coin.item.data.price_change_percentage_24h?.usd || 0,
      marketCap: coin.item.data.market_cap
    }));
  } catch (error) {
    console.error('Error getting trending:', error);
    return [];
  }
};

// Supported cryptos
const SUPPORTED_CRYPTOS = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'usd-coin': 'USDC',
  'tether': 'USDT',
  'polygon': 'MATIC',
  'binancecoin': 'BNB',
  'solana': 'SOL',
  'cardano': 'ADA',
  'ripple': 'XRP',
  'dogecoin': 'DOGE'
};

module.exports = {
  getPrice,
  getPrices,
  getMarketData,
  calculateExchangeRate,
  getHistoricalData,
  getTrending,
  SUPPORTED_CRYPTOS
};