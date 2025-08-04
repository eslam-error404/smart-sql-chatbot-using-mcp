const express = require('express');
const axios = require('axios');
const path = require('path');
const { callAI } = require('../api-config');
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'views')));

// Simple input validation
function validateInput(req, res, next) {
  const { userQuery } = req.body;
  
  if (!userQuery || typeof userQuery !== 'string') {
    return res.status(400).json({ error: 'Query is required and must be a string' });
  }
  
  if (userQuery.length > 500) {
    return res.status(400).json({ error: 'Query too long. Maximum 500 characters allowed.' });
  }
  
  next();
}

// SQL validation
function validateSQL(sqlQuery) {
  if (!sqlQuery || typeof sqlQuery !== 'string') {
    return { valid: false, error: 'SQL query must be a non-empty string' };
  }
  
  const upperSQL = sqlQuery.toUpperCase().trim();
  
  if (!upperSQL.includes('SELECT')) {
    return { valid: false, error: 'Query must be a SELECT statement' };
  }
  
  if (upperSQL.includes('AMOUNT') && !upperSQL.includes('SALES_AMOUNT')) {
    return { valid: false, error: 'Column name "AMOUNT" should be "SALES_AMOUNT"' };
  }
  
  if (!upperSQL.includes('FROM SALES')) {
    return { valid: false, error: 'Query must select from the "sales" table' };
  }
  
  return { valid: true, error: null };
}

// Generate SQL with AI
async function generateSQL(userQuery) {
  try {
    const prompt = `
    Convert this natural language query to SQL for a sales database.
    
    Database schema:
    - Table: sales
    - Columns: id, product_name, sale_date, sales_amount
    
    User query: "${userQuery}"
    
    Generate a valid SQL query that uses the correct column names.
    Return only the SQL query, no explanations or markdown formatting.
    `;

    let sqlQuery = await callAI(prompt);
    sqlQuery = sqlQuery.replace(/```sql\s*/gi, '').replace(/```\s*$/gi, '').trim();
    
    const validation = validateSQL(sqlQuery);
    if (!validation.valid) {
      return generateFallbackSQL(userQuery);
    }
    
    return sqlQuery;
  } catch (error) {
    console.error('AI SQL generation failed:', error.message);
    return generateFallbackSQL(userQuery);
  }
}

// Fallback SQL generation
function generateFallbackSQL(userQuery) {
  const query = userQuery.toLowerCase();
  
  if (query.includes('highest') || query.includes('max')) {
    return "SELECT * FROM sales ORDER BY sales_amount DESC LIMIT 1";
  }
  if (query.includes('total') || query.includes('sum') || query.includes('revenue')) {
    return "SELECT SUM(sales_amount) as total FROM sales";
  }
  if (query.includes('all') || query.includes('show') || query.includes('list')) {
    return "SELECT * FROM sales";
  }
  
  return "SELECT * FROM sales LIMIT 10";
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/query', validateInput, async (req, res) => {
  const { userQuery } = req.body;
  const startTime = Date.now();

  try {
    // Check if this needs SQL processing
    const query = userQuery.toLowerCase();
    const needsSQL = query.includes('highest') || query.includes('max') || 
                    query.includes('total') || query.includes('sum') || 
                    query.includes('revenue') || query.includes('sales') || 
                    query.includes('find') || query.includes('show') || 
                    query.includes('get') || query.includes('data') || 
                    query.includes('all');
    
    if (needsSQL) {
      // Generate and execute SQL
      const sqlQuery = await generateSQL(userQuery);
      
      const queryResponse = await axios.post('http://localhost:3001/mcp/executeQuery', { 
        query: sqlQuery 
      }, { timeout: 10000 });
      
      const results = queryResponse.data.results;
      
      // Generate response with data
      const analysisPrompt = `
      You are a helpful SQL assistant analyzing sales data. The user asked: "${userQuery}"
      
      Here is the sales data: ${JSON.stringify(results)}
      
      Provide a natural, conversational response that:
      1. Directly answers the user's question
      2. Mentions specific data from the results
      3. Uses a friendly, helpful tone
      4. Keeps it concise (max 100 words)
      
      Do NOT mention being an AI or your capabilities. Just answer the question naturally.
      `;
      
      const response = await callAI(analysisPrompt);
      
      const responseTime = Date.now() - startTime;
      res.json({ 
        response: response, 
        sqlQuery: sqlQuery,
        responseTime: `${responseTime}ms`,
        resultsCount: results.length
      });
      
    } else {
      // Handle greetings and general questions
      const greetingPrompt = `
      You are a helpful SQL assistant. The user said: "${userQuery}"
      
      If this is a greeting, respond naturally and warmly.
      If they're asking about your capabilities, explain you can help with sales data analysis.
      If it's a general question, answer helpfully.
      
      Keep your response friendly, natural, and conversational (max 100 words).
      Do NOT mention being an AI or your technical capabilities unless specifically asked.
      `;
      
      const response = await callAI(greetingPrompt);
      
      const responseTime = Date.now() - startTime;
      res.json({ 
        response: response, 
        sqlQuery: null,
        responseTime: `${responseTime}ms`,
        resultsCount: 0
      });
    }

  } catch (error) {
    console.error('Error processing query:', error.message);
    res.status(500).json({ 
      error: 'An error occurred while processing your request. Please try again.',
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString()
  });
});

app.listen(3000, () => {
  console.log('Chatbot server started on port 3000');
});