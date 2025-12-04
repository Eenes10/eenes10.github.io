const kurAlani = document.getElementById('kur-kartlari');

// Kripto için CoinGecko API'si (BTC fiyatı ve 24s değişimini çeker)
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try&include_24hr_change=true';

// Döviz ve Altın verileri için simülasyon (Gerçek projede burayı API ile değiştirmelisiniz)
const guncelDovizData = {
    // Gerçek ve güncel fiyatları temsil eden simülasyon verileridir.
    'USD': { fiyat: 32.5870, degisim: 0.45 },
    'EUR': { fiyat: 35.5120, degisim: -0.12 },
    'XAU': { fiyat: 2420.50, degisim: 1.15 } // Gram Altın
};

async function verileriCek() {
    try {
        // --- 1. Kripto Verisini Çekme (BTC) ---
        const cryptoResponse = await fetch(CRYPTO_API);
        const cryptoData = await cryptoResponse.json();
        
        // Ekranı temizle
        kurAlani.innerHTML = ''; 

        // --- Kartları Oluşturma ---
        
        // 1. Bitcoin (BTC)
        const btcFiyat = cryptoData.bitcoin.try;
        // CoinGecko'dan gelen değişim yüzdesi 
        const btcDegisim = cryptoData.bitcoin.try_24h_change || 0; 
        kurAlani.innerHTML += kartOlustur('Bitcoin', 'BTC', btcFiyat, btcDegisim);

        // 2. Gram Altın (XAU) - Simülasyon
        const altin = guncelDovizData.XAU;
        kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', altin.fiyat, altin.degisim);

        // 3. Amerikan Doları (USD) - Simülasyon
        const dolar = guncelDovizData.USD;
        kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', dolar.fiyat, dolar.degisim);

        // 4. Euro (EUR) - Simülasyon
        const euro = guncelDovizData.EUR;
        kurAlani.innerHTML += kartOlustur('Euro', 'EUR', euro.fiyat, euro.degisim);

    } catch (error) {
        // Hata durumunda ekrana mesajı yazdır
        kurAlani.innerHTML = `<p style="color: red; text-align: center;">Veri çekme hatası oluştu: ${error.message}</p>`;
    }
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
