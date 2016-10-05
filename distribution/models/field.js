'use strict';
const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
exports.FieldSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '欄位名稱',
        required: true
    },
    type: {
        type: String,
        default: 'shortText',
        required: true,
        validate: {
            validator: function (value) {
                return ['shortText', 'longText', 'date', 'time', 'options', 'table'].indexOf(value) >= 0;
            },
            message: '{VALUE} is not a valid field type.'
        }
    },
    hint: {
        type: String,
        required: false
    },
    // 這個裡面會是一個 JSON 字串
    metadata: {
        type: String,
        default: '{}',
        required: true,
        validate: {
            validator: function (value) {
                try {
                    JSON.parse(value);
                    return true;
                }
                catch (e) {
                    return false;
                }
            },
            message: '{VALUE} is not a valid JSON string.'
        },
        get: function (metadata) {
            return JSON.parse(metadata);
        },
        set: function (metadata) {
            return JSON.stringify(metadata);
        }
    }
});
//# sourceMappingURL=field.js.map