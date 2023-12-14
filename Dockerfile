FROM node:18
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .
RUN npm ci
RUN npm run build
ARG NODE_ENV=production
# 환경변수 설정
ENV NODE_ENV=${NODE_ENV}
EXPOSE 3000
CMD [ "npm", "run", "start" ]