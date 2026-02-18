// Test the login API directly
async function testLoginAPI() {
  try {
    console.log('🔧 Testing Login API...');
    
    const response = await fetch('http://localhost:3001/api/portal/auth/teacher/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@papaya.edu',
        password: 'teacher123'
      }),
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Login failed');
      console.log('📊 Error response:', JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('💡 Make sure the dev server is running on http://localhost:3001');
  }
}

// Start the dev server first, then test
console.log('🚀 Starting dev server...');
const { spawn } = require('child_process');

const devServer = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

// Wait for server to start
setTimeout(() => {
  console.log('⏱️ Server should be ready, testing login...');
  testLoginAPI();
  
  // Kill the dev server after test
  setTimeout(() => {
    devServer.kill();
    console.log('🛑 Dev server stopped');
  }, 5000);
}, 10000);

devServer.stdout.on('data', (data) => {
  console.log(`📝 Server: ${data.toString().trim()}`);
});
