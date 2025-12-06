// Global değişkenler
const kurAlani = document.getElementById('kur-kartlari');
const modal = document.getElementById('modal');
const kapatDugmesi = document.getElementsByClassName("kapat-dugmesi")[0];
const grafikBaslik = document.getElementById('grafik-baslik');
let mevcutGrafik; 
// seciliKartlar değişkeni ve karşılaştırma mantığı kaldırıldı.

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
    
    // Simülasyon ya da gerçek USD kuru ile hesaplamalar
    const tryPerBtc = usdPerBtc * tryPerUsd;
    const onsPerTry = onsPerUsd * tryPerUsd;
    const ONS_KARSILIGI_GRAM = 31.1035; 
    const tryPerGramAltin = onsPerTry / ONS_KARSILIGI_GRAM;
    const tryPerCeyrekAltin = tryPerGramAltin * 1.754; 
    
    // Ekranı temizle
    kurAlani.innerHTML = ''; 

    // --- Kartları Oluşturma ---
    // data-fiyat, data-isim, data-sembol nitelikleri grafiği çizmek için geri eklendi.
    kurAlani.innerHTML += kartOlustur('Bitcoin', 'BTC', tryPerBtc, BTC_DEGISM_YUZDESI); 
    kurAlani.innerHTML += kartOlustur('Gram Altın', 'XAU', tryPerGramAltin, ALTIN_DEGISM_YUZDESI_GRAM); 
    kurAlani.innerHTML += kartOlustur('Çeyrek Altın', 'ÇYRK', tryPerCeyrekAltin, ALTIN_DEGISM_YUZDESI_CEYREK); 
    kurAlani.innerHTML += kartOlustur('Amerikan Doları', 'USD', tryPerUsd, DOVIZ_DEGISM_USD); 
    kurAlani.innerHTML += kartOlustur('Euro', 'EUR', tryPerEur, DOVIZ_DEGISM_EUR); 
    kurAlani.innerHTML += kartOlustur('İngiliz Sterlini', 'GBP', tryPerGbp, DOVIZ_DEGISM_GBP); 
    kurAlani.innerHTML += kartOlustur('İsviçre Frangı', 'CHF', tryPerChf, DOVIZ_DEGISM_CHF); 

    // Kartlar oluşturulduktan sonra tıklama dinleyicilerini tekrar ekle
    kartTiklamaDinleyicileriEkle();
    
    // Üstteki başlık mesajı tekil grafiğe göre ayarlandı
    document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Grafik için bir karta tıklayın.`;
}

// Kart oluşturma fonksiyonu
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    const minD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    const maxD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: minD, maximumFractionDigits: maxD });
    const degisimSinifi = degisimYuzdesi >= 0 ? 'pozitif' : 'negatif';
    const degisimMetni = degisimYuzdesi.toFixed(2) + '%';
    
    // cursor: pointer stilinin çalışması için data niteliklerini geri ekledik
    return `
        <div class="kur-kart" data-fiyat="${fiyat}" data-isim="${isim}" data-sembol="${sembol}">
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

// --- MODAL VE GRAFİK İŞLEVLERİ ---

// Modal Kapatma Olayları
kapatDugmesi.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Geçmiş fiyat verilerini simüle eden fonksiyon
function gecmisVeriSimulasyonu(fiyat, veriAdedi = 100, zamanDilimi = 'Gün') {
    const veriler = [];
    const etiketler = [];
    
    let fiyatSim = fiyat * (1 - Math.random() * 0.05); 
    const simdikiTarih = new Date();

    for (let i = 0; i < veriAdedi; i++) {
        fiyatSim += (Math.random() - 0.5) * (fiyat * 0.005);
        
        // YUMUŞATMA (Grafik sıçramasını önler)
        if (i >= veriAdedi * 0.8) {
            const yakinlasmaFaktoru = (i - veriAdedi * 0.8) / (veriAdedi * 0.2);
            fiyatSim = fiyatSim * (1 - yakinlasmaFaktoru) + fiyat * yakinlasmaFaktoru;
        }

        veriler.push(parseFloat(fiyatSim.toFixed(4)));

        // Etiket hesaplama (Gerçekçi Tarih Olarak)
        let tarih = new Date(simdikiTarih);
        
        if (zamanDilimi === 'Gün') {
            tarih.setDate(simdikiTarih.getDate() - (veriAdedi - 1 - i));
            etiketler.push(`${tarih.getDate()} ${tarih.toLocaleString('tr-TR', { month: 'short' })}`);
        } else if (zamanDilimi === 'Saat') {
            tarih.setHours(simdikiTarih.getHours() - (veriAdedi - 1 - i));
            etiketler.push(`${tarih.getHours().toString().padStart(2, '0')}:${tarih.getMinutes().toString().padStart(2, '0')}`);
        }
    }
    
    veriler[veriAdedi - 1] = parseFloat(fiyat.toFixed(4));
    
    return { etiketler, veriler };
}

