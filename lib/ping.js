const os = require("os")
const log = require("npmlog")
const iconv = require('iconv-lite');
const {
    spawn
} = require('child_process');

function average(arr) {
    const total = arr.reduce((a, b) => a + b, 0);
    return total / arr.length;
}

function execute(domain) {
    const ping = spawn('ping', [domain]);
    let count = 0
    console.log(`正在ping ${domain}`);
    log.enableProgress();
    const tracker = log.newItem('progress', 0)
    // 设置进度条总长度
    tracker.total = 5;
    const bytes =[],times=[],ttls = []
    let ip = null
    ping.stdout.on('data', (data) => {
        const str = iconv.decode(data, 'cp936');
        let byte,time,ttl;
        if (os.platform() === 'win32') {
            const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
            const byteRegex = /字节=(\d+)/;
            const timeRegex = /时间=(\d+)ms/;
            const ttlRegex = /TTL=(\d+)/;

            if (!str.includes("来自")) {
                return
            }
            ip = str.match(ipRegex)[0];
            byte = parseInt(str.match(byteRegex)[1]);
            time = parseInt(str.match(timeRegex)[1]);
            ttl = parseInt(str.match(ttlRegex)[1]);
        } else {
            const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
            const byteRegex = /^(\d+)\s+bytes/;
            const timeRegex = /time=([\d.]+)\s*ms/;
            const ttlRegex = /ttl=(\d+)/;
            if (!str.includes("bytes from") || str.includes('bytes of data')) {
                return
            }
            ip = str.match(ipRegex)[0];
            byte = parseInt(str.match(byteRegex)[1]);
            time = parseFloat(str.match(timeRegex)[1]);
            ttl = parseInt(str.match(ttlRegex)[1]);
        }
        bytes.push(byte)
        times.push(time)
        ttls.push(ttl)

        log.silly('progress', count);
        if (count === 5) {
            ping.kill()
        }
        count++
        // 更新进度条
        tracker.addWork(count);
    });

    ping.stderr.on('data', (data) => {
        log.silly('stdout', data);
    });

    ping.on('close', (code) => {
        log.info(ip)
        console.table({ '字节':average(bytes), '耗时':average(times), 'ttl':average(ttls) })
        tracker.finish()
    });
}

module.exports = {
    execute
}
