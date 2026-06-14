async function testLoginRole() {
  console.log('Testing Login API for role data...');
  const testEmail = `verify_${Date.now()}@example.com`;
  const testUser = `verifier_${Date.now()}`;
  const testPass = 'securepassword123';

  try {
    // 1. Register first
    await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'Test Role', email: testEmail, username: testUser, password: testPass })
    });

    // 2. Login and check response
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPass })
    });

    const data = await response.json();
    if (response.ok) {
        console.log('✅ Login API Success.');
        console.log('User Role received:', data.user ? data.user.role : 'NULL');
        if (data.user && data.user.role === 'user') {
            console.log('✅ Role verification PASSED.');
        } else {
            console.error('❌ Role verification FAILED.');
        }
    } else {
      console.error('❌ Login API Failed:', data.message);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testLoginRole();
