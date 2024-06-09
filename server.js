const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

let messagesDict = {};

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API endpoint to get the messages dictionary
app.get('/api/selected', (req, res) => {
  res.json(messagesDict);
});

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

// Endpoint to set the messages dictionary
app.post('/api/selected', (req, res) => {
  messagesDict = req.body;
  res.status(200).send();

  // Send updates to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messagesDict));
    }
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
