const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const DB_PATH = './database/sales.db';
let db = null;

// Initialize database connection
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err.message);
        db = null;
      } else {
        console.log('Connected to SQLite database');
      }
    });
  }
  return db;
}

// Query validation
function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query must be a non-empty string' };
  }
  
  if (query.length > 10000) {
    return { valid: false, error: 'Query too long. Maximum 10000 characters allowed.' };
  }
  
  // Prevent dangerous operations
  const dangerousKeywords = [
    'DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE', 
    'ATTACH', 'DETACH', 'VACUUM', 'PRAGMA'
  ];
  
  const upperQuery = query.toUpperCase();
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return { valid: false, error: `Query contains forbidden keyword: ${keyword}` };
    }
  }
  
  // Ensure it's a SELECT query
  if (!upperQuery.trim().startsWith('SELECT')) {
    return { valid: false, error: 'Only SELECT queries are allowed' };
  }
  
  return { valid: true };
}

app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
  const database = getDatabase();
  if (!database) {
    return res.status(503).json({ status: 'unhealthy', error: 'Database not connected' });
  }
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

app.post('/mcp/executeQuery', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }
  
  const validation = validateQuery(query);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  
  const database = getDatabase();
  if (!database) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  
  database.all(query, [], (err, rows) => {
    if (err) {
      console.error('Query execution error:', err.message);
      return res.status(500).json({ 
        error: 'Database query failed',
        details: err.message 
      });
    }
    
    // Limit results to prevent memory issues
    if (rows && rows.length > 1000) {
      rows = rows.slice(0, 1000);
    }
    
    res.json({ 
      results: rows || [],
      count: rows ? rows.length : 0,
      truncated: rows && rows.length >= 1000
    });
  });
});

app.get('/mcp/schema', (req, res) => {
  const database = getDatabase();
  if (!database) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  
  const query = "SELECT name, sql FROM sqlite_master WHERE type='table'";
  
  database.all(query, [], (err, rows) => {
    if (err) {
      console.error('Schema fetch error:', err.message);
      return res.status(500).json({ 
        error: 'Failed to fetch schema',
        details: err.message 
      });
    }
    
    res.json({ 
      schema: rows || [],
      timestamp: new Date().toISOString()
    });
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down MCP server...');
  if (db) {
    db.close();
  }
  process.exit(0);
});

app.listen(3001, () => {
  console.log('MCP server started on port 3001');
});
