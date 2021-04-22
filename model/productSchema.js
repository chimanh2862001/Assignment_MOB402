const  mongoose = require("mongoose")

const  useSchema = new mongoose.Schema({
    name: {type: String, require: true},
    price: {type: String, require: true},
    specie: {type: String, require: true},
    image: {type: String, require: true},
    note: {type: String, require: true},
})
module.exports = useSchema;