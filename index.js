const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Datos en memoria
const users = [];
let userIdCounter = 1;

// ✅ 2 y 3: Crear usuario y devolver JSON con username y _id
app.post('/api/users', (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const newUser = {
    username,
    _id: userIdCounter.toString()
  };

  users.push(newUser);
  userIdCounter++;

  res.json(newUser); // ✅ devuelve { username, _id }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
