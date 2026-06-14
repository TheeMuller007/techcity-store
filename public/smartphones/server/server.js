import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch'; // or native fetch in Node 20+

const app = express();
app.use(bodyParser.json());

const PAYNOW_INTEGRATOR_ID = 'YOUR_INTEGRATOR_ID';
const PAYNOW_KEY = 'YOUR_INTEGRATOR_KEY';
const PAYNOW_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';

app.post('/create-payment', async (req, res) => {
    const { total, email } = req.body;

    // Build PayNow payload
    const payload = new URLSearchParams();
    payload.append('amount', total.toFixed(2));
    payload.append('reference', 'ORDER-' + Date.now());
    payload.append('returnUrl', 'http://localhost:3000/payment-success'); // Redirect after payment
    payload.append('resultUrl', 'http://localhost:3000/payment-result'); // PayNow result webhook
    payload.append('id', PAYNOW_INTEGRATOR_ID);
    payload.append('additionalInfo', 'Tech City Order');
    payload.append('authemail', email); // Optional

    // Generate a hash (security) if needed
    // payload.append('hash', ...); // Refer to PayNow docs

    try {
        const response = await fetch(PAYNOW_URL, {
            method: 'POST',
            body: payload
        });
        const data = await response.text();

        // PayNow returns a redirect URL
        res.json({ paynowUrl: data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
e