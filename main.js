const minEl = document.getElementById('min-number');
const maxEl = document.getElementById('max-number');
const sortearBtn = document.getElementById('sortear');
const overlay = document.getElementById('overlay');
const countdownEl = document.getElementById('countdown');
const resultCard = document.getElementById('result-card');
const resultView = document.getElementById('result-view');
const winnerNameEl = document.getElementById('winner-name');
const winnerMetaEl = document.getElementById('winner-meta');
const backBtn = document.getElementById('back-to-list');
const historyEl = document.getElementById('history');
const downloadPdfBtn = document.getElementById('download-pdf');
const exportHistoryBtn = document.getElementById('export-history');
const clearHistoryBtn = document.getElementById('clear-history');

const HIST_KEY = 'nosso_sorteio_history_v5';
let history = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');

function renderHistory(){
  historyEl.innerHTML = '';
  if(history.length===0){ 
    historyEl.innerHTML = '<div style="color:var(--muted);padding:8px">Nenhum sorteio ainda</div>'; 
    return;
  }
  history.slice().reverse().forEach(item=>{
    const div = document.createElement('div');
    div.className='history-item';
    div.innerHTML = `<strong>${item.winner}</strong><div style="font-size:13px;color:var(--muted)">${item.date} — intervalo ${item.min}-${item.max}</div>`;
    historyEl.appendChild(div);
  });
}

function saveHistory(){ 
  localStorage.setItem(HIST_KEY, JSON.stringify(history)); 
  renderHistory(); 
}

function pickRandomNumber(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

async function startCountdownAndPick(){
  const min = parseInt(minEl.value), max = parseInt(maxEl.value);
  if(isNaN(min) || isNaN(max)){
    alert('Digite números válidos');
    return;
  }
  if(max < min){
    alert('O número final deve ser maior que o inicial');
    return;
  }

  overlay.classList.add('active');

  for(let i=10;i>=0;i--){
    countdownEl.innerText = i;
    await new Promise(r=>setTimeout(r,1000));
  }

  overlay.classList.remove('active');

  const winner = pickRandomNumber(min,max);
  showWinner(winner,min,max);
}

function showWinner(number,min,max){
  winnerNameEl.innerText = number;
  const now = new Date();
  const formatted = now.toLocaleString();
  winnerMetaEl.innerText = `Sorteado em ${formatted} — intervalo ${min}-${max}`;
  resultCard.style.display='block';
  resultView.classList.add('active');
  try{ confetti({ particleCount:180, spread:140, origin:{y:0.35} }); }catch(e){}
  history.push({winner:number,date:formatted,min:min,max:max});
  if(history.length>200) history.shift();
  saveHistory();
}

sortearBtn.addEventListener('click', startCountdownAndPick);
backBtn.addEventListener('click', ()=>{ resultView.classList.remove('active'); resultCard.style.display='none'; });

downloadPdfBtn.addEventListener('click', ()=>{
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(18); doc.text('NOSSO SORTEIO',14,22);
  doc.setFontSize(12); doc.text('Certificamos que o sorteio realizado teve o seguinte resultado:',14,38);
  doc.setFontSize(16); doc.text(`Número sorteado: ${winnerNameEl.innerText}`,14,58);
  doc.setFontSize(12); doc.text(winnerMetaEl.innerText,14,72);
  doc.save(`resultado_sorteio_${winnerNameEl.innerText}.pdf`);
});

exportHistoryBtn.addEventListener('click', ()=>{
  if(history.length===0){ alert('Nenhum sorteio para exportar.'); return; }
  const rows=[['winner','date','min','max']].concat(history.map(h=>[h.winner,h.date,h.min,h.max]));
  const csv = rows.map(r=> r.map(c=>'\"'+String(c).replace(/\"/g,'\"\"')+'\"').join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='historico_sorteios.csv'; a.click(); URL.revokeObjectURL(url);
});

clearHistoryBtn.addEventListener('click', ()=>{ if(confirm('Limpar histórico?')){ history=[]; saveHistory(); } });

renderHistory();
