const express = require("express");
const { default: slugify } = require("slugify");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const adminAuth = require("../middlewares/adminAuth")

//Select * From()
router.get("/admin/articles", adminAuth,  (req, res) =>{
    Article.findAll({
        include: [{model: Category}] // Join(Incluir dados) em Category
    }).then(articles => {
        res.render("admin/articles/index.ejs", {articles: articles})
    })
})

//
router.get("/admin/articles/new", adminAuth,  (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new.ejs",{categories: categories})
    })
   
})

//Insert 
router.post("/admin/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    })
})

//Delete 
router.post("/articles/delete", adminAuth,  (req, res) => {
    var id = req.body.id;
    if(id != undefined) {
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            });
        }else{//NÃO FOR UM NÚMERO
            res.redirect("/admin/articles");
        }
    }else{//NULL
        res.redirect("/admin/articles");
    }
});

//Da um Select em um ID específico para depois poder fazer a atualização dos dados.
router.get("/admin/articles/edit/:id", adminAuth,  (req,res) => {
    var id = req.params.id;
    Article.findByPk(id).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {categories: categories, article: article})
            });
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    })
})

//UPDATE
router.post("/articles/update",adminAuth,  (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.update({title: title, body: body, categoryId: category, slug: slugify(title)}, {
        where: {
            id:id
        }
    }).then(() => {
        res.redirect("/admin/articles")
    })
})

//Sistema de Paginação
router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var offset= 0; // conteúdo da página
    //Se a pagina não for um número ou for igual a 1, o offset será 0
    if(isNaN(page) || page <= 1){
        offset = 0;
    //Senão o offset será o número da página vezes 4(quantos artigos eu quero ter em cada página)
    }else{
        offset = (parseInt(page) -1) * 4;
    }

    //Procura todos os artigos e da um count() neles
    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        OERDER: [
            ['id', 'DESC']
        ]
    }).then(articles => {

        var next;
        if(offset + 4 >= articles.count){ // Se o offset + 4 for maior ou igual ao número total de artigos não terá uma próxima página.
            next = false
        }else{ // Senão, terá uma prróxima página
            next = true;
        }

        var result = {
            page:parseInt(page),
            next: next,
            articles : articles

        }
        
        Category.findAll().then(categories => {
            res.render("admin/articles/page.ejs", {result : result, categories: categories})
        });
    })
})



module.exports = router;