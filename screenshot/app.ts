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
            args: [...Chromium.args],
            defaultViewport: {
                width: width,
                height: height,
            },
            executablePath: await Chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin'),
            headless: Chromium.headless,
        });

        const page = await browser.newPage();
        const goto_response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 12000 });
        if (goto_response == null || !goto_response.ok) throw new Error(`Could not reach the website ${url}`);

        const screenshot = await page.screenshot({
            type: 'jpeg',
            fullPage: fullscreen,
        });

        return {
            statusCode: 200,
            headers: {
                'content-type': 'application/octet-stream',
            },
            body: screenshot.toString(),
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
