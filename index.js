const express = require("express");//Bibliotecas do express. npm install --save express
const app = express();
const bodyParser = require("body-parser");// Puxa dados dos formulários. npm install --save bodyparser
const connection = require('./database/database');
const session = require("express-session");
//Controllers
const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./user/UserController");
//Modules
const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");


// Redis(Salvamento de Cache e Sessões)

    

//Session
app.use(session({
    //Literalmente colocar qualquer coisa para aumentar a segurança
    secret: "It's about drive,it's about power we stay hungry we devour. Put in the work, put in the hours and take wha'ts ours",
    cookie: { maxAge: 60000}
}));

//View Engine
app.set('view engine', 'ejs');

//Static Archives
app.use(express.static('public'));


//Body Parser
app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());

//Database
connection.authenticate().then(() => {
    console.log("Conexão feita com sucesso!");
}).catch((error) =>  {
    console.log(error);
})

//Controllers
app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.get("/session", (req, res) => {
    req.session.treinamento = "Formação Node.js";
    req.session.ano = 2021;
    req.session.name = "Joe Luis";
    req.session.email = "joeluisgomesceruto@gmail.com";
    req.session.user = {
        username: "joejoe",
        email:"joejoe@gmail.com",
        id: 10
    }
    res.send("Sessão Gerada!");
});

app.get("/leitura", (req,res ) => {
    res.json({
        treinamento :req.session.treinamento,
        ano: req.session.ano,
        name: req.session.name,
        email: req.session.email,
        user: req.session.user
    })
});


//Select * From Article
app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'ASC']
        ],
        limit: 4    
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index.ejs", {articles: articles, categories: categories});
        })
        
    })
})


//Página de Artigos pelo Slug
app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render("article.ejs", {article: article, categories: categories})
            });
        }else{
            res.redirect("/");
        }
    }).catch( error => {
        res.redirect(error);
    })
})

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]//join
    }).then(category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("index.ejs", {articles: category.articles, categories: categories})
            });
        }else{
            res.redirect("/")
        }
    }).catch(error => {
        res.redirect("/")
    })
})

app.listen(8081,()=>{
    console.log("O servidor está rodando!")
})