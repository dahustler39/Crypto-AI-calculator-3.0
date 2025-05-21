const cryptoSelect = document.getElementById('crypto');
const priceDisplay = document.getElementById('price-display');
const ctx = document.getElementById('priceChart').getContext('2d');
const rangeSelect = document.getElementById('range');
let chart;
let currentPrice = 0;
let darkMode = true;

async function fetchTopCoins() {
  const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1');
  const data = await res.json();
  cryptoSelect.innerHTML = '';
  data.forEach(coin => {
    const option = document.createElement('option');
    option.value = coin.id;
    option.text = `${coin.name} (${coin.symbol.toUpperCase()})`;
    cryptoSelect.appendChild(option);
  });
  fetchPrice();
  drawChart();
}

async function fetchPrice() {
  const coinId = cryptoSelect.value;
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
  const data = await res.json();
  currentPrice = data[coinId].usd;
  priceDisplay.textContent = `Live Price: $${currentPrice}`;
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
    Initial Investment: $${initialInvestment.toFixed(2)}<br>
    Future Value: $${futureValue.toFixed(2)}<br>
    Estimated Profit: $${profit.toFixed(2)}
  `;
}

async function drawChart() {
  const coinId = cryptoSelect.value;
  const days = rangeSelect.value;
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`);
  const data = await res.json();
  const labels = data.prices.map(p => new Date(p[0]).toLocaleDateString());
  const prices = data.prices.map(p => p[1]);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Price (${days}d)`,
        data: prices,
        borderColor: '#03a9f4',
        backgroundColor: 'rgba(3, 169, 244, 0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: darkMode ? 'white' : 'black' }
        }
      },
      scales: {
        x: {
          ticks: { color: darkMode ? 'white' : 'black' }
        },
        y: {
          ticks: { color: darkMode ? 'white' : 'black' }
        }
      }
    }
  });
}

function toggleTheme() {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? '#121212' : '#f0f0f0';
  document.body.style.color = darkMode ? '#ffffff' : '#000000';
  drawChart();
}

function downloadCSV() {
  const quantity = parseFloat(document.getElementById('quantity').value);
  const years = parseInt(document.getElementById('years').value);
  const sellPrice = parseFloat(document.getElementById('sell-price').value);
  const csv = `Crypto,Quantity,Current Price,Expected Sell Price,Years Held,Initial Investment,Future Value,Profit\n` +
    `${cryptoSelect.options[cryptoSelect.selectedIndex].text},${quantity},${currentPrice},${sellPrice},${years},${(quantity * currentPrice).toFixed(2)},${(quantity * sellPrice).toFixed(2)},${(quantity * sellPrice - quantity * currentPrice).toFixed(2)}`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'crypto_return.csv';
  a.click();
}

document.getElementById('refresh').addEventListener('click', () => {
  fetchPrice();
  drawChart();
});

cryptoSelect.addEventListener('change', () => {
  fetchPrice();
  drawChart();
});

rangeSelect.addEventListener('change', drawChart);

fetchTopCoins();

