const coinSelect = document.getElementById('coin-select');
const priceDisplay = document.getElementById('price-display');
const refreshBtn = document.getElementById('refresh-btn');
const quantityInput = document.getElementById('quantity-input');
const holdingInput = document.getElementById('holding-input');
const sellPriceInput = document.getElementById('sellprice-input');
const calcBtn = document.getElementById('calc-btn');
const profitDisplay = document.getElementById('profit-display');
const ctx = document.getElementById('price-chart').getContext('2d');
let chartInstance;

// Load top 100 coins from CoinGecko
async function loadCoins() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
    const coins = await res.json();

    coins.forEach(coin => {
      const option = document.createElement('option');
      option.value = coin.id;
      option.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
      coinSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading coins:', error);
  }
}

// Fetch live price of selected coin
async function fetchPrice(coinId) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
    const data = await res.json();
    return data[coinId]?.usd ?? null;
  } catch (error) {
    console.error('Error fetching price:', error);
    return null;
  }
}

// Fetch historical prices (last 30 days)
async function fetchHistoricalPrices(coinId, days = 30) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
    const data = await res.json();
    return data.prices; // [[timestamp, price], ...]
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    return [];
  }
}

// Draw Chart.js chart
async function drawChart(coinId) {
  const prices = await fetchHistoricalPrices(coinId);
  if (chartInstance) {
    chartInstance.destroy();
  }
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices.map(p => new Date(p[0]).toLocaleDateString()),
      datasets: [{
        label: 'Price (USD)',
        data: prices.map(p => p[1]),
        borderColor: '#f97316', // orange
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        fill: true,
        tension: 0.2,
        pointRadius: 0,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: true },
        y: { beginAtZero: false }
      },
      plugins: {
        legend: { labels: { color: '#60a5fa' } }
      }
    }
  });
}

// Refresh price and chart
async function refreshData() {
  const coinId = coinSelect.value;
  priceDisplay.textContent = 'Live Price: Loading...';

  const price = await fetchPrice(coinId);
  if (price === null) {
    priceDisplay.textContent = 'Live Price: Error fetching price';
    return;
  }
  priceDisplay.textContent = `Live Price: $${price.toFixed(4)}`;

  await drawChart(coinId);
  profitDisplay.textContent = '';
}

// Calculate profit/loss
function calculateProfit() {
  const coinId = coinSelect.value;
  const currentPriceText = priceDisplay.textContent;
  if (!currentPriceText.includes('$')) {
    profitDisplay.textContent = 'Please refresh price first.';
    return;
  }
  const currentPrice = parseFloat(currentPriceText.split('$')[1]);
  const quantity = parseFloat(quantityInput.value);
  const sellPrice = parseFloat(sellPriceInput.value);
  const holdingYears = parseFloat(holdingInput.value);

  if (isNaN(quantity) || quantity <= 0) {
    profitDisplay.textContent = 'Please enter a valid quantity.';
    return;
  }
  if (isNaN(sellPrice) || sellPrice <= 0) {
    profitDisplay.textContent = 'Please enter a valid sell price.';
    return;
  }
  if (isNaN(holdingYears) || holdingYears < 0 || holdingYears > 50) {
    profitDisplay.textContent = 'Please enter a holding period between 0 and 50 years.';
    return;
  }

  const investedAmount = currentPrice * quantity;
  const sellAmount = sellPrice * quantity;
  const profitLoss = sellAmount - investedAmount;
  const profitLossPercent = (profitLoss / investedAmount) * 100;

  profitDisplay.textContent = `You invested $${investedAmount.toFixed(2)} and if you sell at $${sellPrice.toFixed(2)} after ${holdingYears} year(s), your profit/loss will be $${profitLoss.toFixed(2)} (${profitLossPercent.toFixed(2)}%)`;
}

// Event listeners
refreshBtn.addEventListener('click', refreshData);
calcBtn.addEventListener('click', calculateProfit);

window.onload = async () => {
  await loadCoins();
  coinSelect.value = 'bitcoin'; // default coin
  await refreshData();
  coinSelect.addEventListener('change', refreshData);
};
