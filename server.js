// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use(express.static('public')); // Servir archivos estáticos (HTML, CSS, JS)

const users = {};
const chatGroupName = 'Tpf asamblea 2';
const groupMembers = {};

io.on('connection', (socket) => {
  let username;

  socket.on('set-username', (name) => {
    username = name;
    users[socket.id] = username;
    console.log(`${username} connected`);

    // Unir al usuario al grupo "Tpf asamblea 2"
    socket.join(chatGroupName);
    if (!groupMembers[chatGroupName]) {
      groupMembers[chatGroupName] = [];
    }
    groupMembers[chatGroupName].push({ id: socket.id, name: username });

    // Emitir la lista de usuarios conectados al grupo
    io.to(chatGroupName).emit('user-connected', { username: username, id: socket.id });
    io.to(chatGroupName).emit('update-user-list', groupMembers[chatGroupName].map(user => user.name));
  });

  socket.on('send-message', (message) => {
    io.to(chatGroupName).emit('new-message', { username: username, message: message, userId: socket.id });
  });

  socket.on('disconnect', () => {
    if (username) {
      console.log(`${username} disconnected`);
      delete users[socket.id];

      // Eliminar al usuario del grupo
      if (groupMembers[chatGroupName]) {
        groupMembers[chatGroupName] = groupMembers[chatGroupName].filter(user => user.id !== socket.id);
        io.to(chatGroupName).emit('user-disconnected', { username: username, id: socket.id });
        io.to(chatGroupName).emit('update-user-list', groupMembers[chatGroupName].map(user => user.name));
      }
    }
  });
});

http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});