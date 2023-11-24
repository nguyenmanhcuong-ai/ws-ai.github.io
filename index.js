const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', { pageType: 'enterName' });
});

app.get('/chat', (req, res) => {
  const username = req.query.username;
  res.render('index', { pageType: 'chat', username });
});

io.on('connection', (socket) => {
  //console.log('A user connected');

// To listen for the 'join' event
socket.on('join', (data) => {
  socket.username = data.username;
    console.log(`A User connected: ${socket.username}`);
    io.emit('chat message', { username: 'Server', message: `${socket.username} joined the chat` });
  });

  socket.on('chat message', (data) => {
    // Broadcast the message to all clients except the sender
    socket.broadcast.emit('chat message', { username: socket.username, message: data.message });
  });

  socket.on('voice', (data) => {
    // Broadcast the voice data to all clients including the sender's username
   io.emit('voice', { username: socket.username, audio: data});
});


  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.username}`);
    io.emit('chat message', { username: 'Server', message: `${socket.username} left the chat` });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
