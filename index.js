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

        const Sinopsis= await page.evaluate(() => {
            const sinopsisElements= document.querySelector(".ficha-sinopsis").innerText.trim();
            return sinopsisElements;
        });

        const Days= await page.evaluate(() => {
            const daysElements= document.querySelectorAll(".fch-format"); //Here we are taking all the hours queries without html
            const daysText= Array.from(daysElements).map(element => element.innerText.trim());
            return daysText;
        });

        const Hours= await page.evaluate(() => {
            const hoursElements= document.querySelectorAll(".hora-ses");
            const hoursText= Array.from(hoursElements).map(element => element.innerText.trim());
            return hoursText;
        });

        const insideFilms = {
            title: film.title,
            sinopsis: Sinopsis,
            days: Days,
            hours: Hours
        };

        console.log(insideFilms);
        //await page.screenshot({path:"captura.png"})
    }

    

    browser.close();

    //console.log(allFilms);
}

ScrapeData("https://park.cinesabc.com/");
 