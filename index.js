const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// 👆 importante para leer form-data


// 🧠 En memoria
let users = [];
let exercises = [];
let nextUserId = 1;



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// ✅ POST /api/users
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'Username is required' });
  const newUser = {
    username,
    _id: nextUserId.toString()
  };
  users.push(newUser);
  nextUserId++;
  res.json(newUser);
});

// ✅ GET /api/users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// ✅ POST /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const parsedDuration = parseInt(duration);
  if (!description || isNaN(parsedDuration)) {
    return res.status(400).json({ error: 'Invalid description or duration' });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const formattedDate = exerciseDate.toDateString();

  const newExercise = {
    _id,
    username: user.username,
    description,
    duration: parsedDuration,
    date: formattedDate
  };

  exercises.push(newExercise);

  res.json({
    username: user.username,
    description,
    duration: parsedDuration,
    date: formattedDate,
    _id: user._id
  });
});


// ✅ GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === _id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let log = exercises.filter(e => e._id === _id);

  // Filtrado por fechas
  if (from) {
    const fromDate = new Date(from);
    log = log.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit)) {
      log = log.slice(0, parsedLimit);
    }
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// const express = require('express');
// const app = express();
// const cors = require('cors');
// require('dotenv').config();

// app.use(cors());
// app.use(express.urlencoded({ extended: false })); // 👈 importante para leer form-data
// app.use(express.json());
// app.use('/public', express.static('public'));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html');
// });











// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log('Your app is listening on port ' + listener.address().port);
// });
