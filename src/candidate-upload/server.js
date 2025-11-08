const express = require('express');
const { connectDB } = require('./db');
const candidateRouter = require('./routes/candidate');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

app.use('/api/candidates', candidateRouter);


app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(500).send('index.html not found. Check filename and folder.');
  }
});

app.use((req, res) => {
  res.status(404).send('Page not found');
});

const startServer = async () => {
  try {
    await connectDB();
    console.log('Database connected, starting server...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
