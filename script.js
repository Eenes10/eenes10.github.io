const kurAlani = document.getElementById('kur-kartlari');

// Döviz için Fixer.io API anahtarınız
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD`; 

// Metals-API anahtarınız.
const METALS_API_KEY = 'API_KEY'; 
// Altın: API'nin ücretsiz planda otomatik döndürdüğü 'base=USD' verisini bekliyoruz.
const METALS_URL = `https://api.metals-api.com/v1/latest?access_key=${METALS_API_KEY}&base=USD&symbols=XAU`; 

async function verileriCek() {
    let tryPerUsd = 33.2000; 
    let tryPerEur = 36.1000; 
    let onsPerUsd = 4200.00; // Ons Altın Dolar Fiyatı Varsayılanı
    let tryPerGramAltin = 2500.00; 
    
    // Değişim yüzdeleri (Simülasyon olarak kalır)
    const ALTIN_DEGISM_YUZDESI_GRAM = 1.15; 
    const ALTIN_DEGISM_YUZDESI_CEYREK = 0.90;
    const DOVIZ_DEGISM_USD = 0.35;
    const DOVIZ_DEGISM_EUR = -0.15;

    // --- 1. Döviz Verisini Çekme (USD, EUR) - Fixer API'den ---
    try {
        const dovizResponse = await fetch(FIXER_URL);
        const dovizData = await dovizResponse.json();
        
        if (dovizData?.rates && dovizData.success) {
            const eurTry = dovizData.rates.TRY;
            const eurUsd = dovizData.rates.USD;
            
            tryPerUsd = eurTry / eurUsd;
            tryPerEur = eurTry; 
        } else {
             console.error("Fixer API'den döviz verisi alınamadı.");
        }
    } catch (error) {
        console.error("Döviz API çekiminde hata:", error);
    }
    
    // --- 2. Altın Verisini Çekme (Ons Altın/USD) - Metals-API'den ---
    try {
        const altinResponse = await fetch(METALS_URL);
        const altinData = await altinResponse.json();
        
        if (altinData?.rates && altinData.success && altinData.rates.XAU) {
            
            // KESİN DÜZELTME BURADA: API, 1 USD'nin kaç XAU ettiğini veriyor.
            // Biz 1 XAU'nun kaç USD ettiğini bulmak için tersini almalıyız.
            const XAU_PER_USD = altinData.rates.XAU; 
            onsPerUsd = 1 / XAU_PER_USD; // Ons Altın/USD fiyatı
            
        } else {
            console.error("Metals-API'den Ons Altın verisi alınamadı. Hata kodu:", altinData?.error?.code);
        }
    } catch (error) {
        console.error("Altın API çekiminde hata:", error);
    }
    
    // --- 3. Nihai Altın Fiyatı Hesaplamaları ---
    
    // Ons Altın/TRY = (Ons Altın/USD) * (USD/TRY)
    const onsPerTry = onsPerUsd * tryPerUsd;
    
    // Gram Altın (24 ayar has) = Ons Altın/TRY / 31.1035
    const ONS_KARSILIGI_GRAM = 31.1035; // 1 Troy Ons = 31.1035 gramdır.
    tryPerGramAltin = onsPerTry / ONS_KARSILIGI_GRAM;
    
    // Çeyrek Altın Hesabı: Çeyrek Altın (has) yaklaşık 1.754 gramdır.
    const tryPerCeyrekAltin = tryPerGramAltin * 1.754; 
    
    // Ekranı temizle
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma (Sıralama değiştirilmedi) ---
    
    // 1. Amerikan Doları (USD) - Canlı, hesaplanmış kur
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', tryPerUsd, DOVIZ_DEGISM_USD); 
    
    // 2. Euro (EUR) - Canlı kur
    kurAlani.innerHTML += kartOlustur('Euro', 'EUR', tryPerEur, DOVIZ_DEGISM_EUR); 

    // 3. Gram Altın (XAU/TRY) - Canlı ve Hesaplanan
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', tryPerGramAltin, ALTIN_DEGISM_YUZDESI_GRAM); 
    
    // 4. Çeyrek Altın (ÇYRK) - Hesaplanan
    kurAlani.innerHTML += kartOlustur('Çeyrek Altın', 'ÇYRK', tryPerCeyrekAltin, ALTIN_DEGISM_YUZDESI_CEYREK); 

}

// Kart oluşturma fonksiyonu (Değişmedi)
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
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
