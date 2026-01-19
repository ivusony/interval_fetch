// Provera okruzenja i import ako je potreban
let fetch;
if (typeof window === 'undefined') {
    // Node.js okruzenje
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
} else {
    // Browser okruzenje - koristi native fetch
    fetch = window.fetch.bind(window);
}


// glavna funkcija sa default parametrima ukoliko nisu prosledjeni
async function main(
    delay = 4000,
    repetitions = 20,
    url = "https://www.google.com"
){
    const httpSuccessStatuses = [ 200, 201, 202, 203, 204, 205, 206, 207, 208, 226 ];
    let counter = 1;


    async function fetchUrl( urlToFetch ){
        try {
            const response = await fetch( 
                urlToFetch,
                { 
                    method: 'GET',
                    signal: AbortSignal.timeout( delay - 1000 ) // timeout malo manji od intervala
                }
            );
            return response.status;
        } catch (error) {
            console.log("Fetch error:", error.message);
            return null;
        }
    }

    let intervalID;

    async function checkUrl() {
        const status = await fetchUrl( url );

        // zaustavljanje intervala ako je status uspešan
        if( httpSuccessStatuses.includes(status) ){
            if (intervalID) clearInterval(intervalID);
            console.log("Success! Status: " + status);
            return true;
        }

        counter++;

        // zaustavljanje intervala nakon odredjenog broja ponavljanja
        if( counter > repetitions ){
            if (intervalID) clearInterval(intervalID);
            console.log("Finished testing - max repetitions reached");
            return true;
        }

        return false;
    }

    // Prvi poziv odmah
    const firstCheckSuccess = await checkUrl();

    // Postavi interval samo ako prvi poziv nije uspeo
    if (!firstCheckSuccess && counter <= repetitions) {
        intervalID = setInterval(checkUrl, delay);
    }

    
}



main(
    // delay u milisekundama
    4000,
    // broj ponavljanja
    20,
    // url koji se testira (dozvoljava cors)
    "https://httpbin.org/get"
);