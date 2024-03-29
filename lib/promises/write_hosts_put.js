const log = require('../logs');
const fs = require('fs');

const {
    decrypt
} = require('./asc');


const args = process.argv
const hostsPath = args[2]
const content = decrypt(args[3]) || '';
fs.writeFile(hostsPath, content, (err) => {
    if (err) {
        console.error(err);
        return;
    }
});