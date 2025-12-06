// Global değişkenler
const kurAlani = document.getElementById('kur-kartlari');
const modal = document.getElementById('modal');
const kapatDugmesi = document.getElementsByClassName("kapat-dugmesi")[0];
const grafikBaslik = document.getElementById('grafik-baslik');
let mevcutGrafik; 
let seciliKartlar = []; // Karşılaştırma modu için

// --- API ANAHTARLARI VE URL'LER ---
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD,GBP,CHF`; 
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=usd';

async function verileriCek() {
    // Varsayılan değerler
    let tryPerUsd = 33.2000; 
    let tryPerEur = 36.1000; 
    let tryPerGbp = 40.5000; 
    let tryPerChf = 35.0000; 
    let onsPerUsd = 2000.00;
    let usdPerBtc = 60000.00;
    let tryPerGramAltin = 2000.00; 
    
    // Değişim yüzdeleri (Simülasyon)
    const ALTIN_DEGISM_YUZDESI_GRAM = 1.15; 
    const ALTIN_DEGISM_YUZDESI_CEYREK = 0.90;
    const DOVIZ_DEGISM_USD = 0.35;
    const DOVIZ_DEGISM_EUR = -0.15;
    const DOVIZ_DEGISM_GBP = 0.50;
    const DOVIZ_DEGISM_CHF = -0.05;
    const BTC_DEGISM_YUZDESI = 1.50;

    // --- 1. Döviz Verisini Çekme ---
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
    
    // --- 2. Kripto ve Altın Verisini Çekme ---
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

    // Kartlar oluşturulduktan sonra tıklama dinleyicilerini ekle
    kartTiklamaDinleyicileriEkle();
}

// Kart oluşturma fonksiyonu
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    const minD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    const maxD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: minD, maximumFractionDigits: maxD });
    const degisimSinifi = degisimYuzdesi >= 0 ? 'pozitif' : 'negatif';
    const degisimMetni = degisimYuzdesi.toFixed(2) + '%';
    
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

verileriCek();
setInterval(verileriCek, 10000); 

// --- MODAL, GRAFİK VE YENİ ÖZELLİKLER ---

// Modal Kapatma Olayları
kapatDugmesi.onclick = function() {
  modal.style.display = "none";
  seciliKartlar = []; 
  document.querySelectorAll('.kur-kart').forEach(k => k.classList.remove('secili'));
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    seciliKartlar = [];
    document.querySelectorAll('.kur-kart').forEach(k => k.classList.remove('secili'));
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

// Karşılaştırmalı Grafiği Çizen Fonksiyon
function cizKarsilastirmaGrafik(kart1, kart2, zamanDilimi) {
    
    const veriAdedi = 100;
    const veri1 = gecmisVeriSimulasyonu(kart1.fiyat, veriAdedi, zamanDilimi);
    const veri2 = gecmisVeriSimulasyonu(kart2.fiyat, veriAdedi, zamanDilimi);
    
    if (mevcutGrafik) {
        mevcutGrafik.destroy();
    }
    
    const isLight = document.body.classList.contains('light');
    const primaryColor = isLight ? '#007bff' : '#ffcc00';
    const secondaryColor = isLight ? '#28a745' : '#17a2b8';
    const fontColor = isLight ? '#333' : '#f0f0f0';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    grafikBaslik.textContent = `${kart1.isim} vs ${kart2.isim} Karşılaştırması`;
    
    const ctx = document.getElementById('fiyatGrafik').getContext('2d');
    
    mevcutGrafik = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: veri1.etiketler,
            datasets: [
                {
                    label: `${kart1.isim} (₺)`,
                    data: veri1.veriler,
                    borderColor: primaryColor, 
                    backgroundColor: `${primaryColor}20`,
                    tension: 0.2, 
                    pointRadius: 0
                },
                {
                    label: `${kart2.isim} (₺)`,
                    data: veri2.veriler,
                    borderColor: secondaryColor, 
                    backgroundColor: `${secondaryColor}20`,
                    tension: 0.2, 
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: 'Fiyat (₺)', color: fontColor },
                    ticks: { color: fontColor },
                    grid: { color: gridColor }
                },
                x: {
                    title: { display: true, text: zamanDilimi, color: fontColor },
                    ticks: { color: fontColor },
                    grid: { color: gridColor }
                }
            },
            plugins: {
                legend: { display: true, labels: { color: fontColor } }
            }
        }
    });

    modal.style.display = "block";
}


// Kartlara tıklama olayını ekleyen fonksiyon (Karşılaştırma mantığı düzeltildi)
function kartTiklamaDinleyicileriEkle() {
    
    // Olay dinleyicilerini sıfırlamak için kart alanını klonla ve değiştir
    const kartAlaniClone = kurAlani.cloneNode(true);
    kurAlani.parentNode.replaceChild(kartAlaniClone, kurAlani);
    const guncelKartlar = document.querySelectorAll('.kur-kart');

    // Mevcut kartlar üzerinden dinleyicileri tekrar kur
    guncelKartlar.forEach(kart => {
        kart.addEventListener('click', () => {
            
            const fiyat = parseFloat(kart.getAttribute('data-fiyat'));
            const isim = kart.getAttribute('data-isim');
            const sembol = kart.getAttribute('data-sembol');
            
            const kartVerisi = { fiyat, isim, sembol };
            let kartIndex = seciliKartlar.findIndex(item => item.sembol === sembol);

            if (kartIndex !== -1) {
                // Kart zaten seçiliyse: Seçimi kaldır
                kart.classList.remove('secili');
                seciliKartlar.splice(kartIndex, 1);
            } else if (seciliKartlar.length < 2) {
                // Seçili değilse ve 2'den az kart seçiliyse: Seçimi ekle
                kart.classList.add('secili');
                seciliKartlar.push(kartVerisi);
            } else {
                // Zaten 2 kart seçiliyse: Tıklamayı yok say
                return; 
            }

            // Seçim durumu kontrolü
            if (seciliKartlar.length === 2) {
                // 2 kart seçiliyse: Karşılaştırma grafiğini çiz
                
                const isHizliVarlik = (s) => s === 'BTC' || s === 'XAU' || s === 'ÇYRK';
                let zaman = (isHizliVarlik(seciliKartlar[0].sembol) && isHizliVarlik(seciliKartlar[1].sembol)) ? 'Saat' : 'Gün';
                
                cizKarsilastirmaGrafik(seciliKartlar[0], seciliKartlar[1], zaman);
                
            } else if (seciliKartlar.length === 1) {
                // 1 kart seçiliyse: Kullanıcıya ikinciyi seçmesini bildir
                
                if (modal.style.display !== "none") {
                    if (mevcutGrafik) mevcutGrafik.destroy();
                    modal.style.display = "none";
                }
                
                const seciliIsim = seciliKartlar[0].isim;
                document.querySelector('header p').textContent = `${seciliIsim} seçildi. Karşılaştırmak için lütfen ikinci bir kart seçin.`;
                
            } else if (seciliKartlar.length === 0) {
                // 0 kart seçiliyse: Varsayılan mesajı göster
                document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Karşılaştırma için 2 karta tıklayın!`;
                
                if (modal.style.display !== "none") {
                    if (mevcutGrafik) mevcutGrafik.destroy();
                    modal.style.display = "none";
                }
            }
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
        // Grafiği yeniden çizmeden renkleri ve eksen etiketlerini güncelle
        const isLight = document.body.classList.contains('light');
        const fontColor = isLight ? '#333' : '#f0f0f0';
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        
        mevcutGrafik.options.scales.y.ticks.color = fontColor;
        mevcutGrafik.options.scales.x.ticks.color = fontColor;
        mevcutGrafik.options.scales.y.grid.color = gridColor;
        mevcutGrafik.options.scales.x.grid.color = gridColor;
        mevcutGrafik.options.plugins.legend.labels.color = fontColor;
        
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
