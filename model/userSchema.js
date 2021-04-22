const  mongoose = require("mongoose")

const  useSchema = new mongoose.Schema({
    username: {type: String, require: true},
    password: {type: String, require: true},
    // phone: {type: String, require: true},
    // role: {type: String, require: true},
    // address: {type: String, require: true},
})
module.exports = useSchema;