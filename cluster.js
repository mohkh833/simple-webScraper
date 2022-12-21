const { Cluster } = require('puppeteer-cluster');
const fs = require('fs');

const urls = [
	'https://www.amazon.eg/-/en/s?i=electronics&bbn=21832883031&rh=n%3A21832883031%2Cp_89%3ASAMSUNG&dc&language=en&pf_rd_i=21832883031&pf_rd_m=A1ZVRGNO5AYLOV&pf_rd_p=bf9d5754-be4e-409a-ad87-89abbc6d8911&pf_rd_r=KYGKPFKTCV820S97QGAQ&pf_rd_s=merchandised-search-14&pf_rd_t=101&qid=1671362695&rnid=22541269031&ref=sr_nr_p_89_2&ds=v1%3Af18i1VBG%2FngHnxlWtrMEDHszoXWcIO5BGzHxhAc4yfA',
	'https://www.amazon.eg/-/en/s?i=electronics&bbn=21832883031&rh=n%3A21832883031%2Cp_89%3AApple&dc&language=en&pf_rd_i=21832883031&pf_rd_m=A1ZVRGNO5AYLOV&pf_rd_p=bf9d5754-be4e-409a-ad87-89abbc6d8911&pf_rd_r=KYGKPFKTCV820S97QGAQ&pf_rd_s=merchandised-search-14&pf_rd_t=101&qid=1671362755&rnid=22541269031&ref=sr_nr_p_89_1&ds=v1%3AzKc3PRWE1L8vM7DI%2F8uoyGy2MFaSKF0V1D7njauON6k'
];

(async () => {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 100,
		monitor: true,
		puppeteerOptions: {
			headless: false,
			defaultViewport: false,
			userDataDir: './tmp'
		}
	});

	cluster.on('taskerror', (err, data) => {
		console.log(`Error crawling ${data}: ${err.message}`);
	});

	await cluster.task(async ({ page, data: url }) => {
		await page.goto(url);

		let isBtnDisabled = false;

		while (!isBtnDisabled) {
			await page.waitForSelector('[data-cel-widget="search_result_0"]');
			const productHandles = await page.$$(
				'div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item'
			);
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
					// items.push({ title, price, img });
					fs.appendFile(
						'results.csv',
						`${title.replace(/,/g, '.')},${price.replace(/,/g, '')},${img}\n`,
                        function (err) {
                            if (err) throw err;
                        }
					);
				}
			}

			await page.waitForSelector('.s-pagination-item.s-pagination-next', { visible: true });

			const isDisabled = (await page.$('.s-pagination-item.s-pagination-next.s-pagination-disabled')) !== null;

			isBtnDisabled = isDisabled;
			if (!isDisabled) {
                await Promise.all([
                    page.click('a.s-pagination-item.s-pagination-next.s-pagination-button.s-pagination-separator'),
                    page.waitForNavigation({ waitUntil: "networkidle2" })
                ])

			}
		}
	});

    for (const url of urls) {
        await cluster.queue(url);
      }
	await cluster.idle();
	await cluster.close();
})();
