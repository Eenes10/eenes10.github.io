const kurAlani = document.getElementById('kur-kartlari');

// Döviz için Fixer.io API anahtarınız
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD`; 

// Metals-API anahtarınız (Altın için)
const METALS_API_KEY = 'API_KEY'; // Lütfen buradaki 'API_KEY' yerine kendi Metals-API anahtarınızı yapıştırın.
const METALS_URL = `https://api.metals-api.com/v1/latest?access_key=${METALS_API_KEY}&base=XAU&symbols=TRY`; 

async function verileriCek() {
    // API çekimi başarısız olursa kullanılacak varsayılan değerler
    let tryPerUsd = 33.2000; 
    let tryPerEur = 36.1000; 
    let tryPerGramAltin = 2500.00; 
    
    // Değişim yüzdeleri (API'ler ücretsiz planda bu veriyi vermediği için simülasyon kalır)
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
            
            // Hesaplama: USD/TRY kuru = (EUR/TRY) / (EUR/USD)
            tryPerUsd = eurTry / eurUsd;
            tryPerEur = eurTry; 
        } else {
             console.error("Fixer API'den veri alınamadı. Fixer hata kodu:", dovizData?.error?.code);
        }
    } catch (error) {
        console.error("Döviz API çekiminde hata:", error);
    }
    
    // --- 2. Altın Verisini Çekme (Gram Altın - XAU) - Metals-API'den ---
    try {
        const altinResponse = await fetch(METALS_URL);
        const altinData = await altinResponse.json();
        
        if (altinData?.rates && altinData.success) {
            // Gelen değer, 1 Ons Altının kaç TRY olduğunu gösterir.
            const onsTry = altinData.rates.TRY;
            const ONS_KARSILIGI_GRAM = 31.1035; // 1 Troy Ons = 31.1035 gramdır.
            
            // Gram Altın fiyatı (24 ayar has)
            tryPerGramAltin = onsTry / ONS_KARSILIGI_GRAM;
        } else {
            console.error("Metals-API'den veri alınamadı. Metals-API hata kodu:", altinData?.error?.code);
        }
    } catch (error) {
        console.error("Altın API çekiminde hata:", error);
    }
    
    // Çeyrek Altın Hesabı: Çeyrek Altın (has) yaklaşık 1.754 gramdır.
    const tryPerCeyrekAltin = tryPerGramAltin * 1.754; 
    
    // Ekranı temizle
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma ---
    
    // 1. Gram Altın (XAU/TRY) - Canlı
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', tryPerGramAltin, ALTIN_DEGISM_YUZDESI_GRAM); 
    
    // 2. Çeyrek Altın (ÇYRK) - Hesaplanan Canlı
    kurAlani.innerHTML += kartOlustur('Çeyrek Altın', 'ÇYRK', tryPerCeyrekAltin, ALTIN_DEGISM_YUZDESI_CEYREK); 

    // 3. Amerikan Doları (USD) - Canlı, hesaplanmış kur
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', tryPerUsd, DOVIZ_DEGISM_USD); 

    // 4. Euro (EUR) - Canlı kur
    kurani.innerHTML += kartOlustur('Euro', 'EUR', tryPerEur, DOVIZ_DEGISM_EUR); 

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
