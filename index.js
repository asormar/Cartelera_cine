import puppeteer from "puppeteer";

async function ScrapeData(url) {
    const browser= await puppeteer.launch();
    const page= await browser.newPage();
    await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
    }); // This is for pages like Cines ABC that exceds default timeout

    const allFilms= await page.evaluate(() => {
        const billboards= document.querySelectorAll(".cartelera");

        return Array.from(billboards).map((billboard) => {
            const title= billboard.querySelector(".ver-ficha").innerText.trim();
            const date_url_id= billboard.querySelector(".cartelera-imagen a").getAttribute("href");
            return ({title, date_url_id});
        })
    })


    for (let film of allFilms){
        await page.goto(film.date_url_id, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        await page.screenshot({path:"captura.png"})

        break;
    }

    browser.close();

    console.log(allFilms);
}

ScrapeData("https://park.cinesabc.com/");
 