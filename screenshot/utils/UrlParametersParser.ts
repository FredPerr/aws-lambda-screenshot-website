import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda';
import { z } from 'zod';

export const ENDPOINT_PARAMETERS_DEFS = z.object({
    url: z.string().url(),
    width: z.number().min(300),
    height: z.number().min(300),
    fullscreen: z.boolean(),
});

export const DEFAULT_ENDPOINT_PARAMETERS: z.infer<typeof ENDPOINT_PARAMETERS_DEFS> = {
    url: '',
    width: 1080,
    height: 720,
    fullscreen: false,
};

const MISSING_PARAMETER_ERROR_MSG = 'Could not find the {param} parameter in your search parameters';

export function parseUrlToEndpoint(urlParameters: APIGatewayProxyEventQueryStringParameters) {
    const endpointParameters = DEFAULT_ENDPOINT_PARAMETERS;

    const url = urlParameters['url'];
    const width = urlParameters['width'];
    const height = urlParameters['height'];
    const fullscreen = urlParameters['fullscreen'];

    if (url) endpointParameters.url = url;
    else throw new Error(MISSING_PARAMETER_ERROR_MSG.replace('{param}', 'url'));

    if (width) endpointParameters.width = Number(width);
    else throw new Error(MISSING_PARAMETER_ERROR_MSG.replace('{param}', 'width'));

    if (height) endpointParameters.height = Number(height);
    else throw new Error(MISSING_PARAMETER_ERROR_MSG.replace('{param}', 'height'));

    if (fullscreen) endpointParameters.fullscreen = fullscreen === 'true';
    else throw new Error(MISSING_PARAMETER_ERROR_MSG.replace('{param}', 'fullscreen'));

    const validatedParameters = ENDPOINT_PARAMETERS_DEFS.safeParse(endpointParameters);

    if (!validatedParameters.success) {
        throw new Error('Could not validate the request URL: ' + validatedParameters.error.toString());
    } else {
        return validatedParameters.data;
    }
}
