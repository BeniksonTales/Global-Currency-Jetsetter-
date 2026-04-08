let myCurrencies = {};
let currentBase = 'USD';
let currentAmount = 100;
let myTargets = ['EUR', 'GBP', 'JPY'];

async function startApp() {
  const response = await fetch('https://api.frankfurter.dev/v1/currencies');
  myCurrencies = await response.json();

  const baseSelect = document.getElementById('base-select');
  for (let code in myCurrencies) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = code;
    baseSelect.appendChild(option);
  }
  baseSelect.value = currentBase;

  setupListeners();
  updateAllData();
}

async function updateAllData() {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const targets = myTargets.join(',');
  const latestUrl = `https://api.frankfurter.dev/v1/latest?base=${currentBase}&symbols=${targets}`;
  const historyUrl = `https://api.frankfurter.dev/v1/${sevenDaysAgo}..${today}?base=${currentBase}&symbols=${targets}`;

  const latestRes = await fetch(latestUrl);
  const latestData = await latestRes.json();

  const historyRes = await fetch(historyUrl);
  const historyData = await historyRes.json();

  showDataOnScreen(latestData.rates, historyData.rates, latestData.date);
}

function showDataOnScreen(latestRates, historyRates, dateText) {
  document.getElementById('last-updated').textContent = "Last Updated: " + dateText;

  const targetContainer = document.getElementById('target-blocks');
  targetContainer.innerHTML = '';

  for (let i = 0; i < myTargets.length; i++) {
    const code = myTargets[i];
    const rate = latestRates[code];
    const convertedAmount = (currentAmount * rate).toFixed(2);

    const block = document.createElement('div');
    block.className = 'block target-block';

    let historyList = [];
    for (let date in historyRates) {
      historyList.push(historyRates[date][code]);
    }

    let min = Math.min(...historyList);
    let max = Math.max(...historyList);

    let sparklineHtml = '<div class="sparkline">';
    for (let j = 0; j < historyList.length; j++) {
      const val = historyList[j];
      let height = 10;
      if (max !== min) {
        height = 10 + ((val - min) / (max - min) * 80);
      }
      
      const isLatest = (j === historyList.length - 1);
      const barClass = isLatest ? 'spark-bar latest' : 'spark-bar';
      sparklineHtml += `<div class="${barClass}" style="height: ${height}%"></div>`;
    }
    sparklineHtml += '</div>';

    block.innerHTML = `
      <button class="remove-btn" onclick="removeTarget('${code}')">&times;</button>
      <div>
        <span class="target-header-text">${myCurrencies[code]}</span>
        <div class="target-main-info">
          <span class="target-code">${code}</span>
          <span class="target-amount">${convertedAmount}</span>
        </div>
        <div class="target-rate-info">
          <span class="target-rate">1 ${currentBase} = ${rate.toFixed(4)} ${code}</span>
        </div>
      </div>
      ${sparklineHtml}
    `;

    targetContainer.appendChild(block);
  }
}

function removeTarget(codeToRemove) {
  let newList = [];
  for (let i = 0; i < myTargets.length; i++) {
    if (myTargets[i] !== codeToRemove) {
      newList.push(myTargets[i]);
    }
  }
  myTargets = newList;
  
  updateAllData();
}

function setupListeners() {
  document.getElementById('base-select').onchange = function(event) {
    currentBase = event.target.value;
    updateAllData();
  };

  document.getElementById('base-amount').oninput = function(event) {
    currentAmount = parseFloat(event.target.value);
    if (isNaN(currentAmount)) currentAmount = 0;
    updateAllData();
  };

  const modal = document.getElementById('currency-modal');
  
  document.getElementById('change-targets-btn').onclick = function() {
    const modalList = document.getElementById('modal-currency-list');
    modalList.innerHTML = '';

    for (let code in myCurrencies) {
      if (code === currentBase) continue;

      const item = document.createElement('div');
      item.className = 'modal-item';
      item.textContent = code + " - " + myCurrencies[code];

      item.onclick = function() {
        if (myTargets.includes(code)) {
          myTargets = myTargets.filter(c => c !== code);
        } else {
          if (myTargets.length < 3) {
            myTargets.push(code);
          } else {
            alert("Please remove a currency first (Max 3)");
          }
        }
        modal.classList.add('hidden');
        updateAllData();
      };
      modalList.appendChild(item);
    }
    modal.classList.remove('hidden');
  };

  document.getElementById('close-modal-btn').onclick = function() {
    modal.classList.add('hidden');
  };
}

window.removeTarget = removeTarget;

startApp();