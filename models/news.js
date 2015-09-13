var thinky = require('../util/thinky.js');
var type = thinky.type;

var News = thinky.createModel('News', {
    id: type.string(),
    title: type.string(),
    date: type.date(),
    summary: type.string(),
    link: type.string()
});

module.exports = News;
