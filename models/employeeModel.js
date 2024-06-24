const mongoose = require('mongoose')

const employeesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Le nom est requis"],
    },
    fonction : {
        type: String,
        required: [true, "la fonction est requis"]
    },
    blame : {
        type: Number,
        default : 0
        
    },
    photo: {
        type: String,
    }
})




const employeesModel = mongoose.model('employees', employeesSchema)

module.exports = employeesModel