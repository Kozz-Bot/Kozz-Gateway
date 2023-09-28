const fs = require('fs');
const crypto = require('crypto');

const boundaryName = process.argv[2];
if (!boundaryName) {
	console.error('Boundary name not provided');
	process.exit(1);
}

const payload = {
	OS: 'windows',
	platform: 'WA',
	name: boundaryName,
	role: 'boundary',
};

let privateKey;

try {
	privateKey = fs.readFileSync('./keys/privatekey.pem', {
		encoding: 'utf-8',
	});
} catch (e) {
	console.error(
		'Please generate a keypair and leave the name of the private key as it is'
	);
	process.exit(1);
}

const signature = crypto.sign(
	'sha256',
	Buffer.from(JSON.stringify(payload, undefined, '  ')),
	{ key: privateKey, padding: crypto.constants.RSA_PKCS1_PSS_PADDING }
);

console.log('This is the payload you have to paste on postman');
console.log(
	JSON.stringify(
		{
			...payload,
			signature: signature.toString('base64'),
		},
		undefined,
		'  '
	)
);

process.exit(0);
