const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('BODY START:');
        console.log(data.substring(0, 200));
        console.log('BODY END');
    });
});

req.on('error', (e) => {
    console.log('Error:', e.message);
});

req.end();
