require('dotenv').config();
const express = require('express');
const cors = require('cors');

const corsOptions    = require('./src/config/corsOption');
const routes         = require('./src/routes');
const logger         = require('./src/middleware/logger');
const errorHandler   = require('./src/middleware/errorHandler');
const { apiLimiter } = require('./src/middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Core middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);           // logs every request with colour + timing

//  Rate limiting
app.use('/api', apiLimiter);   // 200 req/min per IP globally

//  Routes
app.use('/api', routes);

//  Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

//  404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

//  Global error handler (must be last) 
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\x1b[32m✔ ShopMasti server running on port ${PORT}\x1b[0m`);
});
