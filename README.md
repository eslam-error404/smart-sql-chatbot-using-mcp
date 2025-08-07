# Smart SQL Chatbot - Simplified

A simple and efficient SQL chatbot that uses Ollama for natural language processing and SQLite for data storage. This project demonstrates how to build a conversational AI interface for database queries.

## 🚀 Features

- **Natural Language to SQL**: Convert plain English questions to SQL queries
- **Sales Data Analysis**: Query and analyze sales data with conversational interface
- **Ollama Integration**: Uses local Ollama model for AI responses
- **Simple Architecture**: Clean, minimal codebase with high performance
- **Real-time Processing**: Fast response times with optimized queries
- **Error Handling**: Graceful fallbacks and validation

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running locally
3. **Phi3:mini model** downloaded in Ollama

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone [<your-repository-url>](https://github.com/eslam-error404/smart-sql-chatbot-using-mcp)
cd chatbot-sql-mcp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Ollama
```bash
# Start Ollama (if not already running)
ollama serve

# Download the required model
ollama pull phi3:mini
```

### 4. Start the Application
```bash
npm start
```

### 5. Open in Browser
Navigate to: `http://localhost:3000`

## 🎯 Usage

### Example Queries

Try asking questions about your sales data in natural language:

- "Show me all sales data"
- "What's the total revenue?"
- "Find the highest sale"
- "How many sales records do we have?"
- "What products did we sell?"
- "Show me sales from last month"

### How It Works

1. **User Input**: Type your question in natural language
2. **AI Processing**: Ollama converts your question to SQL
3. **Database Query**: SQL is executed against the sales database
4. **Response Generation**: AI creates a natural language response with the data
5. **Display**: You see the answer in a conversational format

## 🏗️ Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Chatbot Server │    │   MCP Server    │
│   (Port 3000)   │◄──►│   (Port 3000)   │◄──►│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Ollama API    │    │   SQLite DB     │
                       │  (Port 11434)   │    │  (sales.db)     │
                       └─────────────────┘    └─────────────────┘
```

### File Structure

```
chatbot-sql-mcp/
├── chatbot/
│   ├── index.js          # Main chatbot server
│   └── views/
│       └── index.html    # User interface
├── mcp-server/
│   └── index.js          # Database operations server
├── database/
│   ├── sales.db          # SQLite database
│   └── init.sql          # Database schema
├── api-config.js         # Ollama configuration
├── start.js              # Application launcher
├── package.json          # Dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Ollama Settings

Edit `api-config.js` to modify Ollama settings:

```javascript
const API_CONFIG = {
  ollama: {
    baseURL: 'http://localhost:11434',
    model: 'phi3:mini',
    maxTokens: 100,
    temperature: 0.1
  }
};
```

### Database Schema

The application uses a simple SQLite database with a `sales` table:

```sql
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    sale_date DATE NOT NULL,
    sales_amount REAL NOT NULL
);
```

Sample data is included in `database/init.sql`.

## 🚀 Performance Optimizations

This simplified version includes several optimizations:

- **Simplified Architecture**: Removed unnecessary complexity
- **Direct Database Connection**: No connection pooling overhead
- **Minimal Validation**: Essential checks only
- **Streamlined Frontend**: Removed animations and complex styling
- **Efficient Error Handling**: Graceful fallbacks without user-facing errors

## 🛡️ Security Features

- **SQL Injection Protection**: Blocks dangerous keywords
- **Input Validation**: Sanitizes all user inputs
- **Query Restrictions**: Only SELECT queries allowed
- **Error Boundaries**: Prevents system crashes

## 🔍 Troubleshooting

### Common Issues

1. **Ollama not running**
   ```bash
   ollama serve
   ```

2. **Model not found**
   ```bash
   ollama pull phi3:mini
   ```

3. **Port conflicts**
   - Ensure ports 3000 and 3001 are available
   - Check if other applications are using these ports

4. **Database connection issues**
   - Verify `database/sales.db` exists
   - Check file permissions

### Health Checks

- **Chatbot Server**: `http://localhost:3000/health`
- **MCP Server**: `http://localhost:3001/health`
- **Ollama**: `http://localhost:11434/api/tags`

## 🧪 Testing

### Manual Testing

1. Start the application: `npm start`
2. Open browser: `http://localhost:3000`
3. Try these test queries:
   - "Hello" (greeting test)
   - "Show me all sales" (data query test)
   - "What's the total revenue?" (aggregation test)

### API Testing

Test the chatbot API directly:

```bash
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"userQuery": "What is the total revenue?"}'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Ollama** for providing local AI capabilities
- **SQLite** for lightweight database management
- **Express.js** for the web framework
- **Tailwind CSS** for the user interface

---

**Built with ❤️ for reliable, fast, and user-friendly SQL chatbot interactions.** 
