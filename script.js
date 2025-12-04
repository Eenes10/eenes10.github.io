const kurAlani = document.getElementById('kur-kartlari');

// Kripto için CoinGecko API'si (BTC fiyatı ve 24s değişimini çeker)
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true';

// API'dan veri gelmeme ihtimaline karşı kullanılacak GÜVENLİ simülasyon verileri.
const SIMULASYON_DOVIZ_DATA = {
    'USD': { fiyat: 32.6500, degisim: 0.45 },
    'EUR': { fiyat: 35.6000, degisim: -0.12 },
    'XAU': { fiyat: 2420.50, degisim: 1.15 } // Gram Altın (TRY)
};

async function verileriCek() {
    let btcFiyat = null;
    let btcDegisim = 0;
    const kurAlani = document.getElementById('kur-kartlari');

// Kripto için CoinGecko API'si (BTC fiyatı ve 24s değişimini çeker)
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true';

// ÖNEMLİ: Bu veriler simülasyondur ve canlı değildir. 
// GERÇEK, CANLI KURLAR İÇİN BU DEĞERLERİ GÜNCEL PİYASA FİYATLARIYLA DEĞİŞTİRMELİSİNİZ.
const SIMULASYON_DOVIZ_DATA = {
    // 2025 fiyatlarına yakın, mantıklı placeholder veriler
    'USD': { fiyat: 33.1500, degisim: 0.25 }, // Amerikan Doları/TRY
    'EUR': { fiyat: 36.0000, degisim: -0.10 }, // Euro/TRY
    'XAU': { fiyat: 2470.50, degisim: 1.15 } // Gram Altın (TRY) fiyatı
};

async function verileriCek() {
    let btcFiyat = null;
    let btcDegisim = 0;
    
    try {
        // --- 1. Kripto Verisini Çekme (BTC) ---
        const cryptoResponse = await fetch(CRYPTO_API);
        const cryptoData = await cryptoResponse.json();
        
        if (cryptoData && cryptoData.bitcoin && cryptoData.bitcoin.try) {
            btcFiyat = cryptoData.bitcoin.try;
            btcDegisim = cryptoData.bitcoin.try_24h_change || 0; 
        } else {
            console.error("CoinGecko'dan BTC verisi alınamadı. Simülasyon kullanılacak.");
        }

    } catch (error) {
        console.error("BTC API çekiminde hata:", error);
    }
    
    // Ekranı temizle
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma ---
    
    // 1. Bitcoin (BTC) - API'dan gelmezse simülasyon kullanılır.
    const finalBtcFiyat = btcFiyat || 4000000.00; 
    const finalBtcDegisim = btcFiyat ? btcDegisim : 1.50; 

    kurAlani.innerHTML += kartOlustur('Bitcoin', 'BTC', finalBtcFiyat, finalBtcDegisim);

    // 2. Gram Altın (XAU) - Simülasyon verileri kullanılır.
    const altin = SIMULASYON_DOVIZ_DATA.XAU;
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', altin.fiyat, altin.degisim);

    // 3. Amerikan Doları (USD) - Simülasyon verileri kullanılır.
    const dolar = SIMULASYON_DOVIZ_DATA.USD;
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', dolar.fiyat, dolar.degisim);

    // 4. Euro (EUR) - Simülasyon verileri kullanılır.
    const euro = SIMULASYON_DOVIZ_DATA.EUR;
    kurAlani.innerHTML += kartOlustur('Euro', 'EUR', euro.fiyat, euro.degisim);
}

// Estetik kart HTML yapısını oluşturan fonksiyon
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    
    // Fiyatı TR formatında virgül ve nokta ile formatla (4 haneli hassasiyet)
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    
    // Değişime göre CSS sınıfı ve metni belirle
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

// Sayfa yüklendiğinde veriyi çek
verileriCek();
// setInterval ile her 10 saniyede bir veriyi tekrar çek ve kartları güncelle
setInterval(verileriCek, 10000);
    try {
        // --- 1. Kripto Verisini Çekme (BTC) ---
        const cryptoResponse = await fetch(CRYPTO_API);
        const cryptoData = await cryptoResponse.json();
        
        // Verinin doğru geldiğini kontrol et
        if (cryptoData && cryptoData.bitcoin && cryptoData.bitcoin.try) {
            btcFiyat = cryptoData.bitcoin.try;
            // 24 saatlik değişim yoksa 0 al
            btcDegisim = cryptoData.bitcoin.try_24h_change || 0; 
        } else {
            console.error("CoinGecko'dan BTC verisi alınamadı. Simülasyon kullanılacak.");
        }

    } catch (error) {
        // BTC API çekiminde hata olursa konsola yazdır
        console.error("BTC API çekiminde hata:", error);
    }
    
    // Ekranı temizle (API hatası alsa bile kartlar bu noktada yüklenir)
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma ---
    
    // 1. Bitcoin (BTC) - Eğer gerçek veri alınamadıysa simülasyon kullan
    const finalBtcFiyat = btcFiyat || 3950000.00; // API hata verirse bu fiyatı kullan
    const finalBtcDegisim = btcFiyat ? btcDegisim : 1.50; // API hata verirse bu değişimi kullan

    kurAlani.innerHTML += kartOlustur('Bitcoin', 'BTC', finalBtcFiyat, finalBtcDegisim);

    // 2. Gram Altın (XAU) - Simülasyon
    const altin = SIMULASYON_DOVIZ_DATA.XAU;
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', altin.fiyat, altin.degisim);

    // 3. Amerikan Doları (USD) - Simülasyon
    const dolar = SIMULASYON_DOVIZ_DATA.USD;
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', dolar.fiyat, dolar.degisim);

    // 4. Euro (EUR) - Simülasyon
    const euro = SIMULASYON_DOVIZ_DATA.EUR;
    kurAlani.innerHTML += kartOlustur('Euro', 'EUR', euro.fiyat, euro.degisim);
}

// Estetik kart HTML yapısını oluşturan fonksiyon
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    
    // Fiyatı TR formatında virgül ve nokta ile formatla
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    
    // Değişime göre CSS sınıfı ve metni belirle
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

// Sayfa yüklendiğinde veriyi çek
verileriCek();
// setInterval ile her 10 saniyede bir veriyi tekrar çek ve kartları güncelle
setInterval(verileriCek, 10000);

