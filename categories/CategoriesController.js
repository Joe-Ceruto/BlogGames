const express = require("express");
const router = express.Router();
const Category = require("./Category")
const slugify = require("slugify");// Slugify é uma biblioteca que transforma o valor de variaveis em slug. npm install --save slugify
const adminAuth = require("../middlewares/adminAuth")

router.get("/admin/categories/new", adminAuth, (req, res) => {
    res.render("admin/categories/new.ejs")
});

//Insert into categories 
router.post("/categories/save", adminAuth, (req, res) => {
    var title = req.body.title;
    if(title != undefined) {
        Category.create({
            title: title,
            slug: slugify(title)
        }).then(() => {
            res.redirect("/admin/categories");
        })
    }else {
        res.redirect("/admin/categories/new");
    }
})

//Select * from categories
router.get("/admin/categories", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/categories/index.ejs", {categories: categories});
    })
   
})

//Delete where id = id
router.post("/categories/delete", adminAuth, (req, res) => {
    var id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){ //If is a number
            Category.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/categories");
            });
        }else{
            res.redirect("/admin/categories");
        }

    }else{// If id is null
        res.redirect("/admin/categories");
    }
})

//Da um Select em um ID específico para depois poder fazer a atualização dos dados.
router.get("/admin/categories/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/categories")
    }
    Category.findByPk(id).then(category => {//findByPk(achar pela primary key, que é basicamente o id)
        if(category != undefined) {
            res.render("admin/categories/edit.ejs", {category: category});
        }else{
            res.redirect("/admin/categories")
        }
    }).catch(erro => {
        res.redirect("/admin/categories")
    })
})

//UPDATE WHERE ID = ID
router.post("/categories/update", adminAuth, (req, res) =>{
    var id = req.body.id;
    var title = req.body.title;
    
    Category.update({title: title, slug: slugify(title)},{
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/categories");
    })
})

module.exports = router;