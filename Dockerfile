# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine AS base

LABEL fly_launch_runtime="Astro"

# Astro app lives here
WORKDIR /app

# Suppress update notifications
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Disable Astro telemetry
ENV ASTRO_TELEMETRY_DISABLED=1

# Install pnpm
ARG PNPM_VERSION=10.12.1
RUN npm install -g pnpm@$PNPM_VERSION

# Throw-away build stage to reduce size of final image
FROM base AS build

# Declare build arguments to receive values from flyctl deploy --build-arg
ARG COMMIT_HASH
ARG COMMIT_DATE
ARG ENV_FILE

# Install packages needed to build node modules
RUN apk add --no-cache build-base python3

# Install node modules
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --prod --prefer-offline

# Copy application code
COPY . .

RUN echo "${ENV_FILE}" > .env && \
    echo "COMMIT_HASH=${COMMIT_HASH}" >> .env && \
    echo "COMMIT_DATE=${COMMIT_DATE}" >> .env

# Build application
RUN pnpm run build

# Set production environment
ENV NODE_ENV="production"

# Final stage for app image
FROM base

# Copy built application
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

ENV PORT=4321
ENV HOST=0.0.0.0

# Start the server by default, this can be overwritten at runtime
EXPOSE 4321
CMD [ "node", "./dist/server/entry.mjs" ]