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
            Days: Days,
            Hours: Hours
        };

        console.log(JSON.stringify(insideFilms, null, 2));
        break;
    }

    

    browser.close();

    //console.log(allFilms);
}

ScrapeData("https://park.cinesabc.com/");
 