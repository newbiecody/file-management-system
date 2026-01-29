# Document Management System

A file management system with file uploads, relational metadata, validation, and pagination, built using Node.js, NextJS, TypeScript, and MySQL.

# Prerequisites
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Docker Compose - Usually included with Docker Desktop.

# How to run:
1. Since it's for demo purposes, rename [.env.example](./.env.example) to [.env](./.env)

2. Build and Start
Open your terminal in the project root and run:
`docker-compose up -d --build`

3. Access the Application
Once the build is complete, you can view the app at: `http://localhost:3000`

# Shutting down
Run: `docker-compose down`

# Encountered issue:
Run: `docker-compose down --rmi all -v && docker-compose up -d --build`

