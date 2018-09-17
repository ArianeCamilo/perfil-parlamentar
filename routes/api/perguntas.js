const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Pergunta = require("../../models/Pergunta");

/**
 * Testa a rota de perguntas.
 * @name get/api/perguntas/test
 * @function
 * @memberof module:routes/perguntas
 */
router.get("/test", (req, res) =>
  res.json({ msg: "Testando a rota de perguntas." })
);

/**
 * Pega as perguntas.
 * @name get/api/perguntas
 * @function
 * @memberof module:routes/perguntas
 */
router.get("/", (req, res) => {
  Pergunta.find()
    .then(perguntas => res.json(perguntas))
    .catch(err => res.status(400).json({ err }));
});

module.exports = router;
