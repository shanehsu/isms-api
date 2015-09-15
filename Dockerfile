FROM node
EXPOSE 3000

RUN git clone https://github.com/shanehsu/isms-api.git nodeapp
WORKDIR nodeapp
CMD npm start
