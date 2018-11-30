import {
  SET_SCORE_CANDIDATOS,
  SET_SCORE_CANDIDATO_POR_TEMA,
  CANDIDATOS_CARREGANDO,
  CANDIDATOS_CARREGADOS,
  SET_DADOS_CANDIDATOS,
  SET_FILTRO_CANDIDATOS,
  SET_DADOS_CANDIDATO,
  SET_DADOS_CANDIDATO_POR_CPF,
  SET_MOSTRAR_TODOS_CANDIDATOS,
  SET_CANDIDATOS_RANQUEADOS,
  SET_CANDIDATOS_FILTRADOS,
  SET_PARTIDOS,
  SET_PAGINACAO,
  SET_CANDIDATOS_FILTRANDO,
  SET_TOTAL_RESPONDERAM_ESTADO,
  SET_TOTAL_RESPOSTAS_ESTADO,
  SET_TOTAL_RESPONDERAM_PARTIDO,
  SET_TOTAL_RESPOSTAS_PARTIDO,
  SET_ACTIVE_TAB,
  SET_TOTAL_ELEITOS_ESTADO,
  SET_VER_TODOS_ELEITOS
} from "./types";

import { getVotacoesDeputados } from "./votacoesActions";

import { TAM_PAGINA, ITENS_POR_REQ } from "../constantes/constantesCandidatos";

import { filtra } from "../services/FiltroService";

import { buscaCPF } from "../services/BuscaService";

import axios from "axios";
import isEmpty from "../validation/is-empty";

import votacoes from "../data/votacoes.json";

const comparaRespostas = (
  respostasCandidatos,
  respostasUsuarioVozAtiva,
  respostasUsuarioQMR,
  votacoesCandidatos,
  numRespostasUsuario
) => {
  let respostasIguais = 0;
  const chaves = Object.keys(respostasCandidatos);
  chaves.forEach(idPergunta => {
    respostasIguais +=
      respostasCandidatos[idPergunta] !== undefined &&
      respostasCandidatos[idPergunta] !== null &&
      respostasUsuarioVozAtiva[idPergunta] !== 0 &&
      respostasUsuarioVozAtiva[idPergunta] !== -2 &&
      respostasCandidatos[idPergunta] === respostasUsuarioVozAtiva[idPergunta]
        ? 1
        : 0;
  });

  const chavesQMR = Object.keys(votacoesCandidatos);
  chavesQMR.forEach(idPergunta => {
    respostasIguais +=
      votacoesCandidatos[idPergunta] !== undefined &&
      votacoesCandidatos[idPergunta] !== null &&
      respostasUsuarioQMR[idPergunta] !== 0 &&
      respostasUsuarioQMR[idPergunta] !== -2 &&
      votacoesCandidatos[idPergunta] === respostasUsuarioQMR[idPergunta]
        ? 1
        : 0;
  });

  return respostasIguais / numRespostasUsuario;
};

// Recebe um dicionário das respostas dos candidatos no formato {id_cand: [array_resp]} e retorna um dicionário no formato {id_cand: score}
export const calculaScore = () => (dispatch, getState) => {
  const { respostasUsuario, quantidadeVotos } = getState().usuarioReducer;
  const respostasCandidatos = getState().candidatosReducer.dadosCandidatos;
  const { votacoesCandidatos } = getState().votacoesReducer;

  const quantVotosVozAtiva = Object.keys(respostasUsuario.vozAtiva).filter(
    id =>
      respostasUsuario.vozAtiva[id] !== 0 &&
      respostasUsuario.vozAtiva[id] !== -2
  ).length;

  const quantVotosQMR = Object.keys(respostasUsuario.qmr).filter(
    id => respostasUsuario.qmr[id] !== 0 && respostasUsuario.qmr[id] !== -2
  ).length;

  const numRespostasUsuario =
    quantVotosVozAtiva + quantVotosQMR === 0
      ? 1
      : quantVotosVozAtiva + quantVotosQMR;

  let scoreCandidatos = {};
  Object.keys(respostasCandidatos).forEach(elem => {
    // const naoRespondeuVozAtiva =
    //   Object.keys(respostasCandidatos[elem].respostas).filter(
    //     id => respostasCandidatos[elem].respostas[id] !== 0
    //   ).length === 0;

    // const votacoesCand = votacoesCandidatos[elem];

    // let numRespostasConsideradas;
    // if (votacoesCand && !naoRespondeuVozAtiva)
    //   numRespostasConsideradas = numRespostasUsuario;
    // else if (naoRespondeuVozAtiva) numRespostasConsideradas = quantVotosQMR;
    // else if (!votacoesCand) numRespostasConsideradas = quantVotosVozAtiva;
    // else numRespostasConsideradas = 0;

    let score = comparaRespostas(
      respostasCandidatos[elem].respostas,
      respostasUsuario.vozAtiva,
      respostasUsuario.qmr,
      votacoesCandidatos[elem] !== undefined ? votacoesCandidatos[elem] : {},
      numRespostasUsuario
    );
    console.log(score);
    scoreCandidatos[elem] = score;
  });

  dispatch({
    type: SET_SCORE_CANDIDATOS,
    scoreCandidatos
  });
  dispatch(getTopNCandidatos(Object.keys(scoreCandidatos).length));
};

export const calculaScorePorTema = (
  respostasUsuario,
  arrayRespostasUsuario
) => (dispatch, getState) => {
  const { dadosCandidato } = getState().candidatosReducer;
  const perguntas = getState().perguntasReducer.dadosPerguntas;
  const { votacoesCandidatos } = getState().votacoesReducer;

  let nomeTemas = new Set();

  perguntas.forEach(elem => {
    nomeTemas.add(elem.tema);
  });

  Object.keys(votacoes).forEach(keyVotacao => {
    const votacao = votacoes[keyVotacao];
    nomeTemas.add(votacao.tema);
  });

  let scoreTema = {};
  nomeTemas.forEach(nomeTema => {
    scoreTema[nomeTema] = 0;
  });

  let perguntasPorTema = {};
  perguntas.forEach(pergunta => {
    if (isEmpty(perguntasPorTema[pergunta.tema])) {
      perguntasPorTema[pergunta.tema] = [];
      perguntasPorTema[pergunta.tema].push(pergunta.id);
    } else {
      perguntasPorTema[pergunta.tema].push(pergunta.id);
    }
  });

  let votacoesPorTema = {};
  Object.keys(votacoes).forEach(keyVotacao => {
    const votacao = votacoes[keyVotacao];

    if (isEmpty(votacoesPorTema[votacao.tema])) {
      votacoesPorTema[votacao.tema] = [];
      votacoesPorTema[votacao.tema].push(votacao.id_votacao);
    } else {
      votacoesPorTema[votacao.tema].push(votacao.id_votacao);
    }
  });

  nomeTemas.forEach(tema => {
    console.log(perguntasPorTema[tema]);
    console.log(votacoesPorTema[tema]);

    const respostasValidasVA = perguntasPorTema[tema]
      ? perguntasPorTema[tema].filter(
          id =>
            respostasUsuario.vozAtiva[id] !== 0 &&
            respostasUsuario.vozAtiva[id] !== -2
        ).length
      : 0;

    const respostasValidasQMR =
      votacoesPorTema[tema] && !isEmpty(dadosCandidato.votacoes)
        ? votacoesPorTema[tema].filter(
            id =>
              respostasUsuario.qmr[id] !== 0 && respostasUsuario.qmr[id] !== -2
          ).length
        : 0;

    const numRespostasUsuario =
      respostasValidasVA + respostasValidasQMR === 0
        ? 1
        : respostasValidasVA + respostasValidasQMR;

    let respostasCandidatosTema = {};
    let votacoesCandidatosTema = {};

    if (perguntasPorTema[tema]) {
      perguntasPorTema[tema].forEach(idPergunta => {
        respostasCandidatosTema[idPergunta] =
          dadosCandidato.respostas[idPergunta];
      });
    }

    if (votacoesCandidatos[dadosCandidato.cpf]) {
      votacoesPorTema[tema].forEach(idVotacao => {
        votacoesCandidatosTema[idVotacao] =
          votacoesCandidatos[dadosCandidato.cpf][idVotacao];
      });
    }

    if (!isEmpty(dadosCandidato.votacoes)) {
      votacoesPorTema[tema].forEach(idVotacao => {
        votacoesCandidatosTema[idVotacao] = dadosCandidato.votacoes[idVotacao];
      });
    }

    console.log(respostasCandidatosTema);
    console.log(votacoesCandidatosTema);

    let score = comparaRespostas(
      respostasCandidatosTema,
      respostasUsuario.vozAtiva,
      respostasUsuario.qmr,
      votacoesCandidatosTema,
      numRespostasUsuario
    );

    scoreTema[tema] = score;

    console.log(tema);
    console.log(respostasUsuario.qmr);
    console.log(scoreTema);

    dispatch({
      type: SET_SCORE_CANDIDATO_POR_TEMA,
      scoreTema
    });
  });

  // Object.keys(temas).forEach(tema => {
  //   let score = 0;
  //   let respostasCandidatosTema = {};
  //   let votacoesCandidatosTema = {};
  //   perguntas.forEach(pergunta => {
  //     if (pergunta.tema === tema) {
  //       respostasCandidatosTema[pergunta.id] =
  //         dadosCandidato.respostas[pergunta.id];
  //     }
  //   });

  //   if (votacoesCandidatos[dadosCandidato.cpf]) {
  //     // Pegar as informações de votações do reducer de votações e não pegar diretamente do json
  //     Object.keys(votacoes).forEach(keyVotacao => {
  //       const votacao = votacoes[keyVotacao];
  //       if (votacao.tema === tema) {
  //         votacoesCandidatosTema[votacao.id_votacao] =
  //           votacoesCandidatos[dadosCandidato.cpf][votacao.id_votacao];
  //       }
  //     });
  //   }

  //   const primeiroID = temas[tema][0].id;
  //   const ultimoID = temas[tema][temas[tema].length - 1].id;

  //   console.log(temas[tema]);

  //   temas[tema].forEach(pergunta => {
  //     const quantValidos = arrayRespostasUsuario
  //       .slice(primeiroID, ultimoID + 1)
  //       .filter(value => value !== 0 && value !== -2).length;
  //     const numRespostasUsuario = quantValidos === 0 ? 1 : quantValidos;

  //     console.log(numRespostasUsuario);
  //     console.log(arrayRespostasUsuario);
  //     console.log(primeiroID);
  //     console.log(ultimoID);

  //     score = comparaRespostas(
  //       respostasCandidatosTema,
  //       respostasUsuario.vozAtiva,
  //       respostasUsuario.qmr,
  //       votacoesCandidatosTema,
  //       numRespostasUsuario
  //     );
  //   });
  //   scoreTema[tema] = score;
  // });

  // console.log(scoreTema);

  // dispatch({
  //   type: SET_SCORE_CANDIDATO_POR_TEMA,
  //   scoreTema
  // });
};

export const buscaPorCPF = cpf => (dispatch, getState) => {
  let candidato;
  dispatch(setCandidatosCarregando());

  buscaCPF(cpf).then(dados => {
    candidato = isEmpty(dados.data[0]) ? null : dados.data[0];
    dispatch({ type: SET_DADOS_CANDIDATO_POR_CPF, candidato: candidato });
  });
};

// Pega o top n candidatos baseado na compatibilidade entre as respostas ordenado pelo score. Recebe um dicionário das respostas dos candidatos e retorna um array de arrays (tuplas) com os ids dos candidatos e seu score.

