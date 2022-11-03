FROM node:18-bullseye
COPY . /opt/autoclear
WORKDIR /opt/autoclear
RUN rm -rf postgres
RUN npm install
RUN npx tsc
ENV NODE_ENV=production
RUN npm prune
RUN node dist/InteractionsDeploy.js
CMD ["node", "dist"]
