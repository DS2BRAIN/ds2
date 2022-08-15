FROM node:12-alpine
COPY /build /build
RUN npm init -y
RUN npm install serve -g
CMD [ "serve", "-s", "build", "-l", "13001"]
EXPOSE 13001
