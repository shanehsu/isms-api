var mongoose = require('mongoose');
const db_uri = 'mongodb://isms:isms@ds053964.mongolab.com:53964/isms';
mongoose.connect(db_uri);
// 成功連線的訊息
mongoose.connection.on('connected', () => {
    console.log('已成功連線至 ' + db_uri);
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
module.exports = mongoose;
//# sourceMappingURL=mongoose.js.map