// A função de ordenação prioriza os candidatos que responderam ao questionário. Caso os dois tenham respondido ou ambos não tenham respondido, a ordenação será dada alfabeticamente.
export const getTopNCandidatos = n => (dispatch, getState) => {
  const {
    scoreCandidatos,
    dadosCandidatos,
    totalRespostasEstado,
    totalEleitosEstado,
    activeTab
  } = getState().candidatosReducer;
  let matrizScores = Object.keys(scoreCandidatos).map(key => [
    key,
    scoreCandidatos[key]
  ]);

  const candidatos = matrizScores
    .sort((a, b) => {
      if (a[1] > b[1]) return -1;
      else if (a[1] === b[1]) {
        if (
          !isEmpty(dadosCandidatos[a[0]]) &&
          !isEmpty(dadosCandidatos[b[0]])
        ) {
          if (
            (dadosCandidatos[a[0]].respondeu &&
              dadosCandidatos[b[0]].respondeu) ||
            (!dadosCandidatos[a[0]].respondeu &&
              !dadosCandidatos[b[0]].respondeu)
          )
            return dadosCandidatos[a[0]].nome_urna.localeCompare(
              dadosCandidatos[b[0]].nome_urna
            );
          else if (dadosCandidatos[b[0]].respondeu) return 1;
          else return -1;
        }
        return 0;
      } else return 1;
    })
    .map(candidato => candidato[0]);

  dispatch({
    type: SET_CANDIDATOS_RANQUEADOS,
    candidatosRanqueados: candidatos.slice(0, n)
  });
  dispatch(
    setPaginacao({
      inicio: 0,
      final: TAM_PAGINA,
      totalCandidatos:
        activeTab === "eleitos" ? totalEleitosEstado : totalRespostasEstado,
      paginaAtual: 1,
      paginaAtualAPI: 1
    })
  );
};

export const getDadosCandidatos = () => (dispatch, getState) => {
  dispatch(setCandidatosCarregando());
  dispatch(getVotacoesDeputados());
  console.log("carregando");

  const { filtro, activeTab } = getState().candidatosReducer;

  console.log(activeTab);

  let dadosCandidatos = {};

  if (activeTab === "eleitos" && filtro.estado !== "TODOS") {
    axios
      .get("/api/respostas/estados/" + filtro.estado + "/eleitos")
      .then(respostas => {
        respostas.data.candidatos.forEach(resp => {
          dadosCandidatos[resp.cpf] = resp;
        });

        dispatch({ type: SET_DADOS_CANDIDATOS, dadosCandidatos });
        dispatch({
          type: SET_TOTAL_ELEITOS_ESTADO,
          totalEleitosEstado: respostas.data.total
        });
        dispatch(setPartidos());
        dispatch(calculaScore());
      });
  } else if (activeTab === "eleitos" && filtro.estado === "TODOS") {
    axios.get("/api/respostas/eleitos").then(respostas => {
      respostas.data.forEach(resp => {
        dadosCandidatos[resp.cpf] = resp;
      });

      dispatch({ type: SET_DADOS_CANDIDATOS, dadosCandidatos });
      dispatch({
        type: SET_TOTAL_ELEITOS_ESTADO,
        totalEleitosEstado: 513
      });
      dispatch(setPartidos());
      dispatch(calculaScore());
    });
  } else {
    axios

      .get("/api/respostas/estados/" + filtro.estado)
      .then(totalCandidatos => {
        dispatch({
          type: SET_TOTAL_RESPOSTAS_ESTADO,
          totalRespostas: totalCandidatos.data.total
        });
      })
      .then(() => {
        axios
          .get(
            "/api/respostas/estados/" +
              filtro.estado +
              "/naoresponderam?pageNo=1&size=" +
              ITENS_POR_REQ
          )
          .then(respostas => {
            respostas.data.data.forEach(resp => {
              dadosCandidatos[resp.cpf] = resp;
            });

            dispatch({ type: SET_DADOS_CANDIDATOS, dadosCandidatos });
            dispatch(setPartidos());
            dispatch(calculaScore());
          });
      });

    axios
      .get("/api/respostas/estados/" + filtro.estado + "/responderam")
      .then(respostas => {
        respostas.data.candidatos.forEach(resp => {
          dadosCandidatos[resp.cpf] = resp;
        });

        dispatch({ type: SET_DADOS_CANDIDATOS, dadosCandidatos });
        dispatch({
          type: SET_TOTAL_RESPONDERAM_ESTADO,
          totalResponderam: respostas.data.total
        });
        dispatch(setPartidos());
        dispatch(calculaScore());
      });
  }
};

