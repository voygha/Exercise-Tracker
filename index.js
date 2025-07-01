const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const users = [];
const exercises = [];
let userIdCounter = 1;

// Crear un nuevo usuario
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

  res.json(newUser);
});

// Obtener todos los usuarios
app.get('/api/users', (req, res) => {
  const userList = users.map(user => ({
    username: user.username,
    _id: user._id
  }));
  res.json(userList);
});

// Registrar un ejercicio
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const parsedDuration = parseInt(duration);
  const parsedDate = date ? new Date(date) : new Date();

  if (!description || isNaN(parsedDuration)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const exercise = {
    _id: userId,
    username: user.username,
    description,
    duration: parsedDuration,
    date: parsedDate.toDateString()
  };

  exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description
  });
});

// Obtener historial de ejercicios
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  const user = users.find(u => u._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter(e => e._id === userId);

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(e => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(e => new Date(e.date) <= toDate);
  }

  if (limit) {
    const parsedLimit = parseInt(limit);
    if (!isNaN(parsedLimit)) {
      userExercises = userExercises.slice(0, parsedLimit);
    }
  }

  const log = userExercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: new Date(e.date).toDateString()
  }));

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log
  });
});

// Página principal renderizada
app.get('/', (req, res) => {
  const userList = users.map(u => `<li>${u.username} (${u._id})</li>`).join('');
  const exerciseList = exercises.map(e => `
    <li>
      <strong>${e.username}</strong> - ${e.description} (${e.duration} mins) on ${e.date}
    </li>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Exercise Tracker | freeCodeCamp</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div class="container">
          <h1>Exercise tracker</h1>

          <form action="/api/users" method="post">
            <h2>Create a New User</h2>
            <input type="text" name="username" placeholder="username" required />
            <input type="submit" value="Submit" />
          </form>

          <h3>Usuarios creados:</h3>
          <ul>${userList}</ul>

          <h2>Buscar usuario por ID</h2>
          <form method="GET" action="/buscar-usuario">
            <input type="text" name="id" placeholder="Ingresa el ID del usuario" required />
            <input type="submit" value="Buscar" />
          </form>

          <form method="POST" action="" id="exercise-form" onsubmit="updateAction(event)">
            <h2>Add exercises</h2>
            <input id="uid" type="text" name="_id" placeholder="_id" />
            <input id="desc" type="text" name="description" placeholder="description*" />
            <input id="dur" type="text" name="duration" placeholder="duration* (mins.)" />
            <input id="date" type="text" name="date" placeholder="date (yyyy-mm-dd)" />
            <input type="submit" value="Submit" />
          </form>

          <h3>Ejercicios registrados:</h3>
          <ul>${exerciseList}</ul>

          <p><strong>GET user's exercise log:</strong> <code>GET /api/users/:_id/logs?[from][&to][&limit]</code></p>
        </div>

        <script>
          function updateAction(event) {
            const userId = document.getElementById("uid").value.trim();
            if (!userId) {
              alert("Por favor, ingresa un ID de usuario válido.");
              event.preventDefault();
              return;
            }
            event.target.action = \`/api/users/\${userId}/exercises\`;
          }
        </script>
      </body>
    </html>
  `;

  res.send(html);
});

// Buscar usuario y mostrar su historial en HTML
app.get('/buscar-usuario', (req, res) => {
  const userId = req.query.id;
  const user = users.find(user => user._id === userId);

  const resultHtml = user
    ? `<p>Usuario encontrado: <strong>${user.username}</strong> (ID: ${user._id})</p>`
    : `<p style="color:red;">Usuario con ID ${userId} no encontrado.</p>`;

  const userList = users.map(u => `<li>${u.username} (${u._id})</li>`).join('');

  const userExercises = user
    ? exercises.filter(e => e._id === userId)
    : [];

  const exerciseLog = userExercises.map(e => `
    <li>
      ${e.description} - ${e.duration} mins on ${e.date}
    </li>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Exercise Tracker | freeCodeCamp</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <div class="container">
          <h1>Exercise tracker</h1>

          <form action="/api/users" method="post">
            <h2>Create a New User</h2>
            <input type="text" name="username" placeholder="username" required />
            <input type="submit" value="Submit" />
          </form>

          <h3>Usuarios creados:</h3>
          <ul>${userList}</ul>

          <h2>Buscar usuario por ID</h2>
          <form method="GET" action="/buscar-usuario">
            <input type="text" name="id" placeholder="Ingresa el ID del usuario" required />
            <input type="submit" value="Buscar" />
          </form>

          ${resultHtml}

          <h3>Historial de ejercicios:</h3>
          <ul>${exerciseLog}</ul>

          <form method="POST" action="" id="exercise-form" onsubmit="updateAction(event)">
            <h2>Add exercises</h2>
            <input id="uid" type="text" name="_id" placeholder="_id" />
            <input id="desc" type="text" name="description" placeholder="description*" />
            <input id="dur" type="text" name="duration" placeholder="duration* (mins.)" />
            <input id="date" type="text" name="date" placeholder="date (yyyy-mm-dd)" />
            <input type="submit" value="Submit" />
          </form>

          <script>
            function updateAction(event) {
              const userId = document.getElementById("uid").value.trim();
              if (!userId) {
                alert("Por favor, ingresa un ID de usuario válido.");
                event.preventDefault();
                return;
              }
              event.target.action = \`/api/users/\${userId}/exercises\`;
            }
          </script>
        </div>
      </body>
    </html>
  `;

  res.send(html);
});

// Eliminar usuario (opcional)
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const userIndex = users.findIndex(user => user._id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.json({ message: 'User deleted successfully' });
});

// Iniciar servidor
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
