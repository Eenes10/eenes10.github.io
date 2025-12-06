// Global değişkenler (Karşılaştırma ile ilgili olanlar kaldırıldı)
const kurAlani = document.getElementById('kur-kartlari');

// --- API ANAHTARLARI VE URL'LER ---
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD,GBP,CHF`; 
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=usd';

async function verileriCek() {
    // --- Başlangıç ve Simülasyon Değerleri (API başarısız olursa bunlar kullanılacak) ---
    let tryPerUsd = 33.2000; 
    let tryPerEur = 36.1000; 
    let tryPerGbp = 40.5000; 
    let tryPerChf = 35.0000; 
    let onsPerUsd = 2000.00;
    let usdPerBtc = 60000.00;
    
    // Değişim yüzdeleri (Simülasyon)
    const ALTIN_DEGISM_YUZDESI_GRAM = 1.15; 
    const ALTIN_DEGISM_YUZDESI_CEYREK = 0.90;
    const DOVIZ_DEGISM_USD = 0.35;
    const DOVIZ_DEGISM_EUR = -0.15;
    const DOVIZ_DEGISM_GBP = 0.50;
    const DOVIZ_DEGISM_CHF = -0.05;
    const BTC_DEGISM_YUZDESI = 1.50;
    
    // --- 1. Döviz Verisini Çekme (Hata Yönetimi Eklendi) ---
    try {
        const dovizResponse = await fetch(FIXER_URL);
        const dovizData = await dovizResponse.json();
        
        if (dovizData?.rates && dovizData.success) {
            const eurTry = dovizData.rates.TRY;
            const eurUsd = dovizData.rates.USD;
            const eurGbp = dovizData.rates.GBP;
            const eurChf = dovizData.rates.CHF;
            
            tryPerUsd = eurTry / eurUsd;
            tryPerEur = eurTry; 
            tryPerGbp = eurTry / eurGbp;
            tryPerChf = eurTry / eurChf;
        } 
    } catch (error) {
        console.error("Fixer API çekiminde hata:", error);
    }
    
    // --- 2. Kripto ve Altın Verisini Çekme (Hata Yönetimi Eklendi) ---
    try {
        const cryptoResponse = await fetch(COINGECKO_URL);
        const cryptoData = await cryptoResponse.json();
        
        if (cryptoData?.['tether-gold']?.usd) {
            onsPerUsd = cryptoData['tether-gold'].usd;
        } 
        if (cryptoData?.bitcoin?.usd) {
            usdPerBtc = cryptoData.bitcoin.usd;
        } 
    } catch (error) {
        console.error("CoinGecko API çekiminde hata:", error);
    }
    
    // --- 3. Nihai Hesaplamalar ---
    
    const tryPerBtc = usdPerBtc * tryPerUsd;
    const onsPerTry = onsPerUsd * tryPerUsd;
    const ONS_KARSILIGI_GRAM = 31.1035; 
    const tryPerGramAltin = onsPerTry / ONS_KARSILIGI_GRAM;
    const tryPerCeyrekAltin = tryPerGramAltin * 1.754; 
    
    // Ekranı temizle
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma ---
    
    kurAlani.innerHTML += kartOlustur('Bitcoin', 'BTC', tryPerBtc, BTC_DEGISM_YUZDESI); 
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', tryPerGramAltin, ALTIN_DEGISM_YUZDESI_GRAM); 
    kurAlani.innerHTML += kartOlustur('Çeyrek Altın', 'ÇYRK', tryPerCeyrekAltin, ALTIN_DEGISM_YUZDESI_CEYREK); 
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', tryPerUsd, DOVIZ_DEGISM_USD); 
    kurAlani.innerHTML += kartOlustur('Euro', 'EUR', tryPerEur, DOVIZ_DEGISM_EUR); 
    kurAlani.innerHTML += kartOlustur('İngiliz Sterlini', 'GBP', tryPerGbp, DOVIZ_DEGISM_GBP); 
    kurAlani.innerHTML += kartOlustur('İsviçre Frangı', 'CHF', tryPerChf, DOVIZ_DEGISM_CHF); 
    
    // Üstteki sabit başlık mesajını ayarla
    document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir.`;
    
}

// Kart oluşturma fonksiyonu (Tıklama ile ilgili veriler kaldırıldı)
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    const minD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    const maxD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: minD, maximumFractionDigits: maxD });
    const degisimSinifi = degisimYuzdesi >= 0 ? 'pozitif' : 'negatif';
    const degisimMetni = degisimYuzdesi.toFixed(2) + '%';
    
    return `
        <div class="kur-kart">
            <h2 class="sembol">${sembol}</h2>
            <h3 class="isim">${isim}</h3>
            <div class="fiyat-alanı">
                <span class="fiyat">₺ ${formatliFiyat}</span>
                <span class="degisim ${degisimSinifi}">${degisimMetni}</span>
            </div>
        </div>
    `;
}

// Veri çekme ve güncelleme
verileriCek();
setInterval(verileriCek, 10000); 


// --- TEMA DEĞİŞTİRME MANTIĞI (KORUNDU) ---

document.getElementById('temaDegistirBtn').addEventListener('click', () => {
    const body = document.body;
    const btn = document.getElementById('temaDegistirBtn');
    
    // Tema değiştirme
    if (body.classList.contains('light')) {
        body.classList.remove('light');
        localStorage.setItem('tema', 'dark');
        btn.textContent = '🌞'; 
    } else {
        body.classList.add('light');
        localStorage.setItem('tema', 'light');
        btn.textContent = '🌙'; 
    }
});

// Sayfa yüklendiğinde temayı kontrol et
(function kontrolTemayi() {
    if (localStorage.getItem('tema') === 'light') {
        document.body.classList.add('light');
        document.getElementById('temaDegistirBtn').textContent = '🌙';
    }
})();
