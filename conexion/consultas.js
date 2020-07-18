const  { pool} = require('./dbconfig');

async function getNum(){
    const num = (await pool.query('select count(*) from usuario').get);
    console.log(num.rows[0]);
    var idnum = num+1;
    //console.log(idnum);
    return idnum;
};

function validarEmail(email){
   //console.log(email);
   const consulta = await (pool.query('select * from usuario u where u.correoelectronico = $1', [email]));
       //console.log(results);
    if(consulta.rows.length > 0){
           return false;
       }else{
           //console.log(true);
           return true;
       }
};

module.exports = {getNum, validarEmail};