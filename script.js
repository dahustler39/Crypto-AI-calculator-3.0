const coinSelect = document.getElementById('coinSelect');
const livePriceSpan = document.getElementById('livePrice');
const refreshBtn = document.getElementById('refreshPrice');

const quantityInput = document.getElementById('quantity');
const holdingPeriodInput = document.getElementById('holdingPeriod');
const sellPriceInput = document.getElementById('sellPrice');

const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');
const ctx = document.getElementById('returnChart').getContext('2d');
let returnChart = null;

let coins = [];
let currentCoinId = null;
let currentLivePrice = 0;

// Fetch top 100 coins from CoinGecko
async function fetchCoins() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
    const data = await res.json();
    coins = data;
    populateCoinSelect();
  } catch (error) {
    alert('Failed to load coin list. Please refresh.');
  }
}

// Populate select dropdown
function populateCoinSelect() {
  coinSelect.innerHTML = '';
  coins.forEach(coin => {
    const option = document.createElement('option');
    option.value = coin.id;
    option.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
    coinSelect.appendChild(option);
  });

  // Set default selected coin
  if(coins.length > 0) {
    coinSelect.value = coins[0].id;
    currentCoinId = coins[0].id;
    fetchLivePrice(currentCoinId);
  }
}

// Fetch live price of selected coin
async function fetchLivePrice(coinId) {
  livePriceSpan.textContent = '...';
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const data = await res.json();
    currentLivePrice = data[coinId]?.usd || 0;
    livePriceSpan.textContent = currentLivePrice.toFixed(4);
  } catch (error) {
    livePriceSpan.textContent = '--';
    alert('Failed to fetch live price.');
  }
}

// Calculate return
function calculateReturn() {
  const quantity = parseFloat(quantityInput.value);
  const holdingYears = parseInt(holdingPeriodInput.value);
  const sellPrice = parseFloat(sellPriceInput.value);

  if(!quantity || quantity <= 0 || quantity > 100000000) {
    resultDiv.textContent = 'Enter valid Quantity (max 100 million).';
    return;
  }

  if(!holdingYears || holdingYears < 0 || holdingYears > 50) {
    resultDiv.textContent = 'Enter valid Holding Period (0-50 years).';
    return;
  }

  if(!sellPrice || sellPrice <= 0) {
    resultDiv.textContent = 'Enter valid Sell Price.';
    return;
  }

  if(currentLivePrice === 0) {
    resultDiv.textContent = 'Live price not available.';
    return;
  }

  const initialInvestment = quantity * currentLivePrice;
  const finalValue = quantity * sellPrice;
  const profit = finalValue - initialInvestment;
  const roi = (profit / initialInvestment) * 100;

  const profitStr = profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`;
  const roiStr = roi >= 0 ? `+${roi.toFixed(2)}%` : `${roi.toFixed(2)}%`;

  resultDiv.innerHTML = `
