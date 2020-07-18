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
        //console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];
          console.log('encontro coincidencia');
          //console.log(password, user.passwd);
          /*
               bcrypt.compare(password, user.passwd, (err, isMatch) => {
            //console.log(password, user.passwd);
            if (err) {
              console.log(err);
            }
            if (isMatch) {
              console.log('passwd correcta');
              return done(null, user);
            } else {
              //password is incorrect
              console.log('passwd incorrecta');
              return done(null, false, { message: "Password is incorrect" });
            }
          });

          */
         /*
         //bcrypt.compareSync(password, user.passwd);
         var result = bcrypt.compareSync(password, user.password);
        if (result) {
            console.log("Password correct");
        } else {
            console.log("Password wrong");
        } */
        var passwdIsValid = bcrypt.compare(password, user.passwd);
        if(passwdIsValid){
            console.log("authentication successful");
            return done(null, user);
        }else{
            console.log("authentication failed. Password doesn't match");
            return done(null, false, { message: "Password is incorrect" });
        }
        
         /* bcrypt.compare(password,user.passwd).then((result)=>{
            if(result){
                console.log("authentication successful")
                return done(null, user);
                // do stuff
            } else {
                console.log("authentication failed. Password doesn't match")
                // do other stuff
                return done(null, false, { message: "Password is incorrect" });
            }
            })
            .catch((err)=>console.error(err))*/
//-------------------------------------------------------------------------------------------------//
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

 //console.log('Parada 1');
  passport.serializeUser((user, done) => done(null, user.idusuario));
  passport.deserializeUser((idusuario, done) => {
    //console.log('Parada 2');
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