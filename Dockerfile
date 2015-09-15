FROM node
EXPOSE 3000

RUN git clone https://github.com/shanehsu/isms-api.git .
CMD npm start
