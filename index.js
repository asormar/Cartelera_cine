const puppeteer= require("puppeteer");

async function ScrapeData(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Usamos 'networkidle2' (espera a que no haya más de 2 conexiones activas)
    // Y aumentamos el timeout a 60 segundos por si la web es lenta
    await page.goto(url, {timeout: 60000, waitUntil: 'networkidle2'});

    const titles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".cartelera-titulo b")).map(x => x.textContent)
    })

    const hours = await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".hora-ses")).map(x => x.textContent)
    })

    console.log(hours);

    await browser.close();
}

ScrapeData("https://park.cinesabc.com/");
 