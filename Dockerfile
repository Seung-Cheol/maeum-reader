FROM node:18
RUN mkdir -p /var/app
WORKDIR /var/app
COPY . .
RUN npm ci
RUN npm run build


FROM node:18-alpine
WORKDIR /usr/src/app
ARG NODE_ENV=production
# 환경변수 설정
ENV NODE_ENV=${NODE_ENV}
# COPY --from=build /usr/src/app/.env ./.env
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./
RUN npm install --only=production
RUN rm package*.json
# 호스트와 연결할 포트 번호
EXPOSE 3000
# 컨테이너가 시작되었을 때 실행하는 명령
CMD ["node", "dist/main.js"]