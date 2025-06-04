FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта
COPY . .

# Устанавливаем явно переменную окружения PORT
ENV PORT=3001

# Порт для приложения React внутри контейнера
EXPOSE 3001

# Запускаем React приложение
CMD ["npm", "start"] 