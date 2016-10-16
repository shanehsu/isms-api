"use strict";
const mongoose = require('mongoose');
// const db_uri: string = 'mongodb://isms:isms@ds053964.mongolab.com:53964/isms'
// 找到 --mongodb <port>
let portIndex = process.argv.indexOf('--mongodb') + 1;
let port = portIndex >= 0 ? process.argv[portIndex] : 27017;
const db_uri = `mongodb://127.0.0.1:${port}/isms`;
mongoose.connect(db_uri);
// 成功連線的訊息
mongoose.connection.on('connected', () => {
    console.log('已成功連線至 ' + db_uri);
    // 若是新資料庫，沒有使用者
    Models.User.count({}).then(count => {
        if (count == 0) {
            Models.User.create({
                email: 'hsu.pengjun@icloud.com',
                name: '徐鵬鈞',
                group: 1
            }).then(x => {
                console.log("已新增第一個管理員");
            }).catch(x => {
                console.error("無法新增第一個管理員，系統將無法使用");
                console.error(x);
            });
        }
    });
});
// 連線失敗的訊息
mongoose.connection.on('error', (err) => {
    console.error('連線失敗 ' + err);
});
// 連線突然中斷的訊息
mongoose.connection.on('disconnected', () => {
    console.log('已斷線');
});
// 當程式結束時，斷線的訊息
process.on('SIGINT', function () {
    mongoose.connection.close(() => {
        console.log('已斷線');
        process.exit(0);
    });
});
// BRING IN YOUR SCHEMAS & MODELS
const Models = require('./../libs/models');
mongoose.Promise = Promise;
module.exports = mongoose;
//# sourceMappingURL=mongoose.js.map