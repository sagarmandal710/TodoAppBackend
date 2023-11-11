const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
    task : String,
    desc : String,
    employeeId : String,
    done : {
        type : Boolean,
        default : false
    },
    imageUrl : String
})

const TodoModel = mongoose.model("todos", TodoSchema)
module.exports = TodoModel