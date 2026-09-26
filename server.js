require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const readData = (file) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
const writeData = (file, data) =>
  fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2));

app.get('/api/awards', (req, res) => res.json(readData('./awards.json')));

app.post('/api/awards', (req, res) => {
  const { item, index } = req.body;
  let data = readData('./awards.json');

  if (index === -1) {
    data.push(item);
  } else {
    data[index] = item;
  }

  writeData('./awards.json', data);
  res.json({ success: true });
});

app.delete('/api/awards', (req, res) => {
  const { index } = req.body;
  let data = readData('./awards.json');
  data.splice(index, 1);
  writeData('./awards.json', data);
  res.json({ success: true });
});

app.get('/api/links', (req, res) => res.json(readData('./links.json')));

app.post('/api/links', (req, res) => {
  const { item, index } = req.body;
  let data = readData('./links.json');

  if (index === -1) {
    data.push(item);
  } else {
    data[index] = item;
  }

  writeData('./links.json', data);
  res.json({ success: true });
});

app.delete('/api/links', (req, res) => {
  const { index } = req.body;
  let data = readData('./links.json');
  data.splice(index, 1);
  writeData('./links.json', data);
  res.json({ success: true });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

module.exports = app;

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`),
);
