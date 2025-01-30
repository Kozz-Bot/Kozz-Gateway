const fs = require('fs');
const crypto = require('crypto');

const moduleName = process.argv[2];
if (!moduleName) {
	console.error('handler name not provided');
	process.exit(1);
}

const payload = {
	// If you are signing a command handler, insert the command names in the array;
	methods: [],
	name: moduleName,
	role: 'module',
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

console.log({
	...payload,
	signature: signature.toString('base64'),
});

process.exit(0);
