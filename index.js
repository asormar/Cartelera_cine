import puppeteer from "puppeteer";
import { sendNewsletter } from "./newsletter.js";
import cron from "node-cron";

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

    const allFilmsData = [];

    for (let film of allFilms){
        await page.goto(film.date_url_id, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        const Sinopsis= await page.evaluate(() => {
            const sinopsisElements= document.querySelector(".ficha-sinopsis").innerText.trim();
            return sinopsisElements;
        });

        const Poster = await page.evaluate(() => {
            // Buscar la primera imagen que tenga un src que contenga "obj/LCinesD_dat/eventos"
            const posterElement = Array.from(document.querySelectorAll("img"))
                .find(img => img.src.includes("/obj/LCinesD_dat/eventos/"));
            
            return posterElement ? posterElement.src : null;
        });


        const Days= await page.evaluate(() => {
            const allTabs= document.querySelectorAll(".ui-tabs-tab");

            const daysElements= document.querySelectorAll(".fch-format"); //Here we are taking all the hours queries without html
            const daysTemporary= Array.from(daysElements).map(element => element.innerText.trim());

            const daysText= []
            for (let i=0; i<allTabs.length; i++){
                const currentTab = allTabs[i];
                const currentDay = daysTemporary[i];
                
                daysText.push({[currentTab.getAttribute("aria-controls")]: currentDay});
            }

            return daysText;
        });

        const Hours= await page.evaluate((Days) => { //Introduce Days as argument to use it inside the function
            const ids_Found= [];
            const hoursText= [];
            const allPanels= document.querySelectorAll(".ui-tabs-panel");

            for (let i=0; i<Days.length; i++){
                const currentPanel = allPanels[i];

                if (currentPanel){
                    const each_id= currentPanel.getAttribute("id");

                    const hoursElements= document.querySelectorAll("div#" + each_id + ".ui-tabs-panel.ui-corner-bottom.ui-widget-content div.panel-sesiones div.cont-ses div.hora-ses");
                    const hoursTemporary= Array.from(hoursElements).map(element => element.innerText.trim());

                    ids_Found.push(each_id);
                    hoursText.push({[each_id]: hoursTemporary});
                }
            }




            return {hoursText};

        }, Days);

        const insideFilms = {
            title: film.title,
            sinopsis: Sinopsis,
            poster: Poster,
            Days: Days,
            Hours: Hours
        };

        allFilmsData.push(insideFilms);

        //break;
    }

    await browser.close();

    return allFilmsData;
}

//To coordinate the scraper and the email sender
async function main(){
    try{
        console.log("🔍 Iniciando scraping...");

        const filmsData= await ScrapeData("https://park.cinesabc.com/");

        console.log(`Se han encontrado ${filmsData.length} películas.`); //Use ' because " would print literally the text
        console.dir(filmsData, { depth: null, colors: true }); //Like console.log but does not block objects view

        console.log("✉️ Enviando Newsletter...");

        await sendNewsletter(filmsData);
    } catch (error){
        console.error("Error en el proceso:", error);
    }

}

// Schedule newsletter to be sent twice a week
console.log("🚀 Iniciando programador de newsletter...");
console.log("📅 La newsletter se enviará los lunes y jueves a las 9:00 AM");

// Run every Monday and Thursday at 9:00 AM (Europe/Madrid timezone)
// 0 9 * * 1,4 = every Monday (1) and Thursday (4) at 9:00 AM
cron.schedule('0 8 * * 1,4', () => {
    console.log(`\n⏰ [${new Date().toLocaleString('es-ES')}] Ejecutando tarea programada...`);
    main();
}, {
    timezone: "Europe/Madrid"
});

// Uncomment the following line to run immediately on startup (for testing)
// main();