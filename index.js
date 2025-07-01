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

// ============================
// 💾 Almacenamiento en memoria
// ============================
const users = [];
let userIdCounter = 1;
const exercises = []; // cada ejercicio tendrá: _id, description, duration, date

// ==================================
// ✅ 2 y 3. Crear usuario (POST /api/users)
// ==================================
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const newUser = {
    username,
    _id: userIdCounter.toString()
  };

  users.push(newUser);
  userIdCounter++;

  res.json(newUser); // ✅ Devuelve { username, _id }
});

// ================================
// ✅ 4, 5, 6. Obtener todos los usuarios (GET /api/users)
// ================================
app.get('/api/users', (req, res) => {
  res.json(users); // ✅ Devuelve array de { username, _id }
});

// ======================================
// ✅ 7 y 8. Registrar ejercicio (POST /api/users/:_id/exercises)
// ======================================
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const parsedDuration = parseInt(duration);
  if (!description || isNaN(parsedDuration)) {
    return res.status(400).json({ error: 'Description and valid duration are required' });
  }

  const parsedDate = date ? new Date(date) : new Date();
  const formattedDate = parsedDate.toDateString();

  const newExercise = {
    _id: userId,
    username: user.username,
    description,
    duration: parsedDuration,
    date: formattedDate
  };

  exercises.push(newExercise);

  res.json({
    _id: user._id,
    username: user.username,
    date: formattedDate,
    duration: parsedDuration,
    description
  });
});

// ================================================
// ✅ 9-16. Obtener historial (GET /api/users/:_id/logs)
// ================================================
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let userExercises = exercises.filter(e => e._id === userId);

  // Filtros por fecha
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  // Filtro por límite
  if (limit) {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit)) {
      userExercises = userExercises.slice(0, parsedLimit);
    }
  }

  const log = userExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('✅ App listening on port ' + listener.address().port);
});
