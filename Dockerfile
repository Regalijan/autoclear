FROM node
COPY . /opt/autoclear
WORKDIR /opt/autoclear
RUN npm install
RUN npx tsc
ENV NODE_ENV=production
RUN npm prune
RUN node dist/InteractionsDeploy.js
CMD ["node", "dist"]