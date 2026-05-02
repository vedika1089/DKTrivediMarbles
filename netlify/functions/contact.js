const https = require('https');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    body.access_key = process.env.WEB3FORMS_KEY;
    const payload = JSON.stringify(body);

    console.log('Key present:', !!process.env.WEB3FORMS_KEY);
    console.log('Key value starts with:', process.env.WEB3FORMS_KEY ? process.env.WEB3FORMS_KEY.substring(0,8) : 'MISSING');

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.web3forms.com',
        path: '/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('Web3Forms response:', data);
          resolve(JSON.parse(data));
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message })
    };
  }
};
