const resimInput = document.getElementById('soru-resmi-input');
const resimSecBtn = document.getElementById('resim-sec-btn');
const yuklenenResimGosterim = document.getElementById('yuklenen-resim-gosterim');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

let yukluResim = false; 

// --- 1. GÖRSEL YÜKLEME İŞLEMLERİ ---

resimSecBtn.addEventListener('click', () => {
    resimInput.click();
});

resimInput.addEventListener('change', (event) => {
    const dosya = event.target.files[0];
    if (dosya) {
        yukluResim = true;
        
        // Görsel onay ekranını göster
        resimSecBtn.style.display = 'none';
        yuklenenResimGosterim.style.display = 'flex';
        cozBtn.disabled = false;

        cozumIcerigi.innerHTML = `<p class="baslangic-mesaj">Fotoğraf başarıyla yüklendi. Çözümü Başlat'a tıklayabilirsin!</p>`;

    } else {
        yukluResim = false;
        cozBtn.disabled = true;
    }
});

// --- 2. GELİŞTİRİLMİŞ YAPAY ZEKA SİMÜLASYON VERİLERİ (Daha Fazla Konu!) ---

const matematikCozumler = {
    "temel": {
        cozum_basligi: "Basit Aritmetik Çözüm (Hızlı Analiz)",
        adımlar: [
            "**Adım 1: Görselden İşlem Tespiti**",
            "Yapay Zeka, görseldeki işlemi $2+2=?$ olarak okudu.",
            "**Adım 2: Çözüm**",
            "Temel toplama kuralı uygulanır.",
            "**Sonuç:** $\\text{Cevap } 4 \\text{'tür}.$ Fotoğraf çözüldü! Zorluk Seviyesi: 1/5."
        ]
    },
    "ikinci_derece": {
        cozum_basligi: "İkinci Dereceden Denklemler Çözümü (Gelişmiş Analiz)",
        adımlar: [
            "**Adım 1: Görsel Analiz ve Katsayılar**",
            "Görseldeki denklem $ax^2 + bx + c = 0$ formatında tanımlandı. (Örn: $x^2 - 5x + 6 = 0$).",
            "**Adım 2: Diskriminant ve Kök Tespiti**",
            "Diskriminant $\\Delta = b^2 - 4ac$ hesaplandı. ($\\Delta=1$ varsayılmıştır).",
            "**Adım 3: Kökleri Bulma ve Doğrulama**",
            "Kök formülü $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ uygulandı.",
            "$\\text{Bulunan Kökler: } x_1=3 \\text{ ve } x_2=2$.",
            "**Sonuç:** $\\text{Denklemin kökleri doğru bir şekilde bulundu. }$ Zorluk Seviyesi: 3/5."
        ]
    },
    "integral": {
        cozum_basligi: "Belirsiz İntegral Çözümü (Yüksek Hassasiyet)",
        adımlar: [
            "**Adım 1: Görselden Fonksiyonu Çıkarma**",
            "Yapay Zeka, ifadenin $\\int (x^2 + 2x) dx$ şeklinde bir polinom integral olduğunu belirledi.",
            "**Adım 2: İntegral Kuralı Uygulama**",
            "Toplama kuralı ve temel $\\int x^n dx$ formülü her terime uygulandı.",
            "**Adım 3: Nihai Çözüm ve Sadeleştirme**",
            "Çözüm: $\\frac{x^{3}}{3} + \\frac{2x^2}{2} + C$",
            "**Sonuç:** $\\text{Final çözüm: } \\frac{x^3}{3} + x^2 + C \\text{ olarak belirlenmiştir. }$ Zorluk Seviyesi: 4/5."
        ]
    },
    "trigonometri": {
        cozum_basligi: "Trigonometrik Kimlikler Çözümü (Açı Analizi)",
        adımlar: [
            "**Adım 1: Görseldeki İfade Tespiti**",
            "Sorunun $\\sin(2x) = 1$ gibi bir trigonometrik denklem içerdiği belirlendi.",
            "**Adım 2: Kimlik Dönüşümü**",
            "Gerekli dönüşüm yapıldı: $2x = \\frac{\\pi}{2} + 2k\\pi$.",
            "**Adım 3: x Değerlerinin Bulunması**",
            "Tüm çözüm kümesi hesaplandı: $x = \\frac{\\pi}{4} + k\\pi \\text{ (} k \\in \\mathbb{Z} \\text{)}$",
            "**Sonuç:** $\\text{Trigonometrik çözüm kümesi doğru bulundu. }$ Zorluk Seviyesi: 5/5."
        ]
    }
};

const motivasyonlar = [
    "Harika bir fotoğraf! Sorun netti, çözüm anında geldi. Yapay zeka %100 doğrulukla çözdü. 💯",
    "Görsel analiz başarılı! Bu zorluktaki bir integrali bile çözdün. Bir sonraki seviyeye geçelim mi? 💪",
    "Yapay zekanın en yeni algoritmasıyla çözüldü! Zorluk derecesi 5/5'ti! 🚀",
    "Çözüldü! Beynine biraz dinlenme molası ver, bunu hak ettin. ✨"
];


// Ana Çözümleme Fonksiyonu
cozBtn.addEventListener('click', () => {
    
    if (!yukluResim) {
        alert("Lütfen önce sorunun fotoğrafını yükleyin.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yapay Zeka Derin Öğrenme Modeli Çalışıyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Yapay zeka görseli tarıyor, formülleri ve çözüm adımlarını oluşturuyor...</p>';
    motivasyonAlani.style.display = 'none';

    // 4 saniyelik Simülasyon bekleme süresi (Daha karmaşık analiz izlenimi)
    setTimeout(() => {
        
        // Simülasyon: Rastgele bir matematik konusunu seçerek yapay zekanın "çeşitli" çözümler ürettiği izlenimini veriyoruz.
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

    }, 4000); // 4 Saniye bekletme
});
