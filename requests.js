const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch({
        headless:false,
        defaultViewport:false
    })

    const page = await browser.newPage();

    await page.setRequestInterception(true)

    page.on("request", (request)=>{
        // console.log(request.url())
        const url = request.url()

        if(request.resourceType() == 'image'){
            request.abort()
        } else{
            request.continue()
        }
    })

    // page.on("response", async (response)=>{
    //     const url = response.url()

    //     if(url.includes("https://www.google.com/log?format=json")){
    //         // console.log(url)
    //         console.log(`URL: ${url}`)
    //         console.log(`Headers: ${JSON.stringify(response.headers())}`)
    //         console.log(`Response: ${JSON.stringify( await response.json())}`)
    //     }
    // })
    await page.goto(
        "https://www.google.com/search?q=mountain&newwindow=1&sxsrf=ALiCzsZCPwJQX8vfYs4Mj4Ka34go0dF_UA:1671365098564&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjrp_WXkIP8AhWHhM4BHSgGDk0Q_AUoAXoECAEQAw&biw=1920&bih=955&dpr=1"
    )


})()