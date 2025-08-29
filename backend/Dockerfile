FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Default command - run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
