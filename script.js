// Global değişkenler
const kurAlani = document.getElementById('kur-kartlari');
const modal = document.getElementById('modal');
const kapatDugmesi = document.getElementsByClassName("kapat-dugmesi")[0];
const grafikBaslik = document.getElementById('grafik-baslik');
let mevcutGrafik; 

// İkon Eşleştirme Fonksiyonu
function getIcon(sembol) {
    switch (sembol) {
        case 'BTC': return '<i class="fa-brands fa-bitcoin kart-icon"></i>';
        case 'XAU': return '<i class="fa-solid fa-sack-dollar kart-icon" style="color:#FFD700;"></i>'; // Altın sarısı
        case 'ÇYRK': return '<i class="fa-solid fa-ring kart-icon" style="color:#FFD700;"></i>';
        case 'USD': return '<i class="fa-solid fa-dollar-sign kart-icon"></i>';
        case 'EUR': return '<i class="fa-solid fa-euro-sign kart-icon"></i>';
        case 'GBP': return '<i class="fa-solid fa-sterling-sign kart-icon"></i>';
        case 'CHF': return '<i class="fa-solid fa-swiss-sign kart-icon"></i>'; 
        default: return '<i class="fa-solid fa-chart-line kart-icon"></i>';
    }
}

async function verileriCek() {
    // API çağrıları devre dışı bırakıldığı için SIMÜLASYON değerleri kullanılır.
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

    // --- Nihai Hesaplamalar ---
    
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

// Yeni kart oluşturma fonksiyonu (Estetik Görünüme Uygun)
function kartOlustur(isim, sembol, fiyat, degisimYuzdesi) {
    const minD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    const maxD = (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') ? 2 : 4;
    
    const formatliFiyat = fiyat.toLocaleString('tr-TR', { minimumFractionDigits: minD, maximumFractionDigits: maxD });
    const degisimSinifi = degisimYuzdesi >= 0 ? 'pozitif' : 'negatif';
    const degisimMetni = degisimYuzdesi.toFixed(2) + '%';
    const ikon = getIcon(sembol);

    // Simülasyon Bilgisi (Estetik amaçlı ve Image'daki ikinci satırı temsil eder)
    const simulasyonBilgisi = `Geçmiş Veri Simülasyonu: ₺ ${ (fiyat * 0.05).toFixed(2) }`;
    
    return `
        <div class="kur-kart" data-fiyat="${fiyat}" data-isim="${isim}" data-sembol="${sembol}">
            
            <div class="kart-sol">
                ${ikon}
                <div class="isim-ve-sembol">
                    <p class="isim">${isim}</p>
                    <p class="sembol">${sembol}</p>
                </div>
            </div>

            <div class="kart-sag">
                <p class="simulasyon-bilgi">${simulasyonBilgisi}</p>
                <div class="fiyat-ve-degisim">
                    <span class="fiyat">₺ ${formatliFiyat}</span>
                    <span class="degisim ${degisimSinifi}">${degisimMetni}</span>
                </div>
            </div>
        </div>
    `;
}

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

// Geçmiş fiyat verilerini simüle eden fonksiyon (Aynı Kaldı)
function gecmisVeriSimulasyonu(fiyat, veriAdedi = 100, zamanDilimi = 'Gün') {
    const veriler = [];
    const etiketler = [];
    
    let fiyatSim = fiyat * (1 - Math.random() * 0.05); 
    const simdikiTarih = new Date();

    for (let i = 0; i < veriAdedi; i++) {
        
        fiyatSim += (Math.random() - 0.5) * (fiyat * 0.005);
        
        // YUMUŞATMA
        if (i >= veriAdedi * 0.8) {
            const yakinlasmaFaktoru = (i - veriAdedi * 0.8) / (veriAdedi * 0.2);
            fiyatSim = fiyatSim * (1 - yakinlasmaFaktoru) + fiyat * yakinlasmaFaktoru;
        }

        veriler.push(parseFloat(fiyatSim.toFixed(4)));

        // Etiket hesaplama 
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

// Tekil Grafiği Çizen Fonksiyon (Aynı Kaldı)
function cizTekilGrafik(kartVerisi, zamanDilimi) {
    
    const veriAdedi = 100;
    const veri = gecmisVeriSimulasyonu(kartVerisi.fiyat, veriAdedi, zamanDilimi);
    
    if (mevcutGrafik) {
        mevcutGrafik.destroy();
    }
    
    const isLight = document.body.classList.contains('light');
    // CSS değişkenlerini direkt kullan
    const fontColor = getComputedStyle(document.body).getPropertyValue('--text-color');
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const cizgiRengi = isLight ? '#007bff' : '#00bcd4'; 

    grafikBaslik.textContent = `${kartVerisi.isim} Fiyat Grafiği (${zamanDilimi} Bazlı)`;
    
    const ctx = document.getElementById('fiyatGrafik').getContext('2d');
    
    const datasets = [
        {
            label: `${kartVerisi.isim} (₺)`,
            data: veri.veriler,
            borderColor: cizgiRengi, 
            backgroundColor: `${cizgiRengi}20`,
            tension: 0.2, 
            pointRadius: 0
        }
    ];

    const scales = {
        x: {
            title: { display: true, text: zamanDilimi, color: fontColor },
            ticks: { color: fontColor },
            grid: { color: gridColor }
        },
        y: { 
            type: 'linear',
            position: 'left',
            beginAtZero: false,
            title: { display: true, text: `Fiyat (₺)`, color: fontColor },
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


// Kartlara tıklama olayını ekleyen fonksiyon
function kartTiklamaDinleyicileriEkle() {
    
    const guncelKartlar = document.querySelectorAll('.kur-kart');
    guncelKartlar.forEach(kart => {
        const yeniKart = kart.cloneNode(true);
        kart.parentNode.replaceChild(yeniKart, kart);
    });

    const sonKartlar = document.querySelectorAll('.kur-kart');
    sonKartlar.forEach(kart => {
        kart.addEventListener('click', () => {
            
            // Tüm kartlardan 'secili' sınıfını kaldır
            document.querySelectorAll('.kur-kart').forEach(k => k.classList.remove('secili'));
            // Tıklanan karta 'secili' sınıfını ekle (Görseldeki turkuaz vurgu)
            kart.classList.add('secili');

            if (mevcutGrafik) {
                mevcutGrafik.destroy();
            }
            
            const fiyat = parseFloat(kart.getAttribute('data-fiyat'));
            const isim = kart.getAttribute('data-isim');
            const sembol = kart.getAttribute('data-sembol');
            
            const kartVerisi = { fiyat, isim, sembol };
            
            const isHizliVarlik = (s) => s === 'BTC' || s === 'XAU' || s === 'ÇYRK';
            let zaman = isHizliVarlik(sembol) ? 'Saat' : 'Gün';
            
            cizTekilGrafik(kartVerisi, zaman);
        });
    });
}

// --- TEMA DEĞİŞTİRME MANTIĞI (Aynı Kaldı) ---

document.getElementById('temaDegistirBtn').addEventListener('click', () => {
    const body = document.body;
    const btn = document.getElementById('temaDegistirBtn');
    
    if (body.classList.contains('light')) {
        body.classList.remove('light');
        localStorage.setItem('tema', 'dark');
        btn.textContent = '🌙'; 
    } else {
        body.classList.add('light');
        localStorage.setItem('tema', 'light');
        btn.textContent = '🌞'; 
    }
    
    // Grafik açıksa renkleri güncelle
    if (mevcutGrafik) {
        const isLight = document.body.classList.contains('light');
        // Güncel CSS değişkenlerini al
        const fontColor = getComputedStyle(document.body).getPropertyValue('--text-color');
        const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        const cizgiRengi = isLight ? '#007bff' : '#00bcd4'; 
        
        mevcutGrafik.options.scales.y.ticks.color = fontColor;
        mevcutGrafik.options.scales.y.grid.color = gridColor;
        mevcutGrafik.options.scales.y.title.color = fontColor;

        mevcutGrafik.options.scales.x.ticks.color = fontColor;
        mevcutGrafik.options.scales.x.grid.color = gridColor;
        mevcutGrafik.options.scales.x.title.color = fontColor;
        mevcutGrafik.options.plugins.legend.labels.color = fontColor;
        
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
        document.getElementById('temaDegistirBtn').textContent = '🌞';
    } else {
        document.getElementById('temaDegistirBtn').textContent = '🌙';
    }
})();
