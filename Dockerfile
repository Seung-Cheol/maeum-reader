FROM node:18-alpine AS build
# RUN,CMD의 명령이 실행될 디렉토리 경로
WORKDIR /usr/src/app
# COPY (복사할 파일 경로) (이미지에서 파일이 위치할 경로)
COPY package*.json ./
# 이미지 실행 시 사용될 명령어
RUN npm install
COPY . .
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
CMD ["node", "dist/main.js"]