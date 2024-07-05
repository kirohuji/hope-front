!/bin/bash
docker stop hope-front-nginx-react
docker rmi -f hope-front-nginx-react:latest
docker rm /ngixreactapp
docker-compose up -d
