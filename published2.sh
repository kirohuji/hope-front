#!/bin/bash
set -e

# 构建新镜像
echo "Building new image..."
docker-compose build

# 启动新容器
echo "Starting new container..."
docker-compose up -d --scale nginx-react=2

# 等待新容器健康检查
echo "Waiting for new container to be healthy..."
sleep 10

# 停止旧容器
echo "Stopping old container..."
docker stop ngixreactapp

# 清理旧容器和镜像
echo "Cleaning up old resources..."
docker rm ngixreactapp
docker rmi -f hope-front-nginx-react:latest

# 确保只有一个容器在运行
echo "Scaling back to single container..."
docker-compose up -d --scale nginx-react=1

echo "Deployment completed successfully!"
