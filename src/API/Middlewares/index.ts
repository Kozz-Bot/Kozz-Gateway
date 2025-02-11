import { RequestHandler } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

const apiKeyFilePath = './keys/api_key.txt';

export const checkApiKey: RequestHandler = async (req, res, next) => {
	try {
		const data = await fs.readFile(apiKeyFilePath, 'utf8');
		const fileApiKey = data.trim();
		const requestApiKey = req.headers['api_key'];

		if (fileApiKey === requestApiKey) {
			next();
		} else {
			res.status(403).send({ error: 'Invalid API Key' });
		}
	} catch (err) {
		res.status(500).send({ error: 'Server error: ' + `${err}` });
		console.error('Error reading the file:', err);
	}
};
