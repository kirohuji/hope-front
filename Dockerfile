# build environment
FROM node:20.18.3 as build
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json yarn.lock ./
RUN npm config set registry "https://registry.npmmirror.com"
# RUN npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp"
# RUN npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"
RUN yarn

# Copy the rest of the application code
COPY . .

RUN sed -i 's#"main": "dist/plugin.cjs.js"#"main": "dist/esm/index.js"#' /app/node_modules/@revenuecat/purchases-capacitor/package.json

RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/ssl /usr/local/nginx/ssl
EXPOSE 443
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
