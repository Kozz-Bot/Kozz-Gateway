const crypto = require('crypto');
const fs = require('fs');

const name = process.argv[2] || 'kozz-gw-panel';
const keyPath = process.argv[3] || './keys/privatekey.pem';

const payload = {
	aliases: [],
	methods: [],
	name,
	role: 'handler',
};

const privateKey = fs.readFileSync(keyPath, 'utf-8');
const signature = crypto
	.sign('sha256', Buffer.from(JSON.stringify(payload, undefined, '  ')), {
		key: privateKey,
		padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
	})
	.toString('base64');

console.log(
	JSON.stringify(
		{
			payload,
			signature,
		},
		undefined,
		2
	)
);
