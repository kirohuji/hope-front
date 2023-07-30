# Set the base image to node:12-alpine
FROM node:16.15.0 as build

# Prepare the container for building React
COPY package.json /tmp/package.json
RUN npm config set registry https://registry.npmmirror.com/
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

# Specify where our app will live in the container
WORKDIR /app

# Copy the React App to the container
COPY . /app/

# We want the production version
RUN npm run build

# Prepare nginx
FROM nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

# Fire up nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]