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

// Veri çekme ve güncelleme
verileriCek();
setInterval(verileriCek, 10000); 

// --- MODAL, GRAFİK VE YENİ ÖZELLİKLER ---

// Modal Kapatma Olayları
kapatDugmesi.onclick = function() {
  modal.style.display = "none";
  seciliKartlar = []; 
  document.querySelectorAll('.kur-kart').forEach(k => k.classList.remove('secili'));
  // Kapatıldığında varsayılan başlık mesajını geri yükle
  document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Karşılaştırma için 2 karta tıklayın!`;
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    seciliKartlar = [];
    document.querySelectorAll('.kur-kart').forEach(k => k.classList.remove('secili'));
    // Kapatıldığında varsayılan başlık mesajını geri yükle
    document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Karşılaştırma için 2 karta tıklayın!`;
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

// Karşılaştırmalı Grafiği Çizen Fonksiyon (Çift Y Ekseni Desteği Garanti Edildi)
function cizKarsilastirmaGrafik(kart1, kart2, zamanDilimi) {
    
    const veriAdedi = 100;
    const veri1 = gecmisVeriSimulasyonu(kart1.fiyat, veriAdedi, zamanDilimi);
    const veri2 = gecmisVeriSimulasyonu(kart2.fiyat, veriAdedi, zamanDilimi);
    
    if (mevcutGrafik) {
        mevcutGrafik.destroy();
    }
    
    // Tema renklerini al
    const isLight = document.body.classList.contains('light');
    const fontColor = isLight ? '#333' : '#f0f0f0';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    
    // Eksene göre renkleri tanımla
    const y1Color = isLight ? '#007bff' : '#ffcc00'; // Sol Eksen Rengi
    const y2Color = isLight ? '#dc3545' : '#17a2b8'; // Sağ Eksen Rengi (Düşük fiyatlı varlık için)

    grafikBaslik.textContent = `${kart1.isim} vs ${kart2.isim} Karşılaştırması`;
    
    const ctx = document.getElementById('fiyatGrafik').getContext('2d');
    
    // --- ÇİFT EKSEN MANTIĞI ---
    
    // Fiyat farkı oranını kontrol et. Oran > 1000 ise Çift Eksen kullan
    const fiyatOrani = Math.max(kart1.fiyat, kart2.fiyat) / Math.min(kart1.fiyat, kart2.fiyat);
    const ciftEksenGerekli = fiyatOrani > 1000;
    
    // Hangi varlığın y1'e (büyük) ve y2'ye (küçük) atanacağını belirle
    let y1Varliği, y2Varliği;
    let y1Veri, y2Veri;
    let y1VeriSetiRengi, y2VeriSetiRengi;

    if (ciftEksenGerekli) {
        if (kart1.fiyat > kart2.fiyat) {
            // kart1 büyük (y1), kart2 küçük (y2)
            y1Varliği = kart1;
            y1Veri = veri1;
            y2Varliği = kart2;
            y2Veri = veri2;
            y1VeriSetiRengi = y1Color;
            y2VeriSetiRengi = y2Color;
        } else {
            // kart2 büyük (y1), kart1 küçük (y2)
            y1Varliği = kart2;
            y1Veri = veri2;
            y2Varliği = kart1;
            y2Veri = veri1;
            y1VeriSetiRengi = y1Color;
            y2VeriSetiRengi = y2Color;
        }
    } else {
        // Tek eksen kullanılıyorsa, sırayla y1'e atarız.
        y1Varliği = kart1;
        y1Veri = veri1;
        y2Varliği = kart2;
        y2Veri = veri2;
        y1VeriSetiRengi = y1Color; 
        y2VeriSetiRengi = isLight ? '#28a745' : '#17a2b8'; // İkinci varlığa farklı bir renk
    }
    
    // Dataset'leri oluştur
    const datasets = [
        {
            label: `${y1Varliği.isim} (₺)`,
            data: y1Veri.veriler,
            borderColor: y1VeriSetiRengi, 
            backgroundColor: `${y1VeriSetiRengi}20`,
            tension: 0.2, 
            pointRadius: 0,
            yAxisID: 'y1' 
        },
        {
            label: `${y2Varliği.isim} (₺)`,
            data: y2Veri.veriler,
            borderColor: y2VeriSetiRengi, 
            backgroundColor: `${y2VeriSetiRengi}20`,
            tension: 0.2, 
            pointRadius: 0,
            yAxisID: ciftEksenGerekli ? 'y2' : 'y1' // Eğer çift eksen varsa y2 kullan
        }
    ];

    // Scales (Eksenler) ayarını oluştur
    const scales = {
        x: {
            title: { display: true, text: zamanDilimi, color: fontColor },
            ticks: { color: fontColor },
            grid: { color: gridColor }
        },
        // Sol Ekseni (y1) tanımla
        y1: {
            type: 'linear',
            position: 'left',
            beginAtZero: false,
            title: { display: true, text: `Fiyat (${y1Varliği.sembol})`, color: y1Color }, // Başlıkta sembolü göster
            ticks: { color: y1Color },
            grid: { color: gridColor }
        }
    };

    // Eğer çift eksen gerekiyorsa, Sağ Ekseni (y2) ekle
    if (ciftEksenGerekli) {
        scales.y2 = {
            type: 'linear',
            position: 'right', // Sağ tarafa konumlandır
            beginAtZero: false,
            title: { display: true, text: `Fiyat (${y2Varliği.sembol})`, color: y2Color }, // Başlıkta sembolü göster
            ticks: { color: y2Color },
            grid: { drawOnChartArea: false } 
        };
        // Başlıkta çift eksen kullanıldığına dair uyarı
        document.querySelector('header p').textContent = `⚠️ Çift Y ekseni kullanılıyor (Fiyat farkı çok büyük).`;
    } else {
        // Tek eksen kullanılıyorsa varsayılan mesajı göster
        document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Karşılaştırma için 2 karta tıklayın!`;
    }
    
    mevcutGrafik = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: veri1.etiketler,
            datasets: datasets 
        },
        options: {
            responsive: true,
            scales: scales, // Oluşturulan scales objesini kullan
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
            
            // Modal açıksa, kapat (Yeni bir seçim başlarken temizlik)
            if (modal.style.display !== "none") {
                modal.style.display = "none";
                if (mevcutGrafik) mevcutGrafik.destroy();
            }
            
            const fiyat = parseFloat(kart.getAttribute('data-fiyat'));
            const isim = kart.getAttribute('data-isim');
            const sembol = kart.getAttribute('data-sembol');
            
            const kartVerisi = { fiyat, isim, sembol };
            let kartIndex = seciliKartlar.findIndex(item => item.sembol === sembol);

            if (kartIndex !== -1) {
                // Kart zaten seçiliyse: Seçimi kaldır
                kart.classList.remove('secili');
                seciliKartlar.splice(kartIndex, 1);
                // Seçim kalktığı için başlık mesajını varsayılana çevir
                if (seciliKartlar.length === 0) {
                    document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Karşılaştırma için 2 karta tıklayın!`;
                }
            } else if (seciliKartlar.length < 2) {
                // Seçili değilse ve 2'den az kart seçiliyse: Seçimi ekle
                kart.classList.add('secili');
                seciliKartlar.push(kartVerisi);
            } else {
                // Zaten 2 kart seçiliyse: 3. tıklamayı yoksay
                return; 
            }

            // Seçim durumu kontrolü
            if (seciliKartlar.length === 2) {
                // 2 kart seçiliyse: Karşılaştırma grafiğini çiz
                
                const isHizliVarlik = (s) => s === 'BTC' || s === 'XAU' || s === 'ÇYRK';
                // İkisi de hızlı varlıksa Saat, değilse Gün zaman dilimini kullan
                let zaman = (isHizliVarlik(seciliKartlar[0].sembol) && isHizliVarlik(seciliKartlar[1].sembol)) ? 'Saat' : 'Gün';
                
                cizKarsilastirmaGrafik(seciliKartlar[0], seciliKartlar[1], zaman);
                
            } else if (seciliKartlar.length === 1) {
                // 1 kart seçiliyse: Kullanıcıya ikinciyi seçmesini bildir (sadece ana başlık altında)
                
                const seciliIsim = seciliKartlar[0].isim;
                document.querySelector('header p').textContent = `${seciliIsim} seçildi. Karşılaştırmak için lütfen ikinci bir kart seçin.`;
                
            } else if (seciliKartlar.length === 0) {
                // 0 kart seçiliyse: Varsayılan mesajı göster
                document.querySelector('header p').textContent = `Veriler her 10 saniyede bir güncellenir. Karşılaştırma için 2 karta tıklayın!`;
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
        const isLight = document.body.classList.contains('light');
        const fontColor = isLight ? '#333' : '#f0f0f0';
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        const y1Color = isLight ? '#007bff' : '#ffcc00'; 
        const y2Color = isLight ? '#dc3545' : '#17a2b8'; 
        
        // Eksen renklerini güncelle
        mevcutGrafik.options.scales.y1.ticks.color = y1Color;
        mevcutGrafik.options.scales.y1.grid.color = gridColor;
        mevcutGrafik.options.scales.y1.title.color = y1Color;

        if (mevcutGrafik.options.scales.y2) {
             mevcutGrafik.options.scales.y2.ticks.color = y2Color;
             mevcutGrafik.options.scales.y2.title.color = y2Color;
        }

        mevcutGrafik.options.scales.x.ticks.color = fontColor;
        mevcutGrafik.options.scales.x.grid.color = gridColor;
        mevcutGrafik.options.scales.x.title.color = fontColor;
        mevcutGrafik.options.plugins.legend.labels.color = fontColor;
        
        // Dataset renklerini güncelle (Çift eksenli modda bile doğru rengi korur)
        mevcutGrafik.data.datasets.forEach(dataset => {
            if (dataset.yAxisID === 'y1') {
                dataset.borderColor = y1Color;
                dataset.backgroundColor = `${y1Color}20`;
            } else if (dataset.yAxisID === 'y2') {
                dataset.borderColor = y2Color;
                dataset.backgroundColor = `${y2Color}20`;
            }
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
