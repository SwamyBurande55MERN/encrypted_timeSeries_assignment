const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const crypto = require('crypto');
const messages = require('../data.json').names;
const cities = require('../data.json').cities;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

function generateRandomMessage() {
      const name = messages[Math.floor(Math.random() * messages.length)];
      const origin = cities[Math.floor(Math.random() * cities.length)];
      const destination = cities[Math.floor(Math.random() * cities.length)];
      const secret_key = crypto.createHash('sha256').update(JSON.stringify({ name, origin, destination })).digest('hex');
      const encryptedMessage = encryptMessage(JSON.stringify({ name, origin, destination, secret_key }));
      return encryptedMessage;
}

function encryptMessage(message) {
      // encryption key and algorithm
      const encryptionKey = 'my-secret-key-itis'; // Replace with your actual secret key
      const algorithm = 'aes-256-ctr';

      // Create an initialization vector (IV)
      const iv = crypto.randomBytes(16);

      // Created a cipher using the encryption key and IV
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey), iv);

      // Encrypt the message
      const encryptedMessage = Buffer.concat([iv, cipher.update(message, 'utf8'), cipher.final()]);

      // Return the encrypted message as a hex-encoded string
      return encryptedMessage.toString('hex');
}

io.on('connection', (socket) => {
      console.log('Emitter connected');

      setInterval(() => {
            const message = generateRandomMessage();
            socket.emit('message', message);
      }, 10000);
});

server.listen(9999, () => {
      console.log('Emitter listening on port 9999');
});
