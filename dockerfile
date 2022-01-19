FROM node:11-alpine
COPY ./ /app/
WORKDIR /app
RUN npm install
EXPOSE 50051
CMD ["node", "services/echoService.js"]