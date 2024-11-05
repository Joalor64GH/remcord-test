const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the static files from "public" folder
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('sendMessage', (msg) => {
        // Broadcasts message to everyone (including sender)
        io.emit('receiveMessage', msg);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
