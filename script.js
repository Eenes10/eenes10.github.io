const kurAlani = document.getElementById('kur-kartlari');

// --- API ANAHTARLARI VE URL'LER ---
const FIXER_API_KEY = '9086e6e2f4c8476edd902703c0e82a1e'; 
const FIXER_URL = `https://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=TRY,USD,GBP,CHF`; 

// CoinGecko API'si (Altın ve BTC için)
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

    // --- 1. Döviz Verisini Çekme (USD, EUR, GBP, CHF) ---
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
    
    // --- 2. Kripto ve Altın Verisini Çekme (BTC/USD ve XAU/USD) ---
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

// --- GRAFİK MODAL VE ETKİLEŞİM İŞLEMLERİ ---

const modal = document.getElementById('modal');
const kapatDugmesi = document.getElementsByClassName("kapat-dugmesi")[0];
const grafikBaslik = document.getElementById('grafik-baslik');
let mevcutGrafik; 

kapatDugmesi.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


// Geçmiş fiyat verilerini simüle eden fonksiyon (Tarih etiketli ve yumuşak geçişli)
function gecmisVeriSimulasyonu(fiyat, veriAdedi = 100, zamanDilimi = 'Gün') {
    const veriler = [];
    const etiketler = [];
    
    // Başlangıç fiyatını rastgele ayarla
    let fiyatSim = fiyat * (1 - Math.random() * 0.05); 
    
    const simdikiTarih = new Date();

    for (let i = 0; i < veriAdedi; i++) {
        
        // 1. Rastgele Değişim: Fiyata küçük bir rastgele adım uygula
        fiyatSim += (Math.random() - 0.5) * (fiyat * 0.005);
        
        // 2. YUMUŞATMA: Son %20'lik dilimde güncel fiyata yakınsa
        if (i >= veriAdedi * 0.8) {
            const yakinlasmaFaktoru = (i - veriAdedi * 0.8) / (veriAdedi * 0.2);
            fiyatSim = fiyatSim * (1 - yakinlasmaFaktoru) + fiyat * yakinlasmaFaktoru;
        }

        veriler.push(parseFloat(fiyatSim.toFixed(4)));

        // Etiket hesaplama (Gerçekçi Tarih Olarak)
        let tarih = new Date(simdikiTarih);
        
        if (zamanDilimi === 'Gün') {
            // İleriden geriye doğru sayarak doğru tarihi hesapla
            tarih.setDate(simdikiTarih.getDate() - (veriAdedi - 1 - i));
            etiketler.push(`${tarih.getDate()} ${tarih.toLocaleString('tr-TR', { month: 'short' })}`);
        } else if (zamanDilimi === 'Saat') {
            // İleriden geriye doğru sayarak doğru saati hesapla
            tarih.setHours(simdikiTarih.getHours() - (veriAdedi - 1 - i));
            etiketler.push(`${tarih.getHours().toString().padStart(2, '0')}:${tarih.getMinutes().toString().padStart(2, '0')}`);
        }
    }
    
    // Son noktayı kesin olarak güncel fiyata eşitle (Yumuşatma yapıldığı için sıçrama yapmaz)
    veriler[veriAdedi - 1] = parseFloat(fiyat.toFixed(4));
    
    return { etiketler, veriler };
}

// Chart.js ile grafiği çizen fonksiyon
function cizGrafik(isim, fiyat, zamanDilimi) {
    
    // Veri adedi 100 olarak sabitlendi (daha geniş aralık için)
    const veriAdedi = 100;
    const { etiketler, veriler } = gecmisVeriSimulasyonu(fiyat, veriAdedi, zamanDilimi);
    
    if (mevcutGrafik) {
        mevcutGrafik.destroy();
    }

    grafikBaslik.textContent = `${isim} Fiyat Geçmişi (Son ${etiketler.length} ${zamanDilimi})`;
    
    const ctx = document.getElementById('fiyatGrafik').getContext('2d');
    
    mevcutGrafik = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: etiketler,
            datasets: [{
                label: `${isim} Fiyatı (₺)`,
                data: veriler,
                borderColor: '#ffcc00', 
                backgroundColor: 'rgba(255, 204, 0, 0.2)',
                tension: 0.2, 
                pointRadius: 0 
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Fiyat (₺)',
                        color: '#f0f0f0'
                    },
                    ticks: {
                        color: '#f0f0f0'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: zamanDilimi,
                        color: '#f0f0f0'
                    },
                    ticks: {
                        color: '#f0f0f0'
                    },
                     grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#f0f0f0' 
                    }
                }
            }
        }
    });

    modal.style.display = "block";
}

// Kartlara tıklama olayını ekleyen fonksiyon
function kartTiklamaDinleyicileriEkle() {
    
    // Tıklama olaylarını tekrar tekrar eklenmesini önler
    const guncelKartlar = document.querySelectorAll('.kur-kart');
    guncelKartlar.forEach(kart => {
        const yeniKart = kart.cloneNode(true);
        kart.parentNode.replaceChild(yeniKart, kart);
    });

    const sonKartlar = document.querySelectorAll('.kur-kart');
    sonKartlar.forEach(kart => {
        const sembol = kart.querySelector('.sembol').textContent;
        const isim = kart.querySelector('.isim').textContent;
        
        const fiyatMetni = kart.querySelector('.fiyat').textContent
                               .replace('₺ ', '')
                               .replace(/\./g, '') 
                               .replace(',', '.'); 
        const fiyat = parseFloat(fiyatMetni);

        kart.addEventListener('click', () => {
            let zaman = 'Gün';
            if (sembol === 'BTC' || sembol === 'XAU' || sembol === 'ÇYRK') {
                zaman = 'Saat'; 
            }
            cizGrafik(isim, fiyat, zaman);
        });
    });
}
