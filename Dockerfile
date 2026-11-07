FROM node:24-alpine

WORKDIR /app/rosegold_web
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5173

# Vite needs --host to accept connections from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
