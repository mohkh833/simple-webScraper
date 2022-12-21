const fs = require('fs')
const puppeteer = require('puppeteer');


(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: false,
		userDataDir: './tmp'
	});
	const page = await browser.newPage();
	
	await page.goto(
		'https://www.amazon.eg/s?bbn=21832883031&rh=n%3A21832883031%2Cp_89%3AApple&language=en&pf_rd_i=21832883031&pf_rd_m=A1ZVRGNO5AYLOV&pf_rd_p=bf9d5754-be4e-409a-ad87-89abbc6d8911&pf_rd_r=KYGKPFKTCV820S97QGAQ&pf_rd_s=merchandised-search-14&pf_rd_t=101&ref=s9_acss_bw_cg_ATF1208_3a1_w'
	);

	let items = [];

	let isBtnDisabled = false;

	while (!isBtnDisabled) {
        await page.waitForSelector('[data-cel-widget="search_result_0"]');
        const productHandles = await page.$$('div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item');
		for (const productHandle of productHandles) {
			let title = 'Null';
			let price = 'Null';
			let img = 'Null';
			try {
				title = await page.evaluate((el) => el.querySelector('h2 > a > span').textContent, productHandle);
			} catch (err) {
				// console.log(err)
			}
			try {
				price = await page.evaluate(
					(el) => el.querySelector('.a-price > .a-offscreen').textContent,
					productHandle
				);
			} catch (err) {}

			try {
				img = await page.evaluate((el) => el.querySelector('.s-image').getAttribute('src'), productHandle);
			} catch (err) {}

			if (title !== 'Null') {
				items.push({ title, price, img });
                fs.appendFile('results.csv', `${title.replace(/,/g, ".")},${price.replace(/,/g, "")},${img}\n`, (err)=>{

                })
			}
		}

		await page.waitForSelector('.s-pagination-item.s-pagination-next', { visible: true });

		const isDisabled = (await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled')) !== null;

		isBtnDisabled = isDisabled;
		if (!isDisabled){
                await page.click('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator')
                page.waitForNavigation({ waitUntil: "networkidle2" })
        }
			
	}


	await browser.close()
})();

//await browser.close()
