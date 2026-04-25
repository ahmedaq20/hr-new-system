FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash

CMD ["sh", "-c", "npm ci && npm run build && cp -r dist/* /output/"]
