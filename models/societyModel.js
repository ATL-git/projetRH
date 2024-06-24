const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config()

const societySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "le nom est requis"],
        validate: {
            validator: function (value) {
                return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(value);
            },
            message: "le nom doit contenir des caracteres valides"
        }
    },
    siretNumber: {
        type: String,
        required: [true, "le numéro de siret est requis"],
       
    },
    mail: {
        type: String,
        required: [true, "le mail est requis"],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
            },
            message: "le mail doit contenir des caracteres valides"
        }
    },
    directorName: {
        type: String,
        required: [true, "le nom du responsable est requis"],
        validate: {
            validator: function (value) {
                return /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(value);
            },
            message: "le nom doit contenir des caracteres valides"
        }
    },
    password: {
        type: String,
        required: [true, "le password est requis"],
        validate: {
            validator: function (value) {
                return /^(?=.*\d.*\d)[A-Za-z\d]{4,}$/.test(value);
            },
            message: "le password doit contenir des caracteres valides"
        },
        
    },
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "employees"
        }
    ]

})

societySchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = bcrypt.hashSync(this.password, parseInt(process.env.PASS))
    }
    next()
})

societySchema.pre("validate", async function (next) {
    try {
        const existingSociety = await this.constructor.findOne({ mail: this.mail });
        if (existingSociety) {
            this.invalidate("mail", "Cet email est déjà enregistré."); 
        }
        next();
    } catch (error) {
        next(error);
    }
});




const societyModel = mongoose.model('societies', societySchema)
module.exports = societyModel