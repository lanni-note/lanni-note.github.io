// 1. 定義基礎數據
const portfolioData = [
    {
        symbol: 'BTC', name: 'Bitcoin',
        historicalPrices:   [66959.03, 71333.08, 74205.38, 70411.29, 66847.51, 68597.12, 74797.52],
        historicalAvgCosts: [67941.44, 68037.23, 69188.37, 69543.09, 69289.03, 69008.55, 69430.22],
        historicalAmounts:  [0.0004167, 0.0008215, 0.001213, 0.001609, 0.002018, 0.002433, 0.002821],
        historicalInvested: [28, 56, 84, 112, 140, 168, 196]
    },
    {
        symbol: 'ETH', name: 'Ethereum',
        historicalPrices:   [1993.78, 2081.02, 2328.51, 2144.63, 2061.05, 2104.28, 2382.3],
        historicalAvgCosts: [1983.95, 2001.64, 2042.68, 2070.53, 2069.47, 2071.52, 2092.81],
        historicalAmounts:  [0.003518, 0.006986, 0.01026, 0.01351, 0.0169, 0.02026, 0.02339],
        historicalInvested: [7, 14, 21, 28, 35, 42, 49]
    },
    {
        symbol: 'SOL', name: 'Solana',
        historicalPrices:   [85.85, 88.52, 94.62, 89.99, 81.05, 79.59, 85.91],
        historicalAvgCosts: [81.35, 83.82, 84.40, 86.61, 87.99, 87.41, 86.89],
        historicalAmounts:  [0.02998, 0.06996, 0.09995, 0.1299, 0.1699, 0.1999, 0.2398],
        historicalInvested: [3, 6, 9, 12, 15, 18, 21]
    },
    {
        symbol: 'SUI', name: 'Sui',
        historicalPrices:   [0.9127, 0.996, 1.0275, 0.9434, 0.8626, 0.8697, 0.9455],
        historicalAvgCosts: [0.87, 0.8864, 0.9063, 0.9357, 0.9395, 0.9312, 0.9355],
        historicalAmounts:  [4.4977, 8.8955, 13.0934, 16.9915, 21.1894, 25.6871, 29.7851],
        historicalInvested: [4, 8, 12, 16, 20, 24, 28]
    }
];

// 共用格式化工具
const formatFiat = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatCrypto = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const coinListEl = document.getElementById('coinList');
let topTotalInvested = 0;
let topTotalValuation = 0;

// 取得最長的歷史資料長度，建立大盤陣列
const historyLength = portfolioData[0].historicalPrices.length;
let totalValuationHistory = new Array(historyLength).fill(0);
let totalInvestedHistory = new Array(historyLength).fill(0);

// 2. 動態生成卡片與計算
portfolioData.forEach((coin) => {
    const currentPrice = coin.historicalPrices[coin.historicalPrices.length - 1];
    const currentAvgCost = coin.historicalAvgCosts[coin.historicalAvgCosts.length - 1];
    const currentAmount = coin.historicalAmounts[coin.historicalAmounts.length - 1]; 
    const currentInvested = coin.historicalInvested[coin.historicalInvested.length - 1]; 
    
    const currentValuation = currentAmount * currentPrice;
    const returnAmount = currentValuation - (currentAmount * currentAvgCost);
    const currentROI = (returnAmount / (currentAmount * currentAvgCost)) * 100;

    // 算出每一期的 ROI，並累加至大盤
    const roiHistory = [];
    
    for (let i = 0; i < coin.historicalPrices.length; i++) {
        const price = coin.historicalPrices[i];
        const avgCost = coin.historicalAvgCosts[i];
        const amount = coin.historicalAmounts[i];
        const periodInvested = coin.historicalInvested[i]; 
        
        const periodValuation = amount * price;
        const periodReturn = periodValuation - (amount * avgCost);
        
        const periodROI = (amount * avgCost) > 0 ? (periodReturn / (amount * avgCost)) * 100 : 0;
        
        roiHistory.push(periodROI);

        totalValuationHistory[i] += periodValuation;
        totalInvestedHistory[i] += periodInvested;
    }

    topTotalInvested += currentInvested;
    topTotalValuation += currentValuation;

    const chartId = `chart-${coin.symbol}`;
    const isPositive = currentROI >= 0;
    const colorClass = isPositive ? 'text-bybitGreen' : 'text-bybitRed';
    const sign = isPositive ? '+' : '';
    const lineColor = isPositive ? '#2EBD85' : '#F6465D';
    const dynamicLabels = Array.from({ length: historyLength }, (_, i) => `T${i + 1}`);

    const cardHTML = `
        <div class="bg-bybitCard rounded-xl p-5 border border-gray-800 flex flex-col shadow-md hover:border-gray-600 transition-colors">
            
            <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-2xl">${coin.symbol}</span>
                    <span data-html2canvas-ignore="true" class="text-xs text-bybitText px-2 py-0.5 bg-black rounded-full">${coin.name}</span>
                </div>
                <span class="${colorClass} font-bold text-2xl">${sign}${formatFiat(currentROI)}%</span>
            </div>

            <div class="flex gap-5 mb-3">
                <div class="flex items-baseline gap-1.5">
                    <span class="text-xs text-bybitText">均價</span>
                    <span class="text-sm text-white font-medium">$${formatFiat(currentAvgCost)}</span>
                </div>
                <div class="flex items-baseline gap-1.5">
                    <span class="text-xs text-bybitText">現價</span>
                    <span class="text-sm text-white font-bold">$${formatFiat(currentPrice)}</span>
                </div>
            </div>
            
            <div class="w-full relative h-[140px] mb-4">
                <canvas id="${chartId}"></canvas>
            </div>

            <div class="flex justify-between items-center pt-3 border-t border-gray-800 mt-auto">
                <div>
                    <p class="text-[12px] text-bybitText mb-0.5">總投資額</p>
                    <p class="text-sm font-semibold">$${formatFiat(currentInvested)}</p>
                </div>
                <div class="text-center">
                    <p class="text-[12px] text-bybitText mb-0.5">持倉數量</p>
                    <p class="text-sm font-semibold text-bybitYellow">${formatCrypto(currentAmount)} ${coin.symbol}</p>
                </div>
                <div class="text-right">
                    <p class="text-[12px] text-bybitText mb-0.5">總報酬額</p>
                    <p class="text-sm font-bold ${colorClass}">${sign}$${formatFiat(returnAmount)}</p>
                </div>
            </div>
        </div>
    `;
    coinListEl.insertAdjacentHTML('beforeend', cardHTML);

    const ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dynamicLabels,
            datasets: [
                {
                    label: 'ROI',
                    data: roiHistory,
                    borderColor: lineColor,
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { // 單一 Y 軸，靠右對齊
                    type: 'linear', position: 'right',
                    grid: { color: 'rgba(255, 255, 255, 0.03)' }, 
                    ticks: { color: lineColor, font: { size: 9 }, maxTicksLimit: 5, callback: function(value) { return value + '%'; } }
                }
            }
        }
    });
});

