import axios from "axios";

const URL = "https://park.cinesabc.com/";

async function main() {
    // Una petición HTTP GET a la URL del cine fingiendo ser un navegador real. Es lo mismo que cuando escribes la URL en Chrome.
  const response = await axios.get(URL, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  // response es un objeto con mucha info
  console.log(response.status);
  //console.log(response.headers);
  console.log(response.data.slice(0, 500));
}

main();
