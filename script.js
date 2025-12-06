const soruMetni = document.getElementById('soru-metni');
const cozBtn = document.getElementById('coz-btn');
const cozumIcerigi = document.getElementById('cozum-icerigi');
const motivasyonAlani = document.getElementById('motivasyon-alani');

// Simülasyon Çözüm Kütüphanesi
const ornekCozumler = {
    "matematik": {
        soru_parcasi: ["x² - 5x + 6", "denkleminin kökleri", "ikinci derece"],
        cozum_basligi: "İkinci Dereceden Denklemler Çözümü 📐",
        adımlar: [
            "**Adım 1: Denklemin Katsayılarını Belirle**",
            "Denklem: $x^2 - 5x + 6 = 0$. Burada $a=1$, $b=-5$, $c=6$ olarak belirlenir. (Gizli formül: $\\Delta = b^2 - 4ac$)",
            "**Adım 2: Çarpanlara Ayırma Yöntemi**",
            "Çarpımları 6, toplamları -5 olan iki sayı bulmalıyız. Bu sayılar -2 ve -3'tür.",
            "**Adım 3: Çözümü Yaz**",
            "Denklem $(x-2)(x-3) = 0$ şeklinde çarpanlara ayrılır. Buradan kökler $x_1 = 2$ ve $x_2 = 3$ bulunur.",
            "**Tebrikler!** Bu denklemin kökleri $x_1=2$ ve $x_2=3$'tür. Çok başarılısın!"
        ]
    },
    "edebiyat": {
        soru_parcasi: ["servet-i fünun", "edebiyat", "şair"],
        cozum_basligi: "Servet-i Fünun Dönemi Özeti 📜",
        adımlar: [
            "**Adım 1: Tanım ve Başlangıç**",
            "Servet-i Fünun (Edebiyat-ı Cedide) dergi etrafında toplanan bir topluluktur ve Batı edebiyatını esas alır.",
            "**Adım 2: Önemli Temsilciler**",
            "Tevfik Fikret (şiirde usta), Cenap Şahabettin (sembolizm etkisinde), Halit Ziya Uşaklıgil (modern romanın kurucusu) en önemli şair ve yazarlarıdır.",
            "**Adım 3: Temel Özellikler**",
            "Sanat için sanat anlayışı, ağır ve süslü dil, bireysel konular (aşk, doğa, karamsarlık) işlenmiştir.",
            "**Unutma!** Bu dönem 'sanat için sanat' ilkesini benimsemiştir. Edebiyat bilgin çok yerinde!"
        ]
    },
    "fen": {
        soru_parcasi: ["fizik", "hız", "ivme", "hareket"],
        cozum_basligi: "Hareket Problemi Çözümü 🚀",
        adımlar: [
            "**Adım 1: Verileri Not Al**",
            "Sorudaki başlangıç hızı ($v_0$), ivme ($a$) ve geçen zaman ($t$) değerlerini bir yere yaz.",
            "**Adım 2: Formülü Seç**",
            "Son hızı ($v$) bulmak için $v = v_0 + a \\cdot t$ formülünü kullanmalısın.",
            "**Adım 3: Hesaplama ve Sonuç**",
            "Değerleri formülde yerine koyarak sonucu bul. (Unutma, her zaman birimi kontrol et!)",
            "**Aferin!** Fizik zor görünebilir ama formülleri doğru uyguladığında her şey çözülür."
        ]
    }
};

// Eğlenceli Motivasyon Mesajları
const motivasyonlar = [
    "İnanılmazsın! Baykuş bile bu kadar hızlı çözemezdi. 🦉",
    "Mola verme zamanı gelmiş olabilir. Beynine biraz pasta ikram et. 🍰",
    "Günde 1 soru çözmek, bir sonraki seviyeye geçmek demektir! Devam et! ⭐",
    "Senin beynin, Bilge Baykuş'un tüm kütüphanesinden daha değerli! 💪",
    "Bu soruyu çözdün, sırada Everest'e tırmanmak var! (Ya da bir sonraki ünite.) ⛰️"
];

// Ana Çözümleme Fonksiyonu
cozBtn.addEventListener('click', () => {
    const soru = soruMetni.value.trim().toLowerCase();
    
    if (soru.length < 10) {
        alert("Lütfen çözmek istediğin sorunun tamamını yaz.");
        return;
    }

    cozBtn.disabled = true;
    cozBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Çözümleniyor...';
    cozumIcerigi.innerHTML = '<p class="baslangic-mesaj">Baykuş tüm bilgeliğini topluyor, biraz bekle...</p>';
    motivasyonAlani.style.display = 'none';

    // 2 saniyelik Simülasyon bekleme süresi
    setTimeout(() => {
        let eslesenCozum = null;
        let konu = "";

        // Soru metni ile simülasyon çözümlerini eşleştirme
        for (const key in ornekCozumler) {
            const cozum = ornekCozumler[key];
            if (cozum.soru_parcasi.some(parca => soru.includes(parca))) {
                eslesenCozum = cozum;
                konu = key.toUpperCase();
                break;
            }
        }

        // --- Çözüm Sonuçlarını Ekrana Basma ---
        
        if (eslesenCozum) {
            let htmlCozum = `<h3>${eslesenCozum.cozum_basligi}</h3>`;
            eslesenCozum.adımlar.forEach(adim => {
                htmlCozum += `<div class="cozum-adimi">${adim}</div>`;
            });
            
            cozumIcerigi.innerHTML = htmlCozum;
            
            // Eğlenceli Motivasyon Mesajını Göster
            const rastgeleMotivasyon = motivasyonlar[Math.floor(Math.random() * motivasyonlar.length)];
            motivasyonAlani.textContent = rastgeleMotivasyon;
            motivasyonAlani.style.display = 'block';
            
        } else {
            cozumIcerigi.innerHTML = `
                <p class="baslangic-mesaj" style="color: red;">
                    Üzgünüm, Bilge Baykuş bu soruyu henüz kütüphanesine eklememiş. 😅
                    Lütfen daha spesifik bir matematik, fizik veya edebiyat sorusu dene.
                </p>
            `;
            motivasyonAlani.style.display = 'none';
        }

        // Butonu sıfırla
        cozBtn.disabled = false;
        cozBtn.innerHTML = 'Çözümü Getir <i class="fas fa-brain"></i>';
        
    }, 2000); // 2 Saniye bekletme
});

// Başlangıçta matematik denklemleri için LaTeX (simülasyon) gösterme
cozumIcerigi.innerHTML = `<p class="baslangic-mesaj">Denklem yazarken, örneğin $x^2 + 2x + 1 = 0$ formatını kullanabilirsin!</p>`;
