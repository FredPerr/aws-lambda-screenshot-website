# aws-website-screenshot-function

## Getting started

### Build the project:
`sam build`

### Deploy the function to Lambda
`sam deploy`

> On the first deploy, you should add the "--guided" tag

** To build and deploy quickly, without having to confirm the changeset, use:
`sam build && sam deploy --no-confirm-changeset`

### For your lambda function to work with chromium, you must add the following layers to your function:
- Chromium (Sparticuz version's), which can be found (here)[https://github.com/Sparticuz/chromium/releases]
- Zod, which can be installed via `npm install zod` and then you zip a `zod.zip` file with the `zod` folder from `node_modules` to `nodejs/node_modules/zod` inside it.
  So you get a zip file named `zod.zip` with `nodejs/node_modules/zod/` inside it.
