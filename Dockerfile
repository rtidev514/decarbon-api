# Use the official Node.js LTS alpine image
FROM node:20-alpine AS base

# Set working directory inside container
WORKDIR /app

# Install dependencies only when package.json/package-lock.json changes
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build the NestJS app (TypeScript → JavaScript)
RUN npm run build

# -------------------------------
# Final lightweight runtime stage
# -------------------------------
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only necessary artifacts from build stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./

# Render sets PORT dynamically, so don't hardcode it
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
