#!/bin/bash


# Build the Encore application
cd backend
encore build docker todo-app:backend --arch arm64 --os linux
cd ..

# Start the services
docker-compose up --build
