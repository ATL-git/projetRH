const employeeRouter = require("express").Router()
const employeeModel = require("../models/employeeModel")
const authGuard = require('../middleware/authGuard')
const upload = require('../middleware/upload')
const societyModel = require("../models/societyModel")
const fs = require('fs');


employeeRouter.get('/addemployee', authGuard, (req, res) => {
    res.render("pages/addemployee.twig", {
        society: req.session.society
    })
})

employeeRouter.post('/addemployee', authGuard, upload.single('img'), async (req, res) => {
    try {
        if (req.file) {
            req.body.photo = req.file.filename
        }
        const newemployee = new employeeModel(req.body)
        newemployee.validateSync()
        await newemployee.save()
        await societyModel.updateOne({ _id: req.session.society._id }, { $push: { employees: newemployee._id } })
        res.redirect("/dashboard")
    } catch (error) {
        res.render("pages/addemployee.twig", {
            society: req.session.society,
            error: error.message
        })
    }
})

employeeRouter.get("/employeedelete/:employeeid", authGuard, async (req, res) => {
    try {
        await employeeModel.deleteOne({ _id: req.params.employeeid });
        await societyModel.updateOne({ _id: req.session.society._id }, { $pull: { employees: req.params.employeeid } })
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error.message);
        res.render("pages/dashboard.twig", {
            errorMessage: "Un probleme est survenu pendant la suppression",
            society: await societyModel
                .findById(req.session.society)
                .populate("employees"),
            title: "dashboard - employeeShow",
        });
    }
});

employeeRouter.get("/employeeupdate/:employeeid", authGuard, async (req, res) => {
    try {
        let employee = await employeeModel.findById(req.params.employeeid);
        res.render("pages/addemployee.twig", {
            title: "Modifier un employee - employeestore",
            society: await societyModel.findById(req.session.society),
            employee: employee,
        });
    } catch (error) {
        res.render("pages/dashboard.twig", {
            errorMessage: "L'employee' que vous souhaitez modifier n'existe pas",
            society: await societyModel.findById(req.session.society),
            title: "dashboard - employeeShow",
        });
    }
});

employeeRouter.post('/employeeupdate/:employeeid', authGuard, upload.single("img"), async (req, res) => {
    try {
        let employee = await employeeModel.findById(req.params.employeeid);


        if (req.file) {
            if (employee.photo) {
                fs.unlink("./publics/assets/img/uploads/" + employee.photo, (err) => {
                    if (err) {
                        console.error("Erreur lors de la suppression de l'ancienne photo:", err);
                    }
                });
            }

            req.body.photo = req.file.filename;
        }

        await employeeModel.updateOne({ _id: req.params.employeeid }, req.body);
        res.redirect("/dashboard");
    } catch (error) {
        res.render("pages/addemployee.twig", {
            title: "Modifier un employé - employeeShow",
            society: await societyModel.findById(req.session.society),
            employee: await employeeModel.findById(req.params.employeeid),
            error: error.message,
        });
    }
});

employeeRouter.get('/employeeBlame/:employeeId', authGuard, async (req, res) => {
  
    const employeeId = req.params.employeeId;
    try {
        console.log(employeeId);
        const employee = await employeeModel.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        const society = await societyModel.findById(req.session.society._id);
        if (!society.employees.includes(employeeId)) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cet employé" });
        }

        employee.blame += 1;

        if (employee.blame == 3) {
            res.redirect("/employeedelete/" + employeeId)
        } else {
            await employee.save();
            res.redirect("/dashboard");
        }

    } catch (error) {
        console.error("Erreur lors de l'incrémentation du blame :", error);
        res.status(500).json({ error: "Erreur serveur lors de l'incrémentation du blame" });
    }
})



module.exports = employeeRouter