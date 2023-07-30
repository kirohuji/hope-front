# Set the base image to node:12-alpine
FROM node:latest as build

# Specify where our app will live in the container
WORKDIR /app

# Copy the React App to the container
COPY . /app/

# Prepare the container for building React
RUN npm config set registry https://registry.npmmirror.com/
RUN npm install
RUN npm install react-scripts@3.0.1 -g
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