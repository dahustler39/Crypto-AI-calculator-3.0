const cryptoSelect = document.getElementById('crypto');
const priceDisplay = document.getElementById('price-display');
const ctx = document.getElementById('priceChart').getContext('2d');
let chart;
let currentPrice = 0;
let darkMode = true;

// Fetch trending pairs from Dexscreener
async function fetchTopCoins() {
  const res = await fetch('https://api.dexscreener.com/latest/dex/pairs');
  const data = await res.json();
  const pairs = data.pairs.slice(0, 50); // Top 50 pairs

  cryptoSelect.innerHTML = '';
  pairs.forEach(pair => {
    const option = document.createElement('option');
    option.value = pair.pairAddress;
    option.text = `${pair.baseToken.symbol} / ${pair.quoteToken.symbol}`;
    option.setAttribute('data-price', pair.priceUsd);
    option.setAttribute('data-symbol', pair.baseToken.symbol);
    cryptoSelect.appendChild(option);
  });

  fetchPrice();
}

async function fetchPrice() {
  const selectedOption = cryptoSelect.options[cryptoSelect.selectedIndex];
  const pairAddress = selectedOption.value;
  const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${pairAddress}`);
  const data = await res.json();
  const price = parseFloat(data.pair.priceUsd);

  currentPrice = price;
  priceDisplay.textContent = `Live Price (${data.pair.baseToken.symbol}): $${price.toFixed(6)}`;
}

function calculateReturn() {
  const quantity = parseFloat(document.getElementById('quantity').value);
  const years = parseInt(document.getElementById('years').value);
  const sellPrice = parseFloat(document.getElementById('sell-price').value);

  if (isNaN(quantity) || isNaN(sellPrice)) {
    document.getElementById('result').textContent = 'Please enter valid values.';
    return;
  }

  const futureValue = quantity * sellPrice;
  const initialInvestment = quantity * currentPrice;
  const profit = futureValue - initialInvestment;

  document.getElementById('result').innerHTML = `
    Initial Investment:
