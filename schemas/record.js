/*
 * Record 是紀錄
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var recordSchema = new Schema({
    // 對應到表單格式
    formId: Schema.Types.ObjectId,
    formRevision: Number,

    // 對應到單位、人員
    owningUnit: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    signatures: [{
        personnel: Schema.Types.ObjectId,
        signed: Boolean
    }],
    serial: Number,

    // 實際資料
    data: String
    /*
    ,
    get: function(metadata: string): any {
      try {
        return JSON.parse(metadata)
      }
      finally { 
        return metadata
      }
    },
    set: function(metadata: any): string {
      return JSON.stringify(metadata)
    }
    */
});

module.exports = recordSchema;
