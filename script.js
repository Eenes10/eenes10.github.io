const soruMetni = document.getElementById('soru-metni');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

// Matematik Konularına Göre Simülasyon Çözüm Kütüphanesi (LaTeX Destekli)
const matematikCozumler = {
    "temel": {
        soru_parcasi: ["2+2", "4*5", "kaç eder"],
        cozum_basligi: "Temel Aritmetik Çözüm",
        adımlar: [
            "**Adım 1: İşlemi Tanımlama**",
            "Soruda temel toplama işlemi ($2+2$) istenmiştir.",
            "**Adım 2: Çözüm**",
            "Sayma işlemi ile $2 + 2$ sonucu kolayca **4** bulunur.",
            "**Sonuç:** $\\text{Cevap } 4 \\text{'tür}.$ İşte bu kadar basit!"
        ]
    },
    "ikinci_derece": {
        soru_parcasi: ["x^2", "denkleminin kökleri", "parabol"],
        cozum_basligi: "İkinci Dereceden Denklemler Çözümü",
        adımlar: [
            "**Adım 1: Katsayıları Belirle**",
            "Denklem $ax^2 + bx + c = 0$ formatındadır. Diskriminant ($\Delta$) hesaplanmalıdır.",
            "**Adım 2: Diskriminant Hesaplama**",
            "Formül: $\\Delta = b^2 - 4ac$. $\\Delta$'nın işareti köklerin türünü belirler.",
            "**Adım 3: Kök Formülü**",
            "Kökler $x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$ formülüyle bulunur. Örneğin $x_1=2$ ve $x_2=3$ olabilir.",
            "**Sonuç:** $\\text{Denklemin kökleri } x_1, x_2 \\text{ olarak bulundu. }$ Matematik bilgine hayran kaldık!"
        ]
    },
    "integral": {
        soru_parcasi: ["integral", "dx", "türevi"],
        cozum_basligi: "Belirsiz İntegral Çözümü",
        adımlar: [
            "**Adım 1: İntegral Kuralı**",
            "$\int x^n dx$ formülü: $\\frac{x^{n+1}}{n+1} + C$ kuralı uygulanır.",
            "**Adım 2: Uygulama**",
            "Örneğin $\int x^2 dx$ sorusu için $n=2$ alınır. Sonuç: $\\frac{x^{2+1}}{2+1} + C$",
            "**Adım 3: Nihai Çözüm**",
            "Final çözümü: $\\frac{x^3}{3} + C$. (C: İntegral sabiti)",
            "**Sonuç:** $\\text{Cevap } \\frac{x^3}{3} + C \\text{ olarak belirlenmiştir. }$ Hesaplamaların mükemmel!"
        ]
    }
};

// Eğlenceli Motivasyon Mesajları
const motivasyonlar = [
    "İnanılmazsın! Einstein'ın bile zorlandığı bir konuydu bu. 😉",
    "Bu soruyu çözdün, sırada Nobel ödülünü almak var! 🏆",
    "Beynin bugün bir hesap makinesinden daha hızlı çalışıyor! 🚀",
    "Mola ver, çikolata ye. Beynin yakıt ikmaline ihtiyacı var. 🍫",
    "Unutma: Başarı, doğru formülü doğru zamanda uygulamaktır. Tekrarla! ✨"
];

// Ana Çözümleme Fonksiyonu
cozBtn.addEventListener('click', () => {
    const soru = soruMetni.value.trim().toLowerCase();
    
    if (soru.length < 3) {
        alert("Lütfen geçerli bir matematik sorusu yazın.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Çözümleniyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Sistem çözümü yapılandırıyor, MathJax yükleniyor...</p>';
    motivasyonAlani.style.display = 'none';

    // 2 saniyelik Simülasyon bekleme süresi
    setTimeout(() => {
        let eslesenCozum = null;

        // Soru metni ile simülasyon çözümlerini eşleştirme
        for (const key in matematikCozumler) {
            const cozum = matematikCozumler[key];
            if (cozum.soru_parcasi.some(parca => soru.includes(parca) || soru.includes(parca.replace(/[^a-z0-9]/g, "")))) {
                eslesenCozum = cozum;
                break;
            }
        }

        // Eğer eşleşme bulunamazsa ve kullanıcı basit bir soru sorduysa, temel çözümü kullan.
        if (!eslesenCozum) {
             if (soru.includes("?") && soru.length < 15) {
                 eslesenCozum = matematikCozumler.temel;
             }
        }
        
        // --- Çözüm Sonuçlarını Ekrana Basma ---
        
        if (eslesenCozum) {
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
            
        } else {
            cozumIcerigi.innerHTML = `
                <p class="baslangic-mesaj" style="color: #cf6766;">
                    Üzgünüm, bu sorunun çözümünü algılayamadım. 😔
                    Lütfen soruyu daha net yazın veya ${MathJax.typesetPromise.name ? "LaTeX formatını" : "formül girişini"} kullanmayı deneyin.
                </p>
            `;
            motivasyonAlani.style.display = 'none';
        }

        // Butonu sıfırla
        cozBtn.disabled = false;
        cozBtn.innerHTML = 'Soruyu Çöz <i class="fas fa-brain"></i>';
        
    }, 1500); // 1.5 Saniye bekletme
});
