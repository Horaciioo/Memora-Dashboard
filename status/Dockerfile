# Standalone status page, no dependency, no build
FROM node:22-bookworm-slim
WORKDIR /app
COPY status/ ./
ENV NODE_ENV=production
EXPOSE 3001
USER node
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--experimental-strip-types", "--disable-warning=ExperimentalWarning", "server.ts"]
