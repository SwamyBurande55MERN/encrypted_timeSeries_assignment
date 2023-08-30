const socket = io();


function decryptMessage(encryptedMessage) {
      // Define your decryption key and algorithm
      const decryptionKey = 'my-secret-key-itis'; // Replace with your actual secret key
      const algorithm = 'aes-256-ctr';

      // Convert the encrypted message to a Buffer
      const encryptedBuffer = Buffer.from(encryptedMessage, 'hex');

      // Extract the initialization vector (IV) from the encrypted buffer
      const iv = encryptedBuffer.slice(0, 16); // Extract the first 16 bytes (IV)

      // Create a decipher using the decryption key and IV
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(decryptionKey), iv);

      // Decrypt the message
      const decryptedMessage = Buffer.concat([decipher.update(encryptedBuffer.slice(16)), decipher.final()]);

      // Return the decrypted message as a string
      return decryptedMessage.toString('utf8');
}


function displayMessage(data) {
      const messagesContainer = document.getElementById('messages');
      const messageDiv = document.createElement('div');
      messageDiv.innerText = `Name: ${data.name}, Origin: ${data.origin}, Destination: ${data.destination}`;
      messagesContainer.appendChild(messageDiv);
}

socket.on('message', (encryptedMessage) => {
      const decryptedMessage = decryptMessage(encryptedMessage);
      if (decryptedMessage) {
            const data = JSON.parse(decryptedMessage);
            displayMessage(data);
      }
});
