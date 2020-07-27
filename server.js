const express = require("express");
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
//const query = require("./consultas/querys");
require("dotenv").config();
const app = express();

const PORT = process.env.PORT || 3000;

const initializePassport = require("./passportConfig");

initializePassport(passport);

// Middleware

// Parses details from a form
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static( "public" ) );
app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);
// Funtion inside passport which initializes passport
app.use(passport.initialize());
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.session());

app.use(flash());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/users/register", checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login");
});

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  res.render("dashboard.ejs", { user: req.user.name });
});


app.get("/users/seleccionarviaje", checkNotAuthenticated, (req, res) => {
  console.log(req.isAuthenticated());
  res.render("dashboard.ejs", { user: req.user.name });
});

app.get("/users/logout", (req, res) => {
  req.logout();
  res.render("index", { message: "You have logged out successfully" });
});

app.post("/users/register", async (req, res) => {
  const sexo = 'masculino';
  let { name, email, run, edad, direccion, password, password2 } = req.body;  
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
  else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    pool.query(
      `SELECT * FROM usuario
        WHERE correoelectronico = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          return res.render("register", {
            message: "Email already registered"
          });
        } else {
          //obtener id
          pool.query('select count(*) cant from administrador', (err, results2)=>
          {
              if(err){
                  throw err;
              }
              if(results2.rows.length > 0){
                const numid = results2.rows[0].cant
                var nid = parseInt(numid);
                const idusuario = 'A'+(nid+1);
                console.log(idusuario);
                pool.query(
                  'insert into usuario(idusuario, passwd,run, nombrecompleto, edad, sexo, direccion, correoelectronico)values($1,$2,$3,$4,$5,$6,$7,$8) RETURNING idusuario, passwd',
                  [idusuario, hashedPassword, run, name, edad, sexo, direccion, email],
                  (err, results) => {
                    if (err) {
                      throw err;
                    }
                    pool.query('insert into administrador(idusuario, nacionalidad)values($1,$2)',
                    [idusuario, 'chilena'],
                    (err, results)=>{
                      if(err){
                        throw err;
                      }
                      console.log(results.rows);
                      req.flash("success_msg", "You are now registered. Please log in");
                      res.redirect("/users/login");
                    });
                  }
                );
              }
          });
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

app.post("/users/recuperarpass", async (req, res)=>{
  let { run, password } = req.body;
  console.log({
      run,
      password
  })

  pool.query('select nombrecompleto from usuario where run = $1',[run],(err, results)=>{
      if(err){
          throw err;
      }
      if(results.rows.length > 0){
          console.log('Usuario Encontrado');
          console.log('nombre: ' + results.rows[0].nombrecompleto)
          console.log('rut: ' +run);
          console.log('new pass: ' + password);
          pool.query(
              'update usuario set passwd = $1 where run = $2',
              [password, run],
              (err, result)=>{
                  if(err){ 
                      throw err;
                  }
                  console.log('Contraseña cambiada con exito')
                  //res.send('<div>alert</div>')
                  res.redirect("/users/login");
              }
          )
      }
      else{
          console.log('Usuario No Encontrado');
      }
  })
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
