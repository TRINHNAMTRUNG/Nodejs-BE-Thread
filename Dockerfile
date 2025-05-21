FROM node:18-alpine

# Cài đặt các công cụ cần thiết cho build (nếu cần module native)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies, bao gồm devDependencies (vì cần ts-node và nodemon)
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose cổng 8090 (thay vì 8088)
EXPOSE 8090

# Chạy ứng dụng bằng lệnh start trong package.json
CMD ["npm", "start"]