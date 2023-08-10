import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const browser = await puppeteer.launch({
            args: [...Chromium.args],
            defaultViewport: Chromium.defaultViewport,
            executablePath: await Chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin'),
            headless: Chromium.headless,
        });

        const url = 'https://www.google.com';
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 });

        const screenshot = await page.screenshot({
            type: 'jpeg',
            fullPage: false,
        });
        const title = await page.title();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: title,
                screenshot: screenshot,
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
