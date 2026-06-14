async function testUsernameLogin() {
  console.log('Testing Login API with username field...');
  const testEmail = `login_test_${Date.now()}@example.com`;
  const testUser = `user_${Date.now()}`;
  const testPass = 'securepassword123';

  try {
    // 1. Register first
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Login Test', email: testEmail, username: testUser, password: testPass })
    });
    console.log('Registered successfully.');

    // 2. Login using username field
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: testUser, password: testPass })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('✅ Login with username SUCCESS.');
        console.log('User Role:', data.user.role);
    } else {
      console.error('❌ Login failed:', data.message);
    }
    
    // 3. Login using email field (backwards compatibility)
    const response2 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });
    
    if (response2.ok) {
        console.log('✅ Login with email SUCCESS.');
    } else {
        console.error('❌ Login with email failed.');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testUsernameLogin();
