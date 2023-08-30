const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const crypto = require('crypto');
const mongoose = require('mongoose');
const messages = require('../data.json').names;
const cities = require('../data.json').cities;

mongoose.connect('mongodb+srv://swamyburande55:doesntmatter@cluster0.psoe3ls.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
});

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

function decryptMessage(encryptedMessage) {
      // Define your decryption key and algorithm
      const decryptionKey = 'my-secret-key-itis'; // Replace with your actual secret key
      const algorithm = 'aes-256-ctr';

      // Convert the encrypted message to a Buffer
      const encryptedBuffer = Buffer.from(encryptedMessage, 'hex');

      // Extract the initialization vector (IV) from the encrypted buffer
      const iv = encryptedBuffer.slice(0, 16); // Extracted the first 16 bytes (IV)

      // Create a decipher using the decryption key and IV
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(decryptionKey), iv);

      // Decrypt the message
      const decryptedMessage = Buffer.concat([decipher.update(encryptedBuffer.slice(16)), decipher.final()]);

      // Return the decrypted message as a string
      return decryptedMessage.toString('utf8');
}


function validateData(data) {
      // Check if data is an object
      if (typeof data !== 'object' || data === null) {
            return false;
      }

      // Check if data has the required properties
      if (!data.hasOwnProperty('name') || !data.hasOwnProperty('origin') || !data.hasOwnProperty('destination') || !data.hasOwnProperty('secret_key')) {
            return false;
      }

      // Check if the required properties are non-empty strings
      if (typeof data.name !== 'string' || data.name.trim() === '' ||
            typeof data.origin !== 'string' || data.origin.trim() === '' ||
            typeof data.destination !== 'string' || data.destination.trim() === '' ||
            typeof data.secret_key !== 'string' || data.secret_key.trim() === '') {
            return false;
      }

      // If all checks pass, the data is valid
      return true;
}

const MessageSchema = new mongoose.Schema({
      name: String,
      origin: String,
      destination: String,
      timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

io.on('connection', (socket) => {
      console.log('Listener connected');

      socket.on('message', (encryptedMessage) => {
            const decryptedMessage = decryptMessage(encryptedMessage);
            if (decryptedMessage) {
                  const data = JSON.parse(decryptedMessage);
                  if (validateData(data)) {
                        const message = new Message({
                              name: data.name,
                              origin: data.origin,
                              destination: data.destination,
                        });
                        message.save();
                  }
            }
      });
});

server.listen(4000, () => {
      console.log('Listener listening on port 4000');
});
