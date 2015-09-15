FROM node
EXPOSE 3000

RUN git clone https://github.com/shanehsu/isms-api.git api
WORKDIR api

RUN npm install
CMD npm start
