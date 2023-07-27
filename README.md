# aws-website-screenshot-function

## Getting started

### Build the project:
`sam build`

### Invoke the function locally:
_You may want to use `sudo` if Docker requires it._
<br/>
`sam invoke ScreenshotWebsiteFunction -e events/event.json`

### Deploy the function to Lambda
`sam deploy`

> On the first deploy, you should add the "--guided" tag
