const os = require("os")
const {
    spawn
} = require('child_process');

function execute(domain) {
    const ping = spawn('ping', [domain]);

    let i = 0;

    const spinner = ['/', '-', '\\', '|'];
    const interval = setInterval(() => {
        i = (i + 1) % spinner.length;
        process.stdout.write('\r' + spinner[i] + ' ');
    }, 50);

    let d = null

    let count = 0
    ping.stdout.on('data', (data) => {
        if (os.platform() === 'win32') {

        }
        console.log(`${data}`);
        if (count === 5) {
            ping.kill()
        }
        count++
        // d = data
    });

    ping.stderr.on('data', (data) => {
        console.error(`${data}`);
    });

    ping.on('close', (code) => {
        process.stdout.write('\r');

        console.log(`${d}`);
        clearInterval(interval);
    });
}

module.exports = {
    execute
}