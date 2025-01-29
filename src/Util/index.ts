import crypto from 'crypto';
import fs from 'fs';

export const verifyPayload = (payload: Record<string, any>, signature?: string) => {
	if (!signature) {
		return false;
	}

	let publicKey: string | undefined;
	try {
		publicKey = fs.readFileSync('./keys/publickey.pem', { encoding: 'utf-8' });
	} catch (e) {
		throw 'Please generate a keypair using the script in the project "kozz-handler-maker" and copy the publickey to "keys/publickey.pem". Leve the key name as it is';
	}

	const isVerified = crypto.verify(
		'sha256',
		Buffer.from(JSON.stringify(payload, undefined, '  ')),
		{
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
		},
		Buffer.from(signature, 'base64')
	);

	return isVerified;
};

type SignaturelessPayload<Payload extends Record<string, any>> = {
	[key in keyof Payload]: key extends 'signature' ? never : Payload[key];
};

export const removeSignatureFromPayload = <T extends Record<string, any>>(
	payload: T
): SignaturelessPayload<T> => {
	return Object.entries(payload).reduce((payload, [key, value]) => {
		if (key === 'signature') {
			return payload;
		}
		return {
			...payload,
			[key]: value,
		};
	}, {} as T);
};

export function normalizeString(string: string) {
	return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export const timedDelay=(timeJson:{hours?:number,minutes?:number,seconds?:number,miliseconds?:number})=>{

	const factor= {
        hour:3600000,
        minute:60000,
        second:1000,
        milisecond:1
    }
	const delayMilisec = factor.hour*(timeJson.hours ? timeJson.hours:0)
                        + factor.minute*(timeJson.minutes ? timeJson.minutes:0)
                        + factor.second*(timeJson.seconds ? timeJson.seconds:0)
                        + factor.milisecond*(timeJson.miliseconds ? timeJson.miliseconds:0);

	setTimeout(()=>{process.exit(0);}, delayMilisec)
}

export const delay = (miliseconds: number,description?:string) =>{
	return new Promise( resolve => {
	  setTimeout(resolve, miliseconds);
		
	} );
}