// Tekil Grafiği Çizen Fonksiyon (Basitleştirildi)
function cizTekilGrafik(kartVerisi, zamanDilimi) {
    
    const veriAdedi = 100;
    const veri = gecmisVeriSimulasyonu(kartVerisi.fiyat, veriAdedi, zamanDilimi);
    
    if (mevcutGrafik) {
        mevcutGrafik.destroy();
    }
    
    // Tema renklerini al
    const isLight = document.body.classList.contains('light');
    const fontColor = isLight ? '#333' : '#f0f0f0';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const cizgiRengi = isLight ? '#007bff' : '#ffcc00'; 

    grafikBaslik.textContent = `${kartVerisi.isim} Fiyat Grafiği`;
    
    const ctx = document.getElementById('fiyatGrafik').getContext('2d');
    
    const datasets = [
        {
            label: `${kartVerisi.isim} (₺)`,
            data: veri.veriler,
            borderColor: cizgiRengi, 
            backgroundColor: `${cizgiRengi}20`,
            tension: 0.2, 
            pointRadius: 0,
            yAxisID: 'y1' 
        }
    ];

    const scales = {
        x: {
            title: { display: true, text: zamanDilimi, color: fontColor },
            ticks: { color: fontColor },
            grid: { color: gridColor }
        },
        y1: {
            type: 'linear',
            position: 'left',
            beginAtZero: false,
            title: { display: true, text: `Fiyat (${kartVerisi.sembol})`, color: fontColor },
            ticks: { color: fontColor },
            grid: { color: gridColor }
        }
    };
    
    mevcutGrafik = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: veri.etiketler,
            datasets: datasets 
        },
        options: {
            responsive: true,
            scales: scales, 
            plugins: {
                legend: { display: true, labels: { color: fontColor } }
            }
        }
    });

    modal.style.display = "block";
}


// Kartlara tıklama olayını ekleyen fonksiyon (Tekil Grafik Mantığı)
function kartTiklamaDinleyicileriEkle() {
    
    // Olay dinleyicilerini sıfırlamak için kart alanını klonla ve değiştir
    const kartAlaniClone = kurAlani.cloneNode(true);
    kurAlani.parentNode.replaceChild(kartAlaniClone, kurAlani);
    const guncelKartlar = document.querySelectorAll('.kur-kart');

    // Mevcut kartlar üzerinden dinleyicileri tekrar kur
    guncelKartlar.forEach(kart => {
        kart.addEventListener('click', () => {
            
            // Eğer daha önce bir grafik çizilmişse yok et
            if (mevcutGrafik) {
                mevcutGrafik.destroy();
            }
            
            const fiyat = parseFloat(kart.getAttribute('data-fiyat'));
            const isim = kart.getAttribute('data-isim');
            const sembol = kart.getAttribute('data-sembol');
            
            const kartVerisi = { fiyat, isim, sembol };
            
            // Hızlı varlıksa Saat, dövizse Gün zaman dilimini kullan
            const isHizliVarlik = (s) => s === 'BTC' || s === 'XAU' || s === 'ÇYRK';
            let zaman = isHizliVarlik(sembol) ? 'Saat' : 'Gün';
            
            cizTekilGrafik(kartVerisi, zaman);
        });
    });
}

// --- TEMA DEĞİŞTİRME MANTIĞI ---

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
    
    // Eğer grafik açıksa, rengi tema ile uyumlu hale getir
    if (mevcutGrafik) {
        const isLight = document.body.classList.contains('light');
        const fontColor = isLight ? '#333' : '#f0f0f0';
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        const cizgiRengi = isLight ? '#007bff' : '#ffcc00'; 
        
        // Eksen renklerini güncelle
        mevcutGrafik.options.scales.y1.ticks.color = fontColor;
        mevcutGrafik.options.scales.y1.grid.color = gridColor;
        mevcutGrafik.options.scales.y1.title.color = fontColor;

        mevcutGrafik.options.scales.x.ticks.color = fontColor;
        mevcutGrafik.options.scales.x.grid.color = gridColor;
        mevcutGrafik.options.scales.x.title.color = fontColor;
        mevcutGrafik.options.plugins.legend.labels.color = fontColor;
        
        // Dataset rengini güncelle
        mevcutGrafik.data.datasets.forEach(dataset => {
            dataset.borderColor = cizgiRengi;
            dataset.backgroundColor = `${cizgiRengi}20`;
        });
        
        mevcutGrafik.update();
    }
});

// Sayfa yüklendiğinde temayı kontrol et
(function kontrolTemayi() {
    if (localStorage.getItem('tema') === 'light') {
        document.body.classList.add('light');
        document.getElementById('temaDegistirBtn').textContent = '🌙';
    }
})();
