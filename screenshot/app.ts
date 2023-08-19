import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { parseUrlToEndpoint, DEFAULT_ENDPOINT_PARAMETERS } from 'utils/UrlParametersParser';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (event.queryStringParameters == null)
            throw new Error(
                'You have to provide the following parameters in your request URL: ' +
                Object.keys(DEFAULT_ENDPOINT_PARAMETERS).toString(),
            );

        const { url, width, height, fullscreen } = parseUrlToEndpoint(event.queryStringParameters);

        const browser = await puppeteer.launch({
            args: [
                ...Chromium.args,
                '--user-agent=Mozilla/5.0 (Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0)',
            ],
            defaultViewport: {
                width: width,
                height: height,
            },
            executablePath: await Chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin'),
            headless: Chromium.headless,
        });

        const page = await browser.newPage();
        const goto_response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 16000 });
        if (goto_response == null || !goto_response.ok) throw new Error(`Could not reach the website ${url}`);

        const screenshot = await page.screenshot({
            type: 'jpeg',
            fullPage: fullscreen,
        });

        return {
            statusCode: 200,
            headers: {
                'content-type': 'text/plain',
            },
            body: screenshot.toString('base64'),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `An error occurred while processing your request: ${err}`,
            }),
        };
    }
};
