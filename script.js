const resimInput = document.getElementById('soru-resmi-input');
const resimSecBtn = document.getElementById('resim-sec-btn');
const yuklenenResimGosterim = document.getElementById('yuklenen-resim-gosterim');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

let yukluResim = false; 

// --- GÖRSEL YÜKLEME MANTIĞI ---

resimSecBtn.addEventListener('click', () => {
    resimInput.click();
});

resimInput.addEventListener('change', (event) => {
    const dosya = event.target.files[0];
    if (dosya) {
        yukluResim = true;
        resimSecBtn.style.display = 'none';
        yuklenenResimGosterim.style.display = 'flex';
        cozBtn.disabled = false;
        cozumIcerigi.innerHTML = `<p class="baslangic-mesaj">Fotoğraf başarıyla yüklendi. Çözümü Başlat'a tıklayabilirsin!</p>`;
    } else {
        yukluResim = false;
        cozBtn.disabled = true;
    }
});

// --- TÜM MATEMATİK KONULARINI KAPSAYAN YZ SİMÜLASYON VERİLERİ ---

const matematikCozumler = {
    "temel": {
        cozum_basligi: "Basit Aritmetik Çözüm (Hızlı Analiz)",
        adımlar: [
            "**Adım 1: OCR Tarama ve İşlem Tespiti**",
            "Yapay Zeka, görseldeki işlemi $2+2=?$ olarak okudu.",
            "**Adım 2: Çözüm**",
            "Temel toplama kuralı uygulanır.",
            "**Sonuç:** $\\text{Cevap } 4 \\text{'tür}.$ Zorluk Seviyesi: 1/10."
        ]
    },
    "ikinci_derece": {
        cozum_basligi: "Polinom Denklemler Çözümü (Lise Seviyesi)",
        adımlar: [
            "**Adım 1: Denklemin Standardizasyonu**",
            "Görseldeki denklem $x^2 - 5x + 6 = 0$ olarak analiz edildi.",
            "**Adım 2: Çarpanlara Ayırma/Diskriminant**",
            "Çarpanlara ayırma yöntemi $(x-3)(x-2)=0$ uygulandı.",
            "**Adım 3: Kökler**",
            "Kökler $x_1=3$ ve $x_2=2$ olarak bulundu.",
            "**Sonuç:** $\\text{Denklemin kökleri başarıyla bulundu. }$ Zorluk Seviyesi: 3/10."
        ]
    },
    "integral": {
        cozum_basligi: "Belirsiz İntegral Çözümü (Üniversite 1. Yıl)",
        adımlar: [
            "**Adım 1: Görselden Fonksiyonu Çıkarma**",
            "Görseldeki ifade $\\int (x^2 + e^x) dx$ şeklinde bir fonksiyon olarak belirlendi.",
            "**Adım 2: İntegral Kuralı Uygulama**",
            "Toplama kuralı ve $\\int e^x dx = e^x$ formülü uygulandı.",
            "**Adım 3: Nihai Çözüm ve Sadeleştirme**",
            "Final çözümü: $\\frac{x^{3}}{3} + e^x + C$.",
            "**Sonuç:** $\\text{Çözüm } \\frac{x^3}{3} + e^x + C \\text{ olarak belirlenmiştir. }$ Zorluk Seviyesi: 6/10."
        ]
    },
    "türev": {
        cozum_basligi: "Türev Hesabı (Zincir Kuralı Analizi)",
        adımlar: [
            "**Adım 1: Fonksiyon Tespiti**",
            "Yapay zeka, fonksiyonu $f(x) = \\sin(x^2)$ olarak okudu.",
            "**Adım 2: Zincir Kuralı Uygulama**",
            "Dış fonksiyonun türevi ($\\cos(x^2)$) çarpı iç fonksiyonun türevi ($2x$).",
            "**Adım 3: Nihai Türev**",
            "Sonuç: $f'(x) = 2x \\cos(x^2)$.",
            "**Sonuç:** $\\text{Türev doğru bir şekilde hesaplandı. }$ Zorluk Seviyesi: 7/10."
        ]
    },
    "limit": {
        cozum_basligi: "Limit Hesaplama (L'Hopital Kuralı)",
        adımlar: [
            "**Adım 1: Limit İfadesinin Tespiti**",
            "Görseldeki limit $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$ olarak analiz edildi. ($\\frac{0}{0}$ belirsizliği)",
            "**Adım 2: L'Hopital Kuralı Uygulama**",
            "Payın türevi ($\\cos(x)$) ve paydanın türevi (1) alındı.",
            "**Adım 3: Limit Değeri**",
            "Yeni limit $\\lim_{x \\to 0} \\cos(x) / 1$. $x=0$ yerine konulduğunda cevap **1**.",
            "**Sonuç:** $\\text{Limit değeri doğru bir şekilde } 1 \\text{ olarak bulundu. }$ Zorluk Seviyesi: 8/10."
        ]
    },
    "matris": {
        cozum_basligi: "Matris Determinantı (İleri Cebir)",
        adımlar: [
            "**Adım 1: Matris Tespiti**",
            "Yapay Zeka, $3 \\times 3$ tipinde bir matrisin determinantının istendiğini belirledi.",
            "**Adım 2: Sarrus Kuralı Uygulama**",
            "Sarrus kuralı ile çapraz çarpımlar hesaplandı.",
            "**Adım 3: Determinant Hesaplaması**",
            "Tüm terimlerin toplam ve farkı hesaplandı: $\\text{det}(A) = a(ei - fh) - b(di - fg) + c(dh - eg)$.",
            "**Sonuç:** $\\text{Determinantın sonucu: } 15 \\text{ olarak belirlendi (Örnek Değer). }$ Zorluk Seviyesi: 10/10."
        ]
    }
};

const motivasyonlar = [
    "✅ Yüksek hassasiyetli analiz tamamlandı! Tüm matematik soruları çözülmeye hazır. 💯",
    "Görseldeki üniversite seviyesi problemi bile çözdün. Zekan sınır tanımıyor! 🚀",
    "Yapay Zeka bu kadar detaylı bir çözümü 4 saniyede üretti. İnanılmaz! 🤯",
    "Çözüldü! Yeni bir soru yüklemeden önce bu karmaşık çözümü incele. ✨"
];


// --- ANA ÇÖZÜMLEME FONKSİYONU ---
cozBtn.addEventListener('click', () => {
    
    if (!yukluResim) {
        alert("Lütfen önce sorunun fotoğrafını yükleyin.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yapay Zeka Derin Öğrenme Modeli (OmniMath) Çalışıyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Yapay Zeka görseli tarıyor, formülleri ve çözüm adımlarını oluşturuyor...</p>';
    motivasyonAlani.style.display = 'none';

    // 5 saniyelik Simülasyon bekleme süresi (En karmaşık analiz izlenimi)
    setTimeout(() => {
        
        // Simülasyon: Tüm matematik konularını kapsayacak şekilde rastgele birini seçiyoruz.
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
        cozBtn.innerHTML = 'Çözümü Başlat <i class="fas fa-magic"></i>';
        
        resimInput.value = ''; // Inputu temizle
        yukluResim = false;
        resimSecBtn.style.display = 'flex';
        yuklenenResimGosterim.style.display = 'none';

    }, 5000); // 5 Saniye bekletme
});
