// DOM referansları
const funcButtons = Array.from(document.querySelectorAll('.func-row .btn'));
const angleInput = document.getElementById('angle');
const angleRange = document.getElementById('angleRange');
const degBtn = document.getElementById('degBtn');
const radBtn = document.getElementById('radBtn');
const calcBtn = document.getElementById('calcBtn');
const exactEl = document.getElementById('exact');
const approxEl = document.getElementById('approx');
const plotCanvas = document.getElementById('plotCanvas');
const ctx = plotCanvas.getContext('2d');
const histBtn = document.getElementById('histBtn');

let currentFunc = 'sin';
let unit='deg';
let history = JSON.parse(localStorage.getItem('trig_history_v2')||'[]');

// === Exact value parser ===
function parseExactStringToNumber(s){
    if(!s || s==='—') return NaN;
    if(s==='Tanımsız') return NaN;
    s=s.replace(/\s+/g,'');
    let numerator = s; let denom=1;
    if(s.includes('/')){
        const parts = s.split('/');
        numerator = parts.slice(0,parts.length-1).join('/');
        denom = Number(parts[parts.length-1]);
    }
    if(numerator.startsWith('(') && numerator.endsWith(')')) numerator=numerator.slice(1,-1);
    const tokens = numerator.match(/[+-]?[^+-]+/g)||[];
    let total=0; for(let token of tokens) total+=parseTerm(token);
    return total/denom;
}
function parseTerm(token){
    token=token.trim(); if(token==='') return 0; if(token[0]==='+') token=token.slice(1);
    if(token.includes('√')){
        token=token.replace(/\(/g,'').replace(/\)/g,'');
        let sign=1;if(token[0]==='-'){sign=-1;token=token.slice(1);} if(token[0]==='+') token=token.slice(1);
        const m = token.match(/^(\d*\.?\d*)?√(\d+(?:\.\d+)?)$/);
        if(m){ const coeff = m[1]?Number(m[1]):1; const rad = Number(m[2]); return sign*coeff*Math.sqrt(rad); }
    }
    const n = Number(token); if(!Number.isNaN(n)) return n;
    return 0;
}

// Exact trig values (0-180)
const exactValues = {
    sin:{0:'0',15:'(√6-√2)/4',30:'1/2',45:'√2/2',60:'√3/2',90:'1',180:'0'},
    cos:{0:'1',30:'√3/2',45:'√2/2',60:'1/2',90:'0',180:'-1'},
    tan:{0:'0',30:'1/√3',45:'1',60:'√3',90:'Tanımsız'}
};

// --- Event listeners ---
funcButtons.forEach(b=>{
    b.addEventListener('click', ()=>{
        funcButtons.forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        currentFunc = b.dataset.f;
        drawPlot();
    });
});

degBtn.addEventListener('click', ()=>{unit='deg'; degBtn.classList.add('active'); radBtn.classList.remove('active'); syncInputs(); drawPlot();});
radBtn.addEventListener('click', ()=>{unit='rad'; radBtn.classList.add('active'); degBtn.classList.remove('active'); syncInputs(); drawPlot();});
angleInput.addEventListener('input', ()=>{syncRange(); drawPlot();});
angleRange.addEventListener('input', ()=>{syncInputs(true); drawPlot();});

function syncRange(){ const val=angleInput.value||0; angleRange.value=(unit==='deg')?val:val*180/Math.PI; }
function syncInputs(fromRange){
    if(fromRange){
        const v=Number(angleRange.value);
        angleInput.value=(unit==='deg')?v:v*Math.PI/180;
    } else { syncRange(); }
}

// --- Compute trig values ---
function computeTrigValue(fn, rad){
    switch(fn){
        case 'sin': return Math.sin(rad);
        case 'cos': return Math.cos(rad);
        case 'tan': return Math.tan(rad);
        case 'cosec': return 1/Math.sin(rad);
        case 'sec': return 1/Math.cos(rad);
        case 'cot': return 1/Math.tan(rad);
    }
}

// --- Show result ---
function showResult(exactStr, approxNum){
    exactEl.classList.remove('pulse'); approxEl.classList.remove('pulse');
    void exactEl.offsetWidth;
    exactEl.textContent = exactStr||'';
    approxEl.textContent = (approxNum===null)?'Tanımsız':(typeof approxNum==='number'?approxNum.toFixed(6):approxNum);
    exactEl.classList.add('pulse'); approxEl.classList.add('pulse');
}

// --- Calculate ---
calcBtn.addEventListener('click', ()=>{
    const raw=angleInput.value.trim(); if(raw===''){showResult('', 'Lütfen açı girin.'); return;}
    const parsed=Number(raw); if(Number.isNaN(parsed)){showResult('', 'Geçerli sayı girin.'); return;}
    let degForLookup = (unit==='deg')?parsed:parsed*180/Math.PI;
    degForLookup = Math.round(degForLookup*10000)/10000;
    const intDeg = Math.round(degForLookup);
    const isIntegerAngle = Math.abs(intDeg - degForLookup)<1e-9;
    const fnMap = exactValues[currentFunc];
    if(isIntegerAngle && fnMap && fnMap[intDeg]!==undefined){
        const exact=fnMap[intDeg];
        const approx=parseExactStringToNumber(exact);
        showResult(exact, approx);
        pushHistory(`${currentFunc} ${intDeg}° = ${approx.toFixed(6)}`);
        return;
    }
    const angleRad = (unit==='deg')?parsed*Math.PI/180:parsed;
    const val = computeTrigValue(currentFunc, angleRad);
    if(!isFinite(val)){ showResult('', 'Tanımsız'); pushHistory(`${currentFunc} ${parsed} ${unit} = Tanımsız`); return; }
    showResult('', val); pushHistory(`${currentFunc} ${parsed} ${unit} = ${val.toFixed(6)}`);
});

