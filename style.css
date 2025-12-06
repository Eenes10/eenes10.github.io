const resimInput = document.getElementById('soru-resmi-input');
const resimSecBtn = document.getElementById('resim-sec-btn');
const yuklenenResimGosterim = document.getElementById('yuklenen-resim-gosterim');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

let yukluResim = false; // Görselin yüklü olup olmadığını tutar

// --- 1. GÖRSEL YÜKLEME İŞLEMLERİ ---

resimSecBtn.addEventListener('click', () => {
    resimInput.click(); // Gizli input'u tetikle
});

resimInput.addEventListener('change', (event) => {
    const dosya = event.target.files[0];
    if (dosya) {
        yukluResim = true;
        
        // Görsel onay ekranını göster ve düğmeleri ayarla
        resimSecBtn.style.display = 'none';
        yuklenenResimGosterim.style.display = 'flex';
        cozBtn.disabled = false; // Çözüm düğmesini etkinleştir

        // Başlangıç mesajını sıfırla
        cozumIcerigi.innerHTML = `<p class="baslangic-mesaj">Resim analiz için hazır. Çözümü getirebilirsin!</p>`;

    } else {
        yukluResim = false;
        cozBtn.disabled = true;
    }
});

// --- 2. ÇÖZÜMLEME SİMÜLASYONU VE VERİLER (Sadece Görsel Analiz) ---

const matematikCozumler = {
    "temel": {
        cozum_basligi: "Temel Aritmetik Çözüm (Görselden Çözüldü)",
        adımlar: [
            "**Adım 1: Görselden Okuma (OCR Simülasyonu)**",
            "Görseldeki işlem $2+2=?$ olarak tanımlandı.",
            "**Adım 2: Çözümleme**",
            "Toplama işlemi gerçekleştirilir.",
            "**Sonuç:** $\\text{Cevap } 4 \\text{'tür}.$ Fotoğraf çekmek çok kolay!"
        ]
    },
    "ikinci_derece": {
        cozum_basligi: "İkinci Dereceden Denklemler Çözümü (Görsel Analiz)",
        adımlar: [
            "**Adım 1: Görsel Analiz ve Tanımlama**",
            "Görselde bir denklemin (örn: $x^2 - 5x + 6 = 0$) çözümünün istendiği tespit edildi.",
            "**Adım 2: Diskriminant Kullanımı**",
            "Diskriminant $\\Delta = b^2 - 4ac$ hesaplandı. ($\Delta > 0$ olduğu varsayılmıştır)",
            "**Adım 3: Kökleri Bulma**",
            "Kökler $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ formülüyle bulundu. $\\text{Örn: } x_1=2, x_2=3$",
            "**Sonuç:** $\\text{Denklemin kökleri başarıyla bulundu. }$ Matematik bilgine hayran kaldık!"
        ]
    },
    "integral": {
        cozum_basligi: "Belirsiz İntegral Çözümü (Görsel Analiz)",
        adımlar: [
            "**Adım 1: Görselden İşlemi Çıkarma**",
            "Görseldeki ifadenin $\\int x^n dx$ şeklinde bir integral olduğu belirlendi.",
            "**Adım 2: İntegral Kuralı Uygulama**",
            "Temel integral formülü $\\frac{x^{n+1}}{n+1} + C$ kuralı uygulandı. (n=2 varsayımı)",
            "**Adım 3: Nihai Çözüm**",
            "Final çözümü: $\\frac{x^3}{3} + C$. (C: İntegral sabiti)",
            "**Sonuç:** $\\text{Çözüm } \\frac{x^3}{3} + C \\text{ olarak belirlenmiştir. }$ Hesaplamaların mükemmel!"
        ]
    }
};

const motivasyonlar = [
    "Harika bir fotoğraf! Sorun netti, çözüm anında geldi. 📸",
    "Görsel analiz başarılı! Sırada daha zorlu bir integral var mı? 💪",
    "Senin beynin, bu soruyu çözen Baykuş'tan bile hızlı çalışıyor! 🚀",
    "Çözüldü! Bir sonraki soruyu yüklemeye ne dersin? ✨"
];


// Ana Çözümleme Fonksiyonu
cozBtn.addEventListener('click', () => {
    
    if (!yukluResim) {
        alert("Lütfen önce sorunun fotoğrafını yükleyin.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Görsel Analiz Ediliyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Yapay zeka görseli okuyor ve çözümü yapılandırıyor...</p>';
    motivasyonAlani.style.display = 'none';

    // 2.5 saniyelik Simülasyon bekleme süresi (Görsel işleme izlenimi)
    setTimeout(() => {
        
        // Simülasyon: Yüklü resim varsa, rastgele bir konuyu çözülmüş gibi göster.
        const konular = Object.keys(matematikCozumler);
        const rastgeleKonuIndex = Math.floor(Math.random() * konular.length);
        const rastgeleKonu = konular[rastgeleKonuIndex];
        const eslesenCozum = matematikCozumler[rastgeleKonu];

        // --- Çözüm Sonuçlarını Ekrana Basma ---
        
        let htmlCozum = `<h3>${eslesenCozum.cozum_basligi}</h3>`;
        eslesenCozum.adımlar.forEach(adim => {
            htmlCozum += `<div class="cozum-adimi">${adim}</div>`;
        });
        
        cozumIcerigi.innerHTML = htmlCozum;
        
        // MathJax'in yeni formülleri işlemesini sağla
        MathJax.typesetPromise([cozumIcerigi]).then(() => {
            // LaTeX işlendikten sonra motivasyonu göster
            const rastgeleMotivasyon = motivasyonlar[Math.floor(Math.random() * motivasyonlar.length)];
            motivasyonAlani.textContent = rastgeleMotivasyon;
            motivasyonAlani.style.display = 'block';
        });
        
        // Butonu ve resim yükleme alanını sıfırla (Yeni soru için hazırlık)
        cozBtn.disabled = true;
        cozBtn.innerHTML = 'Çözümü Getir <i class="fas fa-brain"></i>';
        
        resimInput.value = ''; // Inputu temizle
        yukluResim = false;
        resimSecBtn.style.display = 'block';
        yuklenenResimGosterim.style.display = 'none';

    }, 2500); // 2.5 Saniye bekletme
});
