const fs = require('fs');
const os = require('os');
const log = require("./logs")
const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');
const readline = require('readline');
const inquirer = require('inquirer');
const sudo = require('sudo-prompt');
const path = require('path');
const {
    encrypt,
    execa
} = require('./promises/asc');


const {
    exec,
    spawn
} = require('child_process');
const chalk = require('chalk')

let hostsPath = ''

if (os.platform() === 'win32') {
    hostsPath = 'C:/Windows/System32/drivers/etc/hosts'
} else {
    hostsPath = '/etc/hosts'
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
        input: fs.createReadStream(hostsPath),
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
        if (newLins.length <= 0) {
            newLins.push(`${ip} ${url}`)
            urlState = 'Create'
        }

        const command = `node ${rootPath}/lib/promises/write_hosts_put ${hostsPath} ${encrypt(newLins.join('\n'))} "${urlState}: ${ip} - ${url}"`
        sudo.exec(command, {
            name: 'ehosts',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log(stdout);
        });
    });
}


function getHosts() {
    return new Promise((resolve, reject) => {
        const newLins = []
        const rl = readline.createInterface({
            input: fs.createReadStream(hostsPath),
            crlfDelay: Infinity
        });

        let urlState = null
        rl.on('line', (line) => {
            if (ipRegex.test(line)) {
                newLins.push(line)
            }
        });

        rl.on('close', () => {
            reject(newLins)
        })
    })
}

function chooseList() {

    const newLins = []
    const rl = readline.createInterface({
        input: fs.createReadStream(hostsPath),
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
                choices: ['update', 'delate', 'comment'],
            },
        ];

        inquirer.prompt(QUESTIONS).then(answers => {
            const {
                record,
                type
            } = answers
            const regex = /([a-z0-9]+\.)*[a-z0-9]+\.[a-z]{2,}/i;
            const [domains] = record.match(regex);
            switch (type) {
                case "update":
                    getIp(domains).then(ip => {
                        put(ip, domains)
                    })
                    break;
                case "delate":
                    deleteRecord(domains)
                    break;
                case "comment":
                    console.log(chalk.green('暂无该功能 哈哈'));
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
const rootPath = path.join(__dirname, '../').split(path.sep).join('//')

function deleteRecord(domain) {
    const newLins = []
    const rl = readline.createInterface({
        input: fs.createReadStream(hostsPath),
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        if (ipRegex.test(line)) {
            newLins.push(line)
        }
    });

    rl.on('close', () => {
        const index = newLins.findIndex((line) => line.includes(domain))
        if (index === -1) {
            log.warn('del', "记录不存在")
            return
        }
        log.warn('del', domain)

        newLins.splice(index, 1)
        const command = `node ${rootPath}/lib/promises/write_hosts_del ${hostsPath} ${encrypt(newLins.join('\n'))}`
        sudo.exec(command, {
            name: 'ehosts',
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(error);
                return;
            }
            console.log(stdout);
        });
    });
}



module.exports = {
    put,
    getIp,
    chooseList,
    deleteRecord,
    getHosts
}