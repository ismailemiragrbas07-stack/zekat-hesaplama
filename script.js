let prices = { gram: 0, ceyrek: 0, yarim: 0, ata: 0, gumus: 0, usd: 0, eur: 0 };
let nisabLimit = 0;
const API_KEY = "3fIcK1pSd7vr72TgQGLAap:1qp0cEzfxAdZkq3HJ59JxA"; 

async function fetchPrices() {
    try {
        // Altın ve Döviz verilerini paralel çekelim
        const [goldRes, currRes] = await Promise.all([
            fetch("https://api.collectapi.com/economy/goldPrice", { headers: { "authorization": `apikey ${API_KEY}` } }),
            fetch("https://api.collectapi.com/economy/allCurrency", { headers: { "authorization": `apikey ${API_KEY}` } })
        ]);

        const goldData = await goldRes.json();
        const currData = await currRes.json();

        if (goldData.success && currData.success) {
            // Altın Fiyatları
            prices.gram = goldData.result.find(i => i.name === "Gram Altın").buying;
            prices.ceyrek = goldData.result.find(i => i.name === "Çeyrek Altın").buying;
            prices.yarim = goldData.result.find(i => i.name === "Yarım Altın").buying;
            prices.ata = goldData.result.find(i => i.name === "Ata Altın").buying;
            const silverObj = goldData.result.find(i => i.name.includes("Gümüş"));
            prices.gumus = silverObj ? silverObj.buying : 0;

            // Döviz Fiyatları
            prices.usd = currData.result.find(i => i.code === "USD").buying;
            prices.eur = currData.result.find(i => i.code === "EUR").buying;

            nisabLimit = prices.gram * 80.18;

            document.getElementById('gold-price-text').innerText = `Gram Altın: ${prices.gram.toFixed(2)} TL | USD: ${prices.usd.toFixed(2)} TL`;
            document.getElementById('nisab-text').innerText = `Nisab Sınırı: ${nisabLimit.toLocaleString('tr-TR')} TL`;
        }
    } catch (error) {
        console.error("API Veri Hatası:", error);
        document.getElementById('gold-price-text').innerText = "Kurlar çekilemedi, lütfen tekrar deneyin.";
    }
}

function calculateZakat() {
    const vals = {
        cash: parseFloat(document.getElementById('cash').value) || 0,
        usd: parseFloat(document.getElementById('usd').value) || 0,
        eur: parseFloat(document.getElementById('eur').value) || 0,
        gram: parseFloat(document.getElementById('goldGram').value) || 0,
        ceyrek: parseFloat(document.getElementById('ceyrek').value) || 0,
        yarim: parseFloat(document.getElementById('yarim').value) || 0,
        ata: parseFloat(document.getElementById('ata').value) || 0,
        silver: parseFloat(document.getElementById('silver').value) || 0,
        debts: parseFloat(document.getElementById('debts').value) || 0
    };

    const totalWealth = (
        vals.cash + 
        (vals.usd * prices.usd) + 
        (vals.eur * prices.eur) + 
        (vals.gram * prices.gram) + 
        (vals.ceyrek * prices.ceyrek) + 
        (vals.yarim * prices.yarim) + 
        (vals.ata * prices.ata) + 
        (vals.silver * prices.gumus)
    ) - vals.debts;

    const resultBox = document.getElementById('result-box');
    resultBox.style.display = 'block';

    if (totalWealth >= nisabLimit) {
        const zakat = totalWealth * 0.025;
        document.getElementById('zakatAmount').innerText = zakat.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
        document.getElementById('status-message').innerHTML = "<strong>Zekat borcunuz bulunmaktadır.</strong><br>Allah kabul etsin.";
    } else {
        document.getElementById('zakatAmount').innerText = "0.00";
        document.getElementById('status-message').innerText = "Varlığınız nisab miktarının altında kalmaktadır.";
    }
}

window.onload = fetchPrices;