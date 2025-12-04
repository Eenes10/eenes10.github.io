const kurAlani = document.getElementById('kur-kartlari');

// Sizin Fixer.io API anahtarınız
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 

// Fixer API: Base (Ana) Para Birimi EUR olmak zorundadır (Ücretsiz plan kısıtlaması)
// Çekilecek kurlar: TRY (Türk Lirası), USD (Amerikan Doları)
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD`; 

// Kripto için CoinGecko API'si
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true';

// Fixer'dan çekilemeyen Altın fiyatı için simülasyon verisi (Geçici)
const SIMULASYON_ALTIN_VERISI = { fiyat: 2470.50, degisim: 1.15 }; 

async function verileriCek() {
    let btcFiyat = null;
    let btcDegisim = 0;
    
    // Varsayılan değerler (API çekimi başarısız olursa bunlar kullanılır)
    let tryPerUsd = 33.2000; 
    let tryPerEur = 36.1000; 

    // 1. Kripto Verisini Çekme (BTC)
    try {
        const cryptoResponse = await fetch(CRYPTO_API);
        const cryptoData = await cryptoResponse.json();
        
        if (cryptoData?.bitcoin?.try) {
            btcFiyat = cryptoData.bitcoin.try;
            btcDegisim = cryptoData.bitcoin.try_24h_change || 0; 
        }
    } catch (error) {
        console.error("BTC API çekiminde hata:", error);
    }

    // 2. Döviz Verisini Çekme (USD, EUR) - Fixer API'den
    try {
        const dovizResponse = await fetch(FIXER_URL);
        const dovizData = await dovizResponse.json();
        
        if (dovizData?.rates && dovizData.success) {
            const eurTry = dovizData.rates.TRY;
            const eurUsd = dovizData.rates.USD;

            // Fixer, EUR bazlı kur verdiği için USD/TRY kurunu hesaplıyoruz.
            tryPerUsd = eurTry / eurUsd;
            tryPerEur = eurTry; // EUR/TRY kuru
            
            // Not: Fixer ücretsiz planı 24s değişim verisi sağlamaz, bu yüzden değişim yüzdeleri simülasyon kalır.
        } else {
             console.error("Fixer API'den veri alınamadı. Hata kodu:", dovizData?.error?.code, dovizData?.error?.info);
        }
    } catch (error) {
        console.error("Döviz API çekiminde hata:", error);
    }
    
    // Ekranı temizle
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma ---
    
    // 1. Bitcoin (BTC)
    const finalBtcFiyat = btcFiyat || 4000000.00; 
    const finalBtcDegisim = btcFiyat ? btcDegisim : 1.50; 
    kurAlani.innerHTML += kartOlustur('Bitcoin', 'BTC', finalBtcFiyat, finalBtcDegisim);

    // 2. Gram Altın (XAU) - Simülasyon
    const altin = SIMULASYON_ALTIN_VERISI;
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', altin.fiyat, altin.degisim);

    // 3. Amerikan Doları (USD) - Canlı, hesaplanmış kur
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', tryPerUsd, 0.35); // Değişim simülasyonu

    // 4. Euro (EUR) - Canlı kur
    kurAlani.innerHTML += kartOlustur('Euro', 'EUR', tryPerEur, -0.15); // Değişim simülasyonu
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
