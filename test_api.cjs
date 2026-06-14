async function testRegistration() {
  console.log('Testing Registration API endpoint...');
  const testPayload = {
    full_name: 'Test Verifier',
    email: `verify_${Date.now()}@example.com`,
    username: `verifier_${Date.now()}`,
    password: 'securepassword123'
  };

  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Registration API Success:', data.message);
      
      // Now test login with same credentials
      console.log('Testing Login API endpoint...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testPayload.email, password: testPayload.password })
      });
      
      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        console.log('✅ Login API Success! Token received.');
      } else {
        console.error('❌ Login API Failed:', loginData.message);
      }
    } else {
      console.error('❌ Registration API Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ Network error/Server down:', err.message);
  }
}

testRegistration();
