const { spawn } = require('child_process');

console.log('🚀 Starting Smart SQL Chatbot System...\n');

// Start servers
const mcpServer = spawn('node', ['mcp-server/index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

const chatbotServer = spawn('node', ['chatbot/index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  mcpServer.kill('SIGINT');
  chatbotServer.kill('SIGINT');
  setTimeout(() => {
    console.log('✅ All servers stopped');
    process.exit(0);
  }, 1000);
});

console.log('📋 System Information:');
console.log('   • MCP Server: http://localhost:3001');
console.log('   • Chatbot UI: http://localhost:3000');
console.log('\n💡 Press Ctrl+C to stop all servers'); 