const express = require('express');
const app = express();
const  { pool} = require('./conexion/dbconfig');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const query = require('./conexion/consultas');
const passport = require('passport');

//const initializePassport = require('./conexion/passportConfig');
const initializePassport = require("./conexion/passportConfig");

initializePassport(passport);

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());


app.get("/", (req, res)=>{
    res.render("index");
});
app.get("/users/login", checkAuthenticated, (req, res)=>{
    res.render("login");
});
app.get("/users/register",  checkAuthenticated, (req, res)=>{
        res.render("register");
});
app.get("/users/dashboard", checkNotAuthenticated, (req, res)=>{
    res.render("dashboard", {user: req.user.nombrecompleto});
});


app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("login", { message: "You have logged out successfully" });
});


app.post("/users/register", async (req, res)=>{

    
    let { name, email, run, edad, sexo, direccion, password, password2 } = req.body;
    console.log({
        name,
        email,
        run,
        edad,
        sexo,
        direccion,
        password,
        password2
    })
    let errors =[];
    if(!name || !email || !password || !password2 || !run || !edad || !sexo || !direccion ){
        errors.push({message: "Please enter all fields"});
        
    }
    if(password.length < 8){
        errors.push({message: "Password should be a least 8 characters"});
    }
    if(password != password2){
        console.log("Passwords do not match");
        errors.push({message: "Passwords do not match"});
    }
    

    if(errors.length > 0){
        res.render("register",{errors});
    }
    else{
        //form validation has passed
        let hashedPassword = await bcrypt.hash(password, 10);
        //console.log(hashedPassword);
    }    
    

    pool.query(
        'select * from usuarioprueba u where u.correoelectronico = $1', [email], 
        (err, results)=>{  
            if(err){
                throw err;
            }
            //console.log(results.rows);
            //preguntamos si el usuario esta registrado
            if(results.rows.length > 0){
                errors.push({messege: "Email already registered"});
                console.log('Email already registered');
                res.render('register');
                //res.render('register', {errors});
            }else{
                
                pool.query(
                    'insert into usuarioprueba(passwd,run, nombrecompleto, edad, sexo, direccion, correoelectronico)values($1,$2,$3,$4,$5,$6,$7) RETURNING idusuario, passwd',
                    [password, run, name, edad, sexo, direccion, email],
                    (err, result)=>{
                        if(err){ 
                            throw err;
                        }
                        console.log(results.rows);
                        req.flash("success_msg", "you are now registered. Please log in");
                        res.redirect("/users/login");
                    }
                   
                )
            }
        }
        
    )
});

app.post('/users/login', passport.authenticate('local',{
        successRedirect: '/users/dashboard',
        failtureRedirect: '/users/login',
        failtureFlash: true
}));

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/users/dashboard");
    }
    next();
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/users/login");
}

app.listen(PORT, ()=>{
    //console.log('Server running on port ${process.env.DB_USER');
});