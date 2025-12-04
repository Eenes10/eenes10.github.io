const kurAlani = document.getElementById('kur-kartlari');

// --- API ANAHTARLARI VE URL'LER ---

// 1. Döviz için Fixer.io API anahtarınız
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD,GBP,CHF`; 

// 2. Metals-API anahtarınız (Altın için)
const METALS_API_KEY = 'API_KEY'; 
// API'nin 'USDXAU' değerini vermesini bekliyoruz.
const METALS_URL = `https://api.metals-api.com/v1/latest?access_key=${METALS_API_KEY}&base=USD&symbols=XAU`; 

// 3. Bitcoin için harici API
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

async function verileriCek() {
    // API çekimi başarısız olursa kullanılacak varsayılan değerler
    let tryPerUsd = 33.2000; 
    let tryPerEur = 36.1000; 
    let tryPerGbp = 40.5000; 
    let tryPerChf = 35.0000; 
    let onsPerUsd = 2000.00; // Ons Altın Dolar Fiyatı Varsayılanı
    let tryPerGramAltin = 2000.00; 
    let usdPerBtc = 60000.00; 
    
    // Değişim yüzdeleri (Simülasyon)
    const ALTIN_DEGISM_YUZDESI_GRAM = 1.15; 
    const ALTIN_DEGISM_YUZDESI_CEYREK = 0.90;
    const DOVIZ_DEGISM_USD = 0.35;
    const DOVIZ_DEGISM_EUR = -0.15;
    const DOVIZ_DEGISM_GBP = 0.50;
    const DOVIZ_DEGISM_CHF = -0.05;
    const BTC_DEGISM_YUZDESI = 1.50;

    // --- 1. Döviz Verisini Çekme (USD, EUR, GBP, CHF) - Fixer API'den ---
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
        console.error("Döviz API çekiminde hata:", error);
    }
    
    // --- 2. Altın Verisini Çekme (Ons Altın/USD) - Metals-API'den ---
    try {
        const altinResponse = await fetch(METALS_URL);
        const altinData = await altinResponse.json();
        
        // DÜZELTME: Artık rates.USDXAU değerini doğrudan kullanıyoruz!
        if (altinData?.rates && altinData.success && altinData.rates.USDXAU) {
            
            // USDXAU alanı, 1 Ons Altının kaç USD ettiğini veriyor.
            onsPerUsd = altinData.rates.USDXAU;
            
        } else {
            console.error("Metals-API'den Ons Altın verisi alınamadı veya 'USDXAU' alanı mevcut değil.");
        }
    } catch (error) {
        console.error("Altın API çekiminde hata:", error);
    }

    // --- 3. Bitcoin Verisini Çekme (BTC/USD) - CoinGecko'dan ---
    try {
        const btcResponse = await fetch(COINGECKO_URL);
        const btcData = await btcResponse.json();
        
        if (btcData?.bitcoin?.usd) {
            usdPerBtc = btcData.bitcoin.usd;
        } 
    } catch (error) {
        console.error("Bitcoin API çekiminde hata:", error);
    }
    
    // --- 4. Nihai Hesaplamalar ---
    
    const tryPerBtc = usdPerBtc * tryPerUsd;

    // Ons Altın/TRY = (Ons Altın/USD) * (USD/TRY)
    const onsPerTry = onsPerUsd * tryPerUsd;
    
    const ONS_KARSILIGI_GRAM = 31.1035; 
    tryPerGramAltin = onsPerTry / ONS_KARSILIGI_GRAM;
    
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

}

// Kart oluşturma fonksiyonu
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

verileriCek();
setInterval(verileriCek, 10000);
