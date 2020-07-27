const express = require('express');
const pool = require('../dbConfig');

async function obtenercantadministradores(){
    
};

function obteneridadministrador(){
    const cantadministrador = obtenercantadministradores();
    console.log('A'+cantadministrador);
}

modules.exports = { obtenercantadministradores, obteneridadministrador}
