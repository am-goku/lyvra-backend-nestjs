# --- Builder Stage ---
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies (dev + prod)
COPY package*.json ./
RUN npm install

# Copy source code & Prisma schema
COPY . .

# Generate Prisma client (needs DATABASE_URL)
RUN npx prisma generate

# Build NestJS project (TS -> JS)
RUN npm run build

# --- Production Stage ---
FROM node:22-alpine AS production
WORKDIR /app

# Use production environment
ENV NODE_ENV=production

# Copy package files & install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma client files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/src/main.js"]