export const getDadosCandidato = (
  idCandidato,
  respostasUsuario,
  arrayRespostasUsuario
) => (dispatch, getState) => {
  dispatch(setCandidatosCarregando());

  const { quantidadeVotos } = getState().usuarioReducer;

  const { votacoesCandidatos } = getState().votacoesReducer;

  const numRespostasUsuario = quantidadeVotos === 0 ? 1 : quantidadeVotos;

  console.time("pega1Candidato");

  console.log(votacoesCandidatos);

  axios
    .get("/api/respostas/candidatos/" + idCandidato)
    .then(respostas => {
      console.timeEnd("pega1Candidato");

      const dadosCandidato = respostas.data[0];

      dispatch({ type: SET_DADOS_CANDIDATO, dadosCandidato });
    })
    .then(() => {
      axios.get("/api/candidatos/" + idCandidato + "/votacoes").then(res => {
        const { dadosCandidato } = getState().candidatosReducer;

        const votacoes = !isEmpty(res.data[0]) ? res.data[0].votacoes : {};

        dadosCandidato.votacoes = votacoes;

        const score = comparaRespostas(
          dadosCandidato.respostas,
          respostasUsuario.vozAtiva,
          respostasUsuario.qmr,
          votacoes,
          numRespostasUsuario
        );

        dadosCandidato.score = score;

        dispatch({
          type: SET_DADOS_CANDIDATO,
          dadosCandidato: dadosCandidato
        });
        dispatch(calculaScorePorTema(respostasUsuario, arrayRespostasUsuario));
      });
    });
};

export const setCandidatosCarregando = () => {
  return {
    type: CANDIDATOS_CARREGANDO
  };
};

export const setCandidatosCarregados = () => {
  return {
    type: CANDIDATOS_CARREGADOS
  };
};

export const setCandidatosFiltrados = () => (dispatch, getState) => {
  const {
    dadosCandidatos,
    filtro,
    scoreCandidatos,
    candidatosRanqueados,
    activeTab
  } = getState().candidatosReducer;

  dispatch(setCandidatosFiltrando());

  axios
    .get(
      "api/respostas/estados/" + filtro.estado + "/partidos/" + filtro.partido
    )
    .then(totalCandidatos => {
      dispatch({
        type: SET_TOTAL_RESPOSTAS_PARTIDO,
        totalRespostas: totalCandidatos.data.total
      });
    });

  axios
    .get(
      "api/respostas/estados/" +
        filtro.estado +
        "/partidos/" +
        filtro.partido +
        "/responderam"
    )
    .then(totalCandidatos =>
      dispatch({
        type: SET_TOTAL_RESPONDERAM_PARTIDO,
        totalResponderam: totalCandidatos.data.total
      })
    );

  const eleito = activeTab === "eleitos" ? true : "";

  filtra(filtro, eleito).then(todosCandidatos => {
    const cpfCandidatos = {};
    const candidatos = todosCandidatos.data.candidatos;

    candidatos.forEach(candidato => {
      dadosCandidatos[candidato.cpf] = candidato;
      cpfCandidatos[candidato.cpf] = candidato;
    });

    dispatch({
      type: SET_DADOS_CANDIDATOS,
      dadosCandidatos: dadosCandidatos
    });

    dispatch(calculaScore());

    let candidatosOrdenados = Object.keys(cpfCandidatos).sort((a, b) => {
      if (scoreCandidatos[a] > scoreCandidatos[b]) return -1;
      else if (scoreCandidatos[a] < scoreCandidatos[b]) return 1;
      else if (scoreCandidatos[a] === scoreCandidatos[b]) {
        if (!isEmpty(dadosCandidatos[a]) && !isEmpty(dadosCandidatos[b])) {
          if (
            (dadosCandidatos[a].respondeu && dadosCandidatos[b].respondeu) ||
            (!dadosCandidatos[a].respondeu && !dadosCandidatos[b].respondeu)
          )
            return dadosCandidatos[a].nome_urna.localeCompare(
              dadosCandidatos[b].nome_urna
            );
          else if (dadosCandidatos[b].respondeu) return 1;
          else return -1;
        }
        return 0;
      } else return 0;
    });

    dispatch({
      type: SET_CANDIDATOS_FILTRADOS,
      candidatosFiltrados: candidatosOrdenados
    });

    dispatch(
      setPaginacao({
        inicio: 0,
        final: TAM_PAGINA,
        totalCandidatos:
          filtro.partido !== "Partidos" ||
          filtro.nome !== "" ||
          filtro.reeleicao !== "-1" ||
          filtro.responderam !== "-1"
            ? candidatos.length
            : candidatosRanqueados.length
      })
    );
  });
};

