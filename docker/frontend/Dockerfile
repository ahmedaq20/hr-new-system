FROM node:20-alpine

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

ARG VITE_API_BASE_URL=http://localhost/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

CMD ["sh", "-c", "cp -r /app/dist/* /output/ 2>/dev/null || true && tail -f /dev/null"]
