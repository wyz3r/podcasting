FROM node
ADD . /app
WORKDIR /app
RUN npm install
CMD npm run build && npm start 
EXPOSE 80
