# Use the official Bun image
FROM oven/bun:latest as base
WORKDIR /usr/src/app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Copy dependencies and source code
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Run the server
USER bun
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
