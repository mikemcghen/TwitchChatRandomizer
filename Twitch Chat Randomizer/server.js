const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

let messagesDict = {};

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/selected', (req, res) => {
  res.json(messagesDict);
});

app.post('/api/selected', (req, res) => {
  messagesDict = req.body;
  res.status(200).send();
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
