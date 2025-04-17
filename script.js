const socket = io();
const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const joinButton = document.getElementById('join-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesDiv = document.getElementById('messages');
const usersList = document.getElementById('users');
const fileInput = document.getElementById('file-input');
const attachButton = document.getElementById('attach-button');

let username = null;
const userColors = {}; // Objeto para almacenar el color de cada usuario

// Función para generar un color aleatorio
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

joinButton.addEventListener('click', () => {
  username = usernameInput.value.trim();
  if (username) {
    socket.emit('set-username', username);
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
  }
});

sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('send-message', message);
    messageInput.value = '';
  }
});

messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendButton.click();
  }
});

attachButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    // Aquí puedes implementar la lógica para enviar archivos (más complejo con Socket.IO y sin almacenamiento persistente)
    // Para simplificar, mostraremos el nombre del archivo por ahora.
    const message = `Archivo adjunto: ${file.name}`;
    socket.emit('send-message', message);
    fileInput.value = ''; // Limpiar el input de archivo
  }
});

socket.on('user-connected', (data) => {
  if (!userColors[data.id]) {
    userColors[data.id] = getRandomColor();
  }
  const messageElement = document.createElement('p');
  messageElement.innerHTML = `<span style="color: green;">${data.username} se ha unido al chat.</span>`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('user-disconnected', (data) => {
  const messageElement = document.createElement('p');
  messageElement.innerHTML = `<span style="color: red;">${data.username} ha abandonado el chat.</span>`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('new-message', (data) => {
  if (!userColors[data.userId]) {
    userColors[data.userId] = getRandomColor();
  }
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.innerHTML = `<span class="username" style="color: ${userColors[data.userId]}">${data.username}:</span> ${data.message}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

socket.on('update-user-list', (users) => {
  usersList.innerHTML = '';
  users.forEach(user => {
    const listItem = document.createElement('li');
    listItem.textContent = user;
    usersList.appendChild(listItem);
  });
});