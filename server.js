const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// ✅ 1. Раздаём статику из папки public
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 2. Явно указываем маршрут для "/"св
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ 3. Настройка Socket.io
io.on('connection', (socket) => {
  console.log('Новое подключение!');
  
  socket.on('join', (username) => {
    socket.username = username;
    socket.broadcast.emit('message', {
      user: 'Система',
      text: `${username} присоединился к чату`
    });
  });

  socket.on('sendMessage', (messageData) => {
    io.emit('message', {
      user: socket.username,
      text: messageData.text,
      replyTo: messageData.replyTo
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('message', {
        user: 'Система',
        text: `${socket.username} покинул чат`
      });
    }
  });
});

// 🚀 Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));