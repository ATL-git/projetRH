const authGuard = require('../middleware/authGuard')
const societyRouter = require('express').Router();
const societyModel = require("../models/societyModel")
const bcrypt = require('bcrypt')
const employeeModel = require('../models/employeeModel')
const fs = require('fs');

societyRouter.get('/register', (req, res) => {
    res.render('pages/register.twig')
})

societyRouter.post('/register', async (req, res) => {

    try {
        const society = await societyModel.findOne({ mail: req.body.mail })
        if (!society) {
        let newSociety = new societyModel(req.body)
        newSociety.validateSync()
        await newSociety.save()
        res.redirect('/login')
        }else{
            throw new Error("Ce mail existe déjà")
        }
    } catch (error) {
        res.render('pages/register.twig' , {
            error : error.message
        })
    }
})

societyRouter.get('/login', (req, res) => {
    res.render('pages/login.twig')

})

societyRouter.post('/login', async (req, res) => {
    try {
        const society = await societyModel.findOne({ mail: req.body.mail })
        if (society) {
            if (bcrypt.compareSync(req.body.password, society.password)) {
                req.session.society = society
                res.redirect("/dashboard")
            } else {
                throw new Error("les mot de passe ne correspondent pas")
            }
        } else {
            throw new Error("entreprise non enregistrer")
        }
    } catch (error) {
        res.render('pages/login.twig', {
            error: error.message
        })
    }
})

societyRouter.get('/dashboard', authGuard, async (req, res) => {
    let query = {

    }
    if (req.query.search) {
        query[req.query.searchValue] = { $regex: new RegExp(req.query.search, 'i') };
    }
    const societyFinded = await societyModel.findById(req.session.society._id).populate({
        path: "employees" ,
    match: query
    })
    res.render('pages/dashboard.twig', {
        society: req.session.society,
        employees: societyFinded.employees

    })
})


societyRouter.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})


societyRouter.get('/acceuil', (req , res) => {
    res.redirect('/dashboard')
})

module.exports = societyRouter