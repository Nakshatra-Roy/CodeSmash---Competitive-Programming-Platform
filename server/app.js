const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const problemRoutes = require('./routes/problemRoutes');
const contestRoutes = require('./routes/contestRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

app.use('/api/problems', problemRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/submissions', submissionRoutes);

module.exports = app;