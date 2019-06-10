/**
 * Retorna o alinhamento para uma lista de parlamentares
 */
function calcularAlinhamentos(parlamentares, respostas, proposicoes) {
  const alinhamentos = parlamentares.map(parlamentar =>
    parlamentar.get({ plain: true })
  );

  const proposicoesTemas = proposicoes.map(props =>
    props.get({ plain: true })
  );

  const temas = proposicoesTemas.map(item => item.tema_id)
    .filter((value, index, self) => self.indexOf(value) === index);
      
  let temasAlinhamento = [];

  temas.forEach((tema) => {
    nome_tema = proposicoesTemas.filter(value => value.tema_id === tema)[0].tema_prop.tema;
    totalPerguntas = proposicoesTemas.filter(value => value.tema_id === tema).length;

    obj = {
      tema_id: tema,
      tema_nome: nome_tema,
      respostasIguais: 0,
      perguntasIguais: 0,
      totalPerguntas: totalPerguntas,
      alinhamento: 0
    };

    temasAlinhamento.push(obj);
  });
  
  alinhamentos.forEach(parlamentar => {  
    parlamentar.alinhamento = calcular(parlamentar, respostas, proposicoesTemas, temasAlinhamento);
  });

  return alinhamentos;
}

/**
 * Calcula alinhamento entre um parlamentar e as respostas de uma pessoa
 */
function calcular(parlamentar, respostas, proposicoesTemas, temasAlinhamento) {
  if (typeof respostas === "undefined" || respostas === null) {
    return {
      respostasIguais: 0,
      perguntasIguais: 0,
      totalperguntas: proposicoesTemas.length,
      alinhamento: 0,
      temas: temasAlinhamento
    };
  }

  // Cria cópia do objeto de alinhamento dos temas
  let temas = JSON.parse(JSON.stringify(temasAlinhamento));

  let respostasIguais = 0;
  let perguntasIguais = 0;

  parlamentar.votacoes.forEach(votacao => {    
    if (
      (respostas[votacao.id_votacao] === 1 || respostas[votacao.id_votacao] === -1) &&
      (votacao.voto === 1 || votacao.voto === -1)
    ) {
      perguntasIguais++;
      respostasIguais += respostas[votacao.id_votacao] === votacao.voto ? 1 : 0;

      let temaVotacao = proposicoesTemas.filter(prop => { return prop.id_votacao === votacao.id_votacao });      
      
      if (temaVotacao && temaVotacao.length === 1) {
        let temaIndex = temas.findIndex(tema => tema.tema_id === temaVotacao[0].tema_id);
          
        // Atualiza variáveis (perguntasIguais e respostasIguais) para o tema da votação atualmente no loop
        temas[temaIndex].perguntasIguais += 1;
        temas[temaIndex].respostasIguais += respostas[votacao.id_votacao] === votacao.voto ? 1 : 0;
      }
    }
  });
  
  // Calcula alinhamento
  temas.forEach((tema) => {
    tema.alinhamento = tema.perguntasIguais >= 3 ? tema.respostasIguais / tema.perguntasIguais : 0;
  });

  let alinhamento = perguntasIguais >= 3 ? respostasIguais / perguntasIguais : 0;

  return {
    respostasIguais: respostasIguais,
    perguntasIguais: perguntasIguais,
    totalPerguntas: proposicoesTemas.length,
    alinhamento: alinhamento,
    temas: temas
  }
}

module.exports = {
  calcularAlinhamentos,
  calcular
};
