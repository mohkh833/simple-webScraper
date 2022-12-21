const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto('https://www.amazon.eg/-/en/s?i=electronics&bbn=21832883031&rh=n%3A21832883031%2Cp_89%3AApple&page=6&language=en&pf_rd_i=21832883031&pf_rd_m=A1ZVRGNO5AYLOV&pf_rd_p=bf9d5754-be4e-409a-ad87-89abbc6d8911&pf_rd_r=KYGKPFKTCV820S97QGAQ&pf_rd_s=merchandised-search-14&pf_rd_t=101&qid=1671020058&ref=sr_pg_6', {
        waitUntil: 'load'
    })

    const isDisabled = await page.$('span.s-pagination-item.s-pagination-next.s-pagination-disabled') !== null;
    console.log(isDisabled)
    await browser.close();
})()