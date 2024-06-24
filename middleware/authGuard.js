const societyModel = require('../models/societyModel')

const authGuard = async (req, res, next) => {
    try {
        if (req.session.society) {
            const societyFinded = await societyModel.findOne({ _id: req.session.society._id })
            if (societyFinded) {
                next()
            } else {
                res.redirect('/login')
            }
        }else{
            res.redirect('/login')
        }

    } catch (error) {
        res.send(error.message)
    }
}

module.exports = authGuard


