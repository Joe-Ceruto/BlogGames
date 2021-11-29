const express = require("express");
const router = express.Router();
const User = require("./User");
const bcrypt = require("bcryptjs");
const adminAuth = require("../middlewares/adminAuth");
const { redirect } = require("express/lib/response");


//Select 
router.get("/admin/users", adminAuth, (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index.ejs", {users: users})
    })
});

router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create.ejs")
});

//Cadastro com Verificação de Email
router.post("/users/create", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;

    //Verificação de Email
    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if(user == undefined) {

            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            
            //Cadastro
            User.create({
                email: email,
                name: name,
                password: hash
            }).then(() => {
                res.redirect("/")
            }).catch((error) => {
                res.send(error);
            })
        
        }else{
            res.redirect("/admin/users/create");
        }
    });
});


router.get("/login", (req, res) => {
    res.render("admin/users/login.ejs")
});

///Login com autenticação e session
router.post("/authenticate", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var name = req.body.name;

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if(user != undefined) { // Se existe um usuário com esse e-mail
            //Validar senha
            var correct = bcrypt.compareSync(password, user.password);

            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
                res.redirect("/admin/articles");
            }else{
                res.redirect("/login")
            }
        }else{
            res.redirect("/login");
        }
    })

    router.get("/logout",(req, res) => {
        req.session.user = undefined;
        res.redirect("/");
    })
})


router.get("/admin/users/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/users")
    }
    User.findByPk(id).then(user => {
        if(user != undefined) {
            res.render("admin/users/edit.ejs", {user: user});
        }else{
           console.log("erro1")
        }
    }).catch(erro => {
        console.log(erro)
    })
})

//Edit de Usuários
router.post("/users/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);

    User.update({name: name, email: email, password: hash}, {
        where: {
            id:id
        }
    }).then(() => {
        res.redirect("/admin/users")
    })

})

router.post("/users/delete",adminAuth, (req, res) => {
    var id = req.body.id;
    if(id != undefined) {
        if(!isNaN(id)){
            User.destroy({
                where: {
                    id:id
                }
            }).then(() => {
                res.redirect("/admin/users")
            });
        }else{
            res.redirect("/admin/users");
        }
    }else{
        res;redirect("/admin/users");
    }
})
module.exports = router;