// --- History ---
function pushHistory(text){
    history=history||[];
    history.push(text);
    if(history.length>80) history.shift();
    localStorage.setItem('trig_history_v2', JSON.stringify(history));
}
histBtn.addEventListener('click', ()=>{alert(history.slice().reverse().join('\n')||'Henüz geçmiş yok');});

// --- Spotlight ---
const spot = document.getElementById('spot');
const bgGrid = document.getElementById('bgGrid');
let spotFadeTimeout=null;
function setSpot(x,y,sizeRatio=1,intensity=1){
    const px=Math.round(x), py=Math.round(y);
    spot.style.setProperty('--spot-x', px+'px');
    spot.style.setProperty('--spot-y', py+'px');
    const base=Math.max(140, Math.min(420, window.innerWidth*0.18));
    spot.style.setProperty('--spot-size',(base*sizeRatio)+'px');
    spot.style.setProperty('--spot-intensity',intensity);
    spot.style.transform='translateZ(0) scale('+(1+0.015*sizeRatio)+')';
    spot.style.opacity=1;
    bgGrid.style.opacity=0.28;
    if(spotFadeTimeout) clearTimeout(spotFadeTimeout);
    spotFadeTimeout=setTimeout(()=>{ spot.style.setProperty('--spot-intensity',0.6); },220);
}
document.addEventListener('mousemove',(e)=>{ setSpot(e.clientX,e.clientY,1.05,1.15); });
document.addEventListener('mouseout',(e)=>{ if(!e.relatedTarget){ spot.style.opacity=0.28; bgGrid.style.opacity=0.14; } });
document.addEventListener('touchstart',(e)=>{ const t=e.touches[0]; setSpot(t.clientX,t.clientY,0.9,0.8); });
document.addEventListener('touchmove',(e)=>{ const t=e.touches[0]; setSpot(t.clientX,t.clientY,0.95,0.9); });

// --- Theme toggle ---
const themeToggle = document.getElementById('themeToggle');
(function initTheme(){
    const stored = localStorage.getItem('trig_theme');
    const isDark = (stored==='dark')||(stored===null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if(isDark) document.documentElement.classList.add('dark');
    updateThemeButtonIcon();
    themeToggle.addEventListener('click',()=>{
        document.documentElement.classList.toggle('dark');
        const nowDark=document.documentElement.classList.contains('dark');
        localStorage.setItem('trig_theme', nowDark?'dark':'light');
        updateThemeButtonIcon();
    });
})();
function updateThemeButtonIcon(){ themeToggle.textContent=document.documentElement.classList.contains('dark')?'☀️ Açık':'🌙 Karanlık'; }

// --- Install prompt ---
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',(e)=>{
    e.preventDefault();
    deferredPrompt=e;
    installBtn.style.display='inline-flex';
});
installBtn.addEventListener('click', async()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt=null;
    installBtn.style.display='none';
});

// --- Draw plot ---
function drawPlot(){
    const w=plotCanvas.width=plotCanvas.clientWidth*devicePixelRatio;
    const h=plotCanvas.height=240*devicePixelRatio;
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    ctx.clearRect(0,0,plotCanvas.clientWidth,240);
    const padding=32; const W=plotCanvas.clientWidth-padding*2; const H=200; const cx=padding; const cy=padding+H/2;

    // background grid
    ctx.strokeStyle='rgba(10,20,40,0.06)'; ctx.lineWidth=1;
    for(let x=0;x<=W;x+=20){ ctx.beginPath(); ctx.moveTo(cx+x,padding); ctx.lineTo(cx+x,padding+H); ctx.stroke(); }
    for(let y=0;y<=H;y+=20){ ctx.beginPath(); ctx.moveTo(cx,padding+y); ctx.lineTo(cx+W,padding+y); ctx.stroke(); }

    // axes
    ctx.strokeStyle='rgba(10,20,40,0.18)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+W,cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx+W/2,padding); ctx.lineTo(cx+W/2,padding+H); ctx.stroke();

    const domainMin=-2*Math.PI, domainMax=2*Math.PI;
    function xToPx(x){ return cx + ((x-domainMin)/(domainMax-domainMin))*W; }
    function yToPx(y){ return cy - y*H/2; }

    // function plot
    ctx.beginPath(); ctx.lineWidth=2; ctx.strokeStyle='rgba(108,116,255,0.92)';
    const steps=800;
    for(let i=0;i<=steps;i++){
        const t=domainMin + (i/steps)*(domainMax-domainMin);
        let y=computeTrigValue(currentFunc,t);
        if(!isFinite(y)){ ctx.moveTo(xToPx(t),yToPx(0)); continue; }
        const px=xToPx(t), py=yToPx(Math.max(-3,Math.min(3,y)));
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
    }
    ctx.stroke();

    // current angle marker
    const angleVal = Number(angleInput.value)||0;
    const angleRad=(unit==='deg')?angleVal*Math.PI/180:angleVal;
    const markerX=xToPx(angleRad);
    ctx.fillStyle='#ff6b6b';
    ctx.beginPath(); ctx.arc(markerX,yToPx(Math.max(-3,Math.min(3,computeTrigValue(currentFunc,angleRad)))),6,0,Math.PI*2);
    ctx.fill();

    ctx.fillStyle='#274060'; ctx.font='12px Inter, system-ui';
    ctx.fillText('-2π',cx+2,padding+H+14);
    ctx.fillText('0',cx+W/2-6,padding+H+14);
    ctx.fillText('2π',cx+W-22,padding+H+14);
}

drawPlot();
window.addEventListener('resize',()=>drawPlot());
