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
const chalk = require('chalk');
const {
    GITHUB_URLS
} = require('.');

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
function put(ips) {
    const rl = readline.createInterface({
        input: fs.createReadStream(hostsPath),
        crlfDelay: Infinity
    });

    const lines = []
    rl.on('line', (line) => {
        lines.push(line)
    });

    rl.on('close', () => {
        for (const url in ips) {
            const ip = ips[url]
            if (!url) {
                continue
            }

            const index = lines.findIndex((v) => (new RegExp(` ${url}$`).test(v)))
            // 存在
            if (index !== -1) {
                const line = lines[index]
                // ip是否变化
                if (line.includes(`${ip} `)) {
                    const match = line.match(ipRegex);
                    if (match) {
                        const curip = match[0];
                        if (ip !== curip) {
                            lines[index].replace(curip, ip)
                            return
                        }
                    }

                }
            } else { // 不存在
                lines.push(`${ip} ${url}`)
            }
        }
        const command = `node ${rootPath}/lib/promises/write_hosts_put ${hostsPath} ${encrypt(lines.join('\n'))}`
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
                        put({
                            [domains]: ip,
                        })
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
    const url = `https://sites.ipaddress.com/${addr}`
    return new Promise((resolve, reject) => {
        try {
            axios.get(url).then(response=>{
                // 将响应的HTML内容传递给cheerio.load方法
                const $ = cheerio.load(response.data);
                // 获取所有class为"separated2"的元素，并提取它们的文本
                const str = $('#tabpanel-dns-a').text()
                const regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/; // IP 地址的正则表达式
                const match = str.match(regex);
                if (match) {
                    const ipAddress = match[0];
                    resolve(ipAddress)
                } else {
                    reject("未找到 IP 地址")
                }
            }).catch(err=>{
                reject(err)
            })
        } catch (error) {
            reject(error)
        }
    })

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


async function githubPush() {
    const ipsPromise = []
    for (const url of GITHUB_URLS) {
        const promise  = getIp(url)
        ipsPromise.push(promise)
    }

   await Promise.all(ipsPromise).then(ips=>{
       log.info(ips)
       put(ips)
    }).catch(err=>{
       log.error("错误：",err)
       console.log(err)
   })
}

module.exports = {
    put,
    getIp,
    chooseList,
    deleteRecord,
    getHosts,
    githubPush
}
