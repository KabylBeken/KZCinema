FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Порт для Express внутри контейнера
EXPOSE 5001

# Запускаем сервер Express
CMD ["node", "index.js"] 