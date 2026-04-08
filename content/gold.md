---
title: "黄金市场"
date: 2026-04-08
draft: false
---

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js">

<div class="gold-dashboard">
  <div class="current-price-card">
    <h2>当前黄金价格 (XAU/USD)</h2>
    <div class="price-display" id="currentPrice">加载中...</div>
    <div class="price-time" id="priceTime">--</div>
  </div>
  
  <div class="chart-card">
    <h3>历史价格走势</h3>
    <canvas id="goldChart"></canvas>
  </div>
</div>

<script>
async function loadGoldData() {
  try {
    const response = await fetch('/gold-data/history.json');
    const data = await response.json();
    
    if (data.length > 0) {
      const latest = data[data.length - 1];
      document.getElementById('currentPrice').textContent = '$' + latest.price.toFixed(2);
      document.getElementById('priceTime').textContent = latest.datetime;
      
      const labels = data.slice(-50).map(d => d.datetime.split(' ')[1]);
      const prices = data.slice(-50).map(d => d.price);
      
      const ctx = document.getElementById('goldChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '黄金价格 (USD)',
            data: prices,
            borderColor: '#d4af37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true }
          },
          scales: {
            y: {
              ticks: { callback: v => '$' + v }
            }
          }
        }
      });
    }
  } catch (e) {
    document.getElementById('currentPrice').textContent = '加载失败';
  }
}

loadGoldData();
setInterval(loadGoldData, 60000);
</script>

<style>
.gold-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.current-price-card, .chart-card {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}
.price-display {
  font-size: 48px;
  font-weight: bold;
  color: #d4af37;
  text-align: center;
  margin: 20px 0;
}
.price-time {
  text-align: center;
  color: #666;
}
.chart-card h3 {
  margin-bottom: 16px;
}
</style>