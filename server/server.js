const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const authenticateUser = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  req.userId = parseInt(userId);
  next();
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    ).run(name, email, hashedPassword);

    res.status(201).json({
      id: result.lastInsertRowid,
      name,
      email
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/teams', authenticateUser, (req, res) => {
  try {
    const teams = db.prepare(
      'SELECT * FROM teams WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.userId);
    res.json(teams);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/teams', authenticateUser, (req, res) => {
  try {
    const { name, logo } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del equipo es requerido' });
    }

    const result = db.prepare(
      'INSERT INTO teams (user_id, name, logo) VALUES (?, ?, ?)'
    ).run(req.userId, name, logo || null);

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(team);
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.put('/api/teams/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo } = req.body;

    const team = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    db.prepare('UPDATE teams SET name = ?, logo = ? WHERE id = ?').run(name, logo || null, id);

    if (logo !== undefined) {
      db.prepare('UPDATE players SET team_name = ? WHERE team_id = ?').run(name, id);
    }

    const updatedTeam = db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
    res.json(updatedTeam);
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.delete('/api/teams/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;

    const team = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    db.prepare('DELETE FROM players WHERE team_id = ?').run(id);
    db.prepare('DELETE FROM teams WHERE id = ?').run(id);

    res.json({ message: 'Equipo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.get('/api/players', authenticateUser, (req, res) => {
  try {
    const players = db.prepare(
      'SELECT * FROM players WHERE user_id = ? ORDER BY created_at DESC'
    ).all(req.userId);
    res.json(players);
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.post('/api/players', authenticateUser, (req, res) => {
  try {
    const { name, age, position, teamId, teamName, image } = req.body;

    if (!name || !age || !position || !teamId || !teamName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(teamId, req.userId);
    if (!team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const result = db.prepare(
      'INSERT INTO players (user_id, team_id, name, age, position, image, team_name) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.userId, teamId, name, age, position, image || null, teamName);

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(player);
  } catch (error) {
    console.error('Error al crear jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.put('/api/players/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, position, teamId, teamName, image } = req.body;

    const player = db.prepare('SELECT * FROM players WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    db.prepare(
      'UPDATE players SET name = ?, age = ?, position = ?, team_id = ?, team_name = ?, image = ? WHERE id = ?'
    ).run(name, age, position, teamId, teamName, image || null, id);

    const updatedPlayer = db.prepare('SELECT * FROM players WHERE id = ?').get(id);
    res.json(updatedPlayer);
  } catch (error) {
    console.error('Error al actualizar jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.delete('/api/players/:id', authenticateUser, (req, res) => {
  try {
    const { id } = req.params;

    const player = db.prepare('SELECT * FROM players WHERE id = ? AND user_id = ?').get(id, req.userId);
    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    db.prepare('DELETE FROM players WHERE id = ?').run(id);
    res.json({ message: 'Jugador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar jugador:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
