const http = require('http');

function testLogin() {
  const postData = JSON.stringify({
    email: 'test@papaya.edu',
    password: 'teacher123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/portal/auth/teacher/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    console.log(`📋 Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Response Body:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Parsed Response:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('❌ Failed to parse JSON');
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request failed: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('🔧 Testing login API...');
testLogin();