// 3. 計算大盤總歷史 ROI 並更新最上方區塊
const totalROIHistory = [];

for (let i = 0; i < totalValuationHistory.length; i++) {
    const valuation = totalValuationHistory[i];
    const invested = totalInvestedHistory[i];
    const returnAmt = valuation - invested;
    
    totalROIHistory.push(invested > 0 ? (returnAmt / invested) * 100 : 0);
}

const topTotalROI = ((topTotalValuation - topTotalInvested) / topTotalInvested) * 100;
const isTopPositive = topTotalROI >= 0;

document.getElementById('topTotalValuation').innerText = formatFiat(topTotalValuation);
document.getElementById('topTotalInvested').innerText = '$' + formatFiat(topTotalInvested);

const topRoiEl = document.getElementById('topTotalROI');
topRoiEl.innerText = (isTopPositive ? '+' : '') + formatFiat(topTotalROI) + '%';
topRoiEl.className = isTopPositive 
    ? 'text-bybitGreen font-bold text-base' 
    : 'text-bybitRed font-bold text-base';

const totalCtx = document.getElementById('totalChart').getContext('2d');
let gradientTotal = totalCtx.createLinearGradient(0, 0, 0, 160);
gradientTotal.addColorStop(0, 'rgba(243, 166, 50, 0.25)');
gradientTotal.addColorStop(1, 'rgba(243, 166, 50, 0)');

const totalDynamicLabels = Array.from({ length: historyLength }, (_, i) => `T${i + 1}`);

new Chart(totalCtx, {
    type: 'line',
    data: {
        labels: totalDynamicLabels,
        datasets: [
            {
                label: '總 ROI',
                data: totalROIHistory,
                borderColor: '#F3A632',
                backgroundColor: gradientTotal,
                fill: true,
                borderWidth: 2.5,
                pointRadius: 0,
                tension: 0.4
            }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
            x: { display: false },
            y: { // 單一 Y 軸，靠右對齊
                type: 'linear', position: 'right',
                grid: { color: 'rgba(255, 255, 255, 0.03)' },
                ticks: { color: '#F3A632', font: { size: 10 }, maxTicksLimit: 5, callback: function(value) { return value + '%'; } }
            }
        }
    }
});

// ==========================================
// 4. 一鍵下載圖片功能 (使用 ignore 屬性，不須延遲)
// ==========================================
document.getElementById('downloadBtn').addEventListener('click', function() {
    const btn = this;
    const originalText = btn.innerText;
    btn.innerText = '⏳ 處理中...';
    btn.disabled = true;

    const targetElement = document.getElementById('captureArea');

    html2canvas(targetElement, {
        backgroundColor: '#131722',
        scale: 2,
        useCORS: true
    }).then(canvas => {
        const imageURL = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        
        const today = new Date().toISOString().slice(0, 10);
        downloadLink.download = `DCA-Portfolio-${today}.png`;
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        btn.innerText = originalText;
        btn.disabled = false;
    });
});