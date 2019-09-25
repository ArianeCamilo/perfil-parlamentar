const { check } = require('express-validator');

module.exports = {
  validaParametroCasa: [
      check('casa').custom(casa => {
        console.log(casa)        
        if (casa !== undefined && casa !== "" && casa !== "camara" && casa !== "senado") {
          throw new Error("Parâmetro casa precisa ser 'camara' ou 'senado'.");
        }
        return true;
      })
    ]  
};