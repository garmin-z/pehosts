const path = require('path');

const express = require('express');
const app = express();
const {
    getIp,
    put,
    chooseList,
    getHosts,
    deleteRecord
} = require('./ehosts')

function main() {
    const cssPath = path.join(__dirname, './static')
    // 将静态文件目录指定为 public 目录
    app.use(express.static(cssPath));

    app.get('/api/hosts', (req, res) => {
        getHosts().then(r => {
            const data = {
                list: r
            };
            res.json(data);
        }).catch(e => {
            console.log(r);
        })
    });

    app.get('/api/submit', (req, res) => {
        deleteRecord("github.com")
        const data = {
            message: 'Hello, World!'
        };
        res.json(data);
    });

    const server = app.listen(3000, () => {
        console.log(`Express server listening on port ${server.address().port}`);
    });

}

module.exports = {
    main
}