# 使用目前最新版本的 Node.js
# 但是一定要指定版本，因為 64 位元的 ARM 映像
# 沒有 latest 標籤
FROM node
# FROM aarch64/node:8

# 產生資料夾
RUN mkdir /root/src

# 安裝 TypeScript 編譯器
RUN npm install --global typescript

# 因為該版本的 node 已經有 git 了
# 直接下載專案
# RUN git clone https://www.github.com/shanehsu/isms-api.git /root/src
COPY . /root/src

# 編譯
WORKDIR /root/src
RUN npm install
RUN tsc; exit 0

# 使用通訊埠
EXPOSE 80
EXPOSE 443

# 環境變數（資料庫）
ENV MONGO_HOST mongo
ENV MONGO_PORT 27017
ENV MONGO_DB   isms

# 環境變數
ENV NOSSL 1
ENV PORT  80

# 執行
CMD node ~/src/distribution/server.js
