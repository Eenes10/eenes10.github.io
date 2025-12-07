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
const installBtn = document.getElementById('installBtn');

let currentFunc = 'sin';
let unit='deg';
let history = JSON.parse(localStorage.getItem('trig_history_v2')||'[]');
let deferredPrompt;

// --- Install butonu ---
window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
});
installBtn.addEventListener('click', async()=>{
    if(deferredPrompt){
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
    } else {
        alert('Bu tarayıcı PWA eklemeyi desteklemiyor veya zaten eklendi.');
    }
});

// --- Tema toggle ---
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click',()=>{
    document.documentElement.classList.toggle('dark');
});

// --- Diğer JS (hesaplama, çizim, plot, history vs) ---
/* Buraya daha önce gönderdiğim tüm trig hesaplama ve grafik çizim kodları gelecek */
