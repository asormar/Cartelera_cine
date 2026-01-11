const puppeteer= require("puppeteer");

async function ScrapeData(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Usamos 'networkidle2' (espera a que no haya más de 2 conexiones activas)
    // Y aumentamos el timeout a 60 segundos por si la web es lenta
    await page.goto(url, {timeout: 60000, waitUntil: 'networkidle2'});
    await page.screenshot({path : "cartelera.png"});

    await browser.close();
}

ScrapeData("https://park.cinesabc.com/");
 