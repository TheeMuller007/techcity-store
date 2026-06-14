const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret');
console.log('Token:', token);

const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/admin/users-full', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Status:', res.status);
        if (res.ok) {
            const data = await res.json();
            console.log('Users:', data.length);
        } else {
            const text = await res.text();
            console.log('Error:', text);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
