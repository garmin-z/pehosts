const log = require('npmlog');
const fs = require('fs');
const path = require('path');
var chalk = require('chalk')

function date(timestamp, symbol = '') {
    // 根据时间戳生成日期对象
    const date = new Date(timestamp);
    // 格式化日期字符串为 2023-04-21
    return `${date.getFullYear()}${symbol}${String(date.getMonth() + 1).padStart(2, '0')}${symbol}${String(date.getDate()).padStart(2, '0')}`;
}
// 创建一个可写流，将日志输出到文件中
const logFile = path.join(__dirname, '../logs/' + date(Date.now()) + '_log.txt');
const logStream = fs.createWriteStream(logFile, {
    flags: 'a'
});

log.stream = logStream;

class log_record {
    static info(prefix = '', message = '', ...args) {
        console.log(`${chalk.blue('info')} ${prefix ? chalk.magenta(prefix)+' ' : ' '}${message} ${args ? args.join(' ') : ''}`);
        log.info(...arguments)
    }

    static success(prefix, message, ...args) {
        console.log(`${chalk.green('success')} ${prefix ? chalk.magenta(prefix)+' ' : ' '}${message} ${args ? args.join(' ') : ''}`);
        log.info(...arguments)
    }

    static warn(prefix, message, ...args) {
        console.log(`${chalk.yellow('WARN')} ${prefix ? chalk.magenta(prefix)+' ' : ' '}${message} ${args ? args.join(' ') : ''}`);
        log.warn(...arguments)
    }

    static error(prefix, message, ...args) {
        console.log(`${chalk.red('ERR!')} ${prefix ? chalk.magenta(prefix)+' ' : ' '}${message} ${args ? args.join(' ') : ''}`);
        log.error(...arguments)
    }
}
log_record.file = log

module.exports = log_record