const resimInput = document.getElementById('soru-resmi-input');
const resimSecBtn = document.getElementById('resim-sec-btn');
const yuklenenResimGosterim = document.getElementById('yuklenen-resim-gosterim');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

let yukluResim = false; 

// --- 1. GÖRSEL YÜKLEME İŞLEMLERİ ---

resimSecBtn.addEventListener('click', () => {
    resimInput.click(); // Gerçek dosya inputunu tetikle
});

resimInput.addEventListener('change', (event) => {
    const dosya = event.target.files[0];
    if (dosya) {
        yukluResim = true;
        
        // Görsel onay ekranını göster
        resimSecBtn.style.display = 'none';
        yuklenenResimGosterim.style.display = 'flex';
        cozBtn.disabled = false; // Çözüm düğmesini etkinleştir

        // Başlangıç mesajını hazırla
        cozumIcerigi.innerHTML = `<p class="baslangic-mesaj">Fotoğraf başarıyla yüklendi. Çözümü Başlat'a tıklayabilirsin!</p>`;

    } else {
        yukluResim = false;
        cozBtn.disabled = true;
    }
});

// --- 2. ÇÖZÜMLEME SİMÜLASYONU VE VERİLER (Yapay Zeka Analizi) ---

// Görseldeki matematiksel içeriğe göre simüle edilecek çözümler
const matematikCozumler = {
    "temel": {
        cozum_basligi: "Basit Aritmetik Çözüm (Görsel Analiz)",
        adımlar: [
            "**Adım 1: Görselden İşlem Tespiti**",
            "Yapay Zeka, görseldeki işlemi $2+2=?$ olarak okudu.",
            "**Adım 2: Çözüm**",
            "Temel toplama kuralı uygulanır.",
            "**Sonuç:** $\\text{Cevap } 4 \\text{'tür}.$ Fotoğraf çözüldü!"
        ]
    },
    "ikinci_derece": {
        cozum_basligi: "İkinci Dereceden Denklemler Çözümü (Görsel Analiz)",
        adımlar: [
            "**Adım 1: Görsel Analiz ve Tanımlama**",
            "Görseldeki denklemin (örn: $x^2 - 5x + 6 = 0$) çözümünün istendiği tespit edildi.",
            "**Adım 2: Diskriminant Kullanımı**",
            "Diskriminant $\\Delta = b^2 - 4ac$ hesaplandı. (Varsayım: $\\Delta > 0$)",
            "**Adım 3: Kökleri Bulma**",
            "Kökler $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ formülüyle bulundu. $\\text{Örn: } x_1=2, x_2=3$",
            "**Sonuç:** $\\text{Denklemin kökleri başarıyla bulundu. }$ Zor soruları bile çözüyorsun!"
        ]
    },
    "integral": {
        cozum_basligi: "Belirsiz İntegral Çözümü (Görsel Analiz)",
        adımlar: [
            "**Adım 1: Görselden İşlemi Çıkarma**",
            "Yapay Zeka, ifadenin $\\int x^n dx$ şeklinde bir integral olduğunu belirledi.",
            "**Adım 2: İntegral Kuralı Uygulama**",
            "Temel integral formülü $\\frac{x^{n+1}}{n+1} + C$ kuralı uygulandı. (n=2 varsayımı)",
            "**Adım 3: Nihai Çözüm**",
            "Final çözümü: $\\frac{x^3}{3} + C$.",
            "**Sonuç:** $\\text{Çözüm } \\frac{x^3}{3} + C \\text{ olarak belirlenmiştir. }$ Matematiğin bu kısmı artık senin için çok kolay!"
        ]
    }
};

const motivasyonlar = [
    "Harika bir fotoğraf! Sorun netti, çözüm anında geldi. 📸",
    "Görsel analiz başarılı! Bir sonraki soruyu yüklemeye ne dersin? 💪",
    "Yapay zekanın bile zorlandığı bir soru olmalıydı ama çözüldü! 🚀",
    "Çözüldü! Beynine biraz dinlenme molası ver. ✨"
];


// Ana Çözümleme Fonksiyonu
cozBtn.addEventListener('click', () => {
    
    if (!yukluResim) {
        alert("Lütfen önce sorunun fotoğrafını yükleyin.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yapay Zeka Analiz Ediyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Yapay zeka görseli okuyor, formülleri çözümlüyor...</p>';
    motivasyonAlani.style.display = 'none';

    // 3 saniyelik Simülasyon bekleme süresi (Görsel işleme izlenimi)
    setTimeout(() => {
        
        // Simülasyon: Rastgele bir matematik konusunu çözülmüş gibi göster.
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
        cozBtn.innerHTML = 'Çözümü Başlat <i class="fas fa-brain"></i>';
        
        resimInput.value = ''; // Inputu temizle
        yukluResim = false;
        resimSecBtn.style.display = 'flex';
        yuklenenResimGosterim.style.display = 'none';

    }, 3000); // 3 Saniye bekletme
});
