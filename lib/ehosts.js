const fs = require('fs');
const os = require('os');
const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');
const readline = require('readline');
const inquirer = require('inquirer');
const sudo = require('sudo-prompt');

const {
    exec,
    spawn
} = require('child_process');
const chalk = require('chalk')

let path = ''

if (os.platform() === 'win32') {
    path = 'C:/Windows/System32/drivers/etc/hosts'
} else {
    path = '/etc/hosts'
}
const ipRegex = /^(\d{1,3}\.){3}\d{1,3}/; // 匹配IP地址的正则表达式

/**
 * 写入hosts文件
 * @param {string} ip 
 * @param {string} url 
 */
function put(ip, url) {

    const newLins = []
    const rl = readline.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity
    });


    let urlState = null
    rl.on('line', (line) => {
        if (ipRegex.test(line) && !urlState) {
            const match = line.match(ipRegex);
            // 判断域名是否存在
            if (line.includes(url) && match) {
                const curip = match[0];
                if (ip !== curip) {
                    newLins.push(`${ip} ${url}`)
                    urlState = 'Modify'
                    return
                }
                urlState = 'Normal'
            } else {
                urlState = 'Create'
                newLins.push(`${ip} ${url}`)
            }
        }
        newLins.push(line)
    });

    rl.on('close', () => {
        fs.writeFile(path, newLins.join('\n'), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(chalk.bgGreen(`Success - ${urlState}: ${ip} - ${url}`));
        });
    });
}

function chooseList() {

    const newLins = []
    const rl = readline.createInterface({
        input: fs.createReadStream(path),
        crlfDelay: Infinity
    });

    let urlState = null
    rl.on('line', (line) => {
        if (ipRegex.test(line)) {
            newLins.push(line)
        }
    });

    rl.on('close', () => {

        const QUESTIONS = [{
                type: 'list',
                name: 'record',
                message: '请选择一条记录:',
                choices: newLins,
            },
            {
                type: 'list',
                name: 'type',
                message: '请选择操作:',
                choices: ['update', 'delate'],
            },
        ];

        inquirer.prompt(QUESTIONS).then(answers => {
            const {
                record,
                type
            } = answers

            switch (type) {
                case "update":
                    const regex = /([\w-]+\.)+[\w-]+(?=#|$)/g;
                    const [domains] = record.match(regex);
                    sudo.exec(`ehosts -i ${domains}`, {
                        name: 'ehosts',
                    }, (error, stdout, stderr) => {
                        if (error) {
                            console.error(error);
                            return;
                        }
                        console.log(stdout);
                    });
                    break;
                case "delate":
                    console.log(chalk.blue('暂无该功能 哈哈'));
                    break;
                default:
                    break;
            }

        });
    });
}

/**
 * 获取可以访问的ip
 * @param {string} addr 
 * @returns 
 */
async function getIp(addr) {
    const url = `https://www.ipaddress.com/site/${addr}`

    try {
        const response = await axios.get(url)
        // 将响应的HTML内容传递给cheerio.load方法
        const $ = cheerio.load(response.data);
        // 获取所有class为"separated2"的元素，并提取它们的文本
        let sip = ''
        $('.separated2 li').each((i, el) => {
            const txt = $(el).text().trim()
            if (ipRegex.test(txt)) {
                sip = txt
                return
            }
            return
        });

        return sip
    } catch (error) {
        return null
    }
}


function ping(domain) {
    const ping = spawn('ping', [domain]);

    let i = 0;

    const spinner = ['/', '-', '\\', '|'];
    const interval = setInterval(() => {
        i = (i + 1) % spinner.length;
        process.stdout.write('\r' + spinner[i] + ' ');
    }, 50);

    let d = null
    ping.stdout.on('data', (data) => {
        d = data
        // console.log(`输出：${data}`);
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
    put,
    getIp,
    ping,
    chooseList
}