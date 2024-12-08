FROM node AS code
ARG VITE_APP_BACKEND='http://localhost:8000'
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine AS server
WORKDIR /usr/share/nginx/html
COPY --from=code /app/dist .
EXPOSE 80
# run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
