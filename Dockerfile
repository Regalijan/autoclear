FROM node
COPY . /opt/autoclear
WORKDIR /opt/autoclear
RUN npm install
RUN npx tsc
ENV NODE_ENV=production
RUN npm prune
RUN node dist/InteractionsDeploy.js
RUN psql -U postgres -h postgres autoclear < template.db
CMD ["node", "dist"]