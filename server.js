const express = require('express');
const http = require('http');
const { v4: uuid } = require('uuid');
const { ExpressPeerServer } = require('peer');
const app = express();
const server = http.Server(app);

const io = require('socket.io')(server);
const peerServer = ExpressPeerServer(server, { debug: true });

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuid()}`);
});

app.get('/:roomId', (req, res) => {
  res.render('room', { roomId: req.params.roomId });
});

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message);
    });
  });
});

server.listen(process.env.PORT || 3030);
