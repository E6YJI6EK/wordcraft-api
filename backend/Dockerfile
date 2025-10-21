FROM node:alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++ libxext-dev \
    && npm config set registry https://registry.npmjs.org/ \
    && npm cache clean --force \
    && npm install --legacy-peer-deps
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
