const LocalStrategy = require("passport-local").Strategy;
const { pool } = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
    console.log(email, password);
    pool.query(
        'select * from usuarioprueba where correoelectronico = $1',
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (results.rows.length > 0) {
            const user = results.rows[0];
            console.log('encontro coincidencia');
            var passwdIsValid = bcrypt.compare(password, user.passwd);
          if(passwdIsValid){
              console.log("authentication successful");
              return done(null, user);
          }else{
              console.log("authentication failed. Password doesn't match");
              return done(null, false, { message: "Password is incorrect" });
          }
        } else {
          // No user
          console.log('no encontro coincidencia');
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  
  );
  passport.serializeUser((user, done) => done(null, user.idusuario));
  passport.deserializeUser((idusuario, done) => {
    pool.query('select * from usuarioprueba where idusuario = $1', [idusuario], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].idusuario}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;