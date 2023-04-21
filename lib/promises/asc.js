const crypto = require('crypto');

const key = Buffer.from('xNRxA48aNYd33PXaODSutRNFyCu4cAe/InKT/Rx+bw0=', 'base64');
const iv = Buffer.from('81dFxOpX7BPG1UpZQPcS6w==', 'base64');

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = cipher.update(text, 'utf8', 'base64') + cipher.final('base64');
    return encrypted;
}

function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    const decrypted = decipher.update(encrypted, 'base64', 'utf8') //+ decipher.final('utf8');
    return decrypted;
}

function execa(params) {
    const str = encrypt('smg -garmin')
    console.log(str);
    console.log(decrypt(str));
}
module.exports = {
    encrypt,
    decrypt,
    execa
}