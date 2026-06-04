const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Helpers ─────────────────────────────────────────────────
function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function generateId(activities) {
  if (activities.length === 0) return 1;
  return Math.max(...activities.map((a) => a.id)) + 1;
}

// ─── Routes ──────────────────────────────────────────────────

// GET / — health check
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API is running 🚀',
    endpoints: {
      'GET    /activities':     'List all (filter by ?type, ?status, ?date)',
      'GET    /activities/:id': 'Get one by ID',
      'POST   /activities':     'Create new activity',
      'PUT    /activities/:id': 'Update activity',
      'DELETE /activities/:id': 'Delete activity',
    },
  });
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// GET /activities
app.get('/activities', (req, res) => {
  const { type, status, date } = req.query;
  let { activities } = readData();

  if (type)   activities = activities.filter((a) => a.type === type);
  if (status) activities = activities.filter((a) => a.status === status);
  if (date)   activities = activities.filter((a) => a.date === date);

  res.json({ activities, total: activities.length });
});

// GET /activities/:id
app.get('/activities/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { activities } = readData();
  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  res.json(activity);
});

// POST /activities
app.post('/activities', (req, res) => {
  const { name, type, date } = req.body;

  if (!name || !type || !date) {
    return res.status(400).json({
      error: 'Missing required fields: name, type, date',
    });
  }

  const data = readData();

  const newActivity = {
    id: generateId(data.activities),
    name,
    type,
    status: req.body.status || 'planned',
    duration: req.body.duration || null,
    date,
    notes: req.body.notes || null,
    photo: req.body.photo || null,
    calories: req.body.calories || null,
    amount: req.body.amount || null,
    mood: req.body.mood || null,
    tags: req.body.tags || [],
  };

  data.activities.push(newActivity);
  writeData(data);

  res.status(201).json(newActivity);
});

// PUT /activities/:id
app.put('/activities/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  const index = data.activities.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  data.activities[index] = {
    ...data.activities[index],
    ...req.body,
    id,
  };

  writeData(data);
  res.json(data.activities[index]);
});

// DELETE /activities/:id
app.delete('/activities/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData();
  const index = data.activities.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  const deleted = data.activities.splice(index, 1)[0];
  writeData(data);

  res.json({ message: 'Activity deleted', activity: deleted });
});

// ─── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});