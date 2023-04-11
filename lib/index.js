// 其他 ES6 模块的代码在这里
const inquirer = require('inquirer');

const GITHUB_URLS = [
    "alive.github.com",
    "api.github.com",
    "assets-cdn.github.com",
    "avatars.githubusercontent.com",
    "avatars0.githubusercontent.com",
    "avatars1.githubusercontent.com",
    "avatars2.githubusercontent.com",
    "avatars3.githubusercontent.com",
    "avatars4.githubusercontent.com",
    "avatars5.githubusercontent.com",
    "camo.githubusercontent.com",
    "central.github.com",
    "cloud.githubusercontent.com",
    "codeload.github.com",
    "collector.github.com",
    "desktop.githubusercontent.com",
    "favicons.githubusercontent.com",
    "gist.github.com",
    "github-cloud.s3.amazonaws.com",
    "github-com.s3.amazonaws.com",
    "github-production-release-asset-2e65be.s3.amazonaws.com",
    "github-production-repository-file-5c1aeb.s3.amazonaws.com",
    "github-production-user-asset-6210df.s3.amazonaws.com",
    "github.blog",
    "github.com",
    "github.community",
    "github.githubassets.com",
    "github.global.ssl.fastly.net",
    "github.io",
    "github.map.fastly.net",
    "githubstatus.com",
    "live.github.com",
    "media.githubusercontent.com",
    "objects.githubusercontent.com",
    "pipelines.actions.githubusercontent.com",
    "raw.githubusercontent.com",
    "user-images.githubusercontent.com",
    "vscode.dev",
    "education.github.com",
]
const QUESTIONS = [{
        type: 'list',
        name: 'projectType',
        message: '请选择项目类型:',
        choices: ['Web', 'Mobile', 'Desktop'],
    },
    {
        type: 'confirm',
        name: 'useRouter',
        message: '是否使用路由功能?',
        default: false,
    },
];

function execDeploy() {
    inquirer.prompt(QUESTIONS).then(answers => {
        console.log('Answers:', answers);
    });
}
module.exports = {
    execDeploy
}