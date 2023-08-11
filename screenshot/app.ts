import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import Chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { z } from 'zod';

const endpoint_scheme = z.object({
    url: z.string().url(),
    width: z.number().min(300),
    height: z.number().min(300),
    fullscreen: z.boolean().optional(),
});

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.debug(event.body);
    try {
        if (!event.body)
            throw new Error('You must provide a body (url, width, height, [fullscreen]) to use the function');

        const url_encoded_params = decodeURIComponent(event.body);
        console.debug(event.body);
        console.debug(url_encoded_params);

        const request_params = endpoint_scheme.safeParse(url_encoded_params);

        if (!request_params.success) throw new Error('Could not parse the parameters given to the function');

        const { url, width, height, fullscreen } = request_params.data;

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
            fullPage: fullscreen ? true : false,
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
