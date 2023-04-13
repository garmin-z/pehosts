// 其他 ES6 模块的代码在这里
const inquirer = require('inquirer');
const {
    exec,
    spawn
} = require('child_process');
const chalk = require('chalk');
const MIRROR_IMAGE = {
    'npm': "https://registry.npmjs.org/",
    "taobao": "https://registry.npm.taobao.org/", // 淘宝 NPM
    "aliyun": "https://registry.npm.aliyun.com/", // 阿里云 NPM
    'huawei': "https://mirrors.huaweicloud.com/repository/npm/", // 华为云 NPM
    "ustc": "https://mirrors.ustc.edu.cn/npm/", // 中国科技大学 NPM
    "cnpm": "https://npm.cnpmjs.org/", // 宁镜 NPM
    "npmcn": "https://registry.npm-cn.com/" // npm 中文社区 NPM
}
const QUESTIONS = [{
    type: 'input',
    name: 'mirror_name',
    message: 'Please enter the above name to set up your mirror image:',
}, ];

function choose(mirror) {
    if (mirror !== true) {

        if (!Object.keys(MIRROR_IMAGE).includes(mirror)) {
            console.log("该镜像不存在！");
            return
        }

        const addr = MIRROR_IMAGE[mirror]
        const command = `npm config set registry ${addr}`
        exec(command, () => {
            console.log(chalk.green(`    successfully set:  ${addr}`));
        })
        return
    }

    exec("npm config get registry", (error, stdout) => {
        if (error) {
            console.log(chalk.red(error.message));
            return
        }
        const listMirror = Object.keys(MIRROR_IMAGE).map((key) => {
            const val = MIRROR_IMAGE[key]
            const line = `${key} -----${"-".repeat(6 - key.length)} ${val}`
            if (val.includes(stdout.trim()) || val === stdout) {
                return chalk.green(`● ${line}`)
            }
            return `  ${line}`
        })
        process.stdout.write(listMirror.join('\n') + '\n');

        inquirer.prompt(QUESTIONS).then(answers => {
            choose(answers.mirror_name)
        });
    })

}
module.exports = {
    choose
}