export const setFiltroCandidatos = filtro => dispatch => {
  dispatch({ type: SET_FILTRO_CANDIDATOS, filtro });
};

export const mostrarTodosCandidatos = () => dispatch => {
  dispatch({ type: SET_MOSTRAR_TODOS_CANDIDATOS });
};

export const setPartidos = () => (dispatch, getState) => {
  const { filtro, activeTab } = getState().candidatosReducer;
  const eleito = activeTab === "eleitos" ? true : "";
  axios
    .get(
      "api/respostas/estados/" +
        filtro.estado +
        "/partidos" +
        "?eleito=" +
        eleito
    )
    .then(partidos => {
      dispatch({ type: SET_PARTIDOS, partidos: partidos.data.data });
    });
};

export const setPaginacao = paginacao => dispatch => {
  dispatch({ type: SET_PAGINACAO, paginacao: paginacao });
};

export const setCandidatosFiltrando = () => {
  return {
    type: SET_CANDIDATOS_FILTRANDO
  };
};

export const getProximaPaginaCandidatos = () => (dispatch, getState) => {
  const {
    paginacao,
    filtro,
    candidatosRanqueados
  } = getState().candidatosReducer;

  let { dadosCandidatos } = getState().candidatosReducer;

  dispatch(setCandidatosCarregando());

  axios
    .get(
      "/api/respostas/estados/" +
        filtro.estado +
        "/naoresponderam?pageNo=" +
        paginacao.paginaAtualAPI +
        "&size=" +
        ITENS_POR_REQ
    )
    .then(respostas => {
      respostas.data.data.forEach(resposta => {
        candidatosRanqueados.push(resposta.cpf);
        dadosCandidatos[resposta.cpf] = resposta;
      });

      dispatch({
        type: SET_CANDIDATOS_RANQUEADOS,
        candidatosRanqueados: candidatosRanqueados
      });
      dispatch(setCandidatosCarregados());
    });
};

export const setActiveTab = activeTab => (dispatch, getState) => {
  const { filtro } = getState().candidatosReducer;

  dispatch({
    type: SET_ACTIVE_TAB,
    activeTab: activeTab
  });

  const filtroLimpo = {
    nome: "",
    partido: "Partidos",
    estado: filtro.estado,
    reeleicao: "-1",
    respondeu: "-1"
  };

  dispatch(setFiltroCandidatos(filtroLimpo));
  dispatch(getDadosCandidatos());
};

export const verTodosEleitos = () => dispatch => {
  dispatch({ type: SET_VER_TODOS_ELEITOS });
};
