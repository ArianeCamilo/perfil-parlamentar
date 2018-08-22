import React, { Component } from "react";
import Pergunta from "./Pergunta";

import { connect } from "react-redux";
import PropTypes from "prop-types";

import { salvaScoreUsuario } from "../../actions/usuarioActions";
import { calculaScore } from "../../actions/candidatosActions";
import {
  getDadosPerguntas,
  voltaPergunta,
  passaPergunta
} from "../../actions/perguntasActions";

import Spinner from "../common/Spinner";

class PerguntasContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      respostasUsuario: {},
      arrayRespostasUsuario: [],
      indexPerguntaAtual: 0
    };
    this.passaPergunta = this.passaPergunta.bind(this);
    this.voltaPergunta = this.voltaPergunta.bind(this);
  }

  registraResposta(novaResposta) {
    let { respostasUsuario } = this.state;
    let { arrayRespostasUsuario } = this.state;
    respostasUsuario[novaResposta.id] = novaResposta.resposta;
    arrayRespostasUsuario[novaResposta.id] = novaResposta.resposta;
    this.props.salvaScoreUsuario(respostasUsuario, arrayRespostasUsuario);
    this.props.calculaScore();
  }

  passaPergunta() {
    this.props.passaPergunta();
  }

  voltaPergunta() {
    this.props.voltaPergunta();
  }

  componentDidMount() {
    const { respostasUsuario, arrayRespostasUsuario } = this.props.usuario;
    const { perguntaAtual } = this.props.perguntas;
    this.props.getDadosPerguntas();
    this.setState({
      respostasUsuario,
      arrayRespostasUsuario,
      indexPerguntaAtual: perguntaAtual
    });
  }

  render() {
    const { dadosPerguntas, perguntaAtual } = this.props.perguntas;

    const perguntas = Object.keys(dadosPerguntas).map(tema => {
      let perguntasDoTema = dadosPerguntas[tema].map(pergunta => {
        let { arrayRespostasUsuario } = this.props.usuario;
        return (
          <Pergunta
            key={pergunta.key}
            id={pergunta.key}
            pergunta={pergunta.pergunta}
            voto={arrayRespostasUsuario[pergunta.key]}
            onVota={novaResposta => this.registraResposta(novaResposta)}
          />
        );
      });

      return (
        <div key={tema} className="container">
          <h4>{tema}</h4>
          <div>{perguntasDoTema}</div>
          <div className="dropdown-divider" />
        </div>
      );
    });

    const botoesNavegacao = (
      <div>
        <div onClick={this.passaPergunta}>avançar</div>
        <div onClick={this.voltaPergunta}>voltar</div>
      </div>
    );

    return (
      <div className="container perguntas-container">
        {this.props.candidatos.isCarregando ? (
          <Spinner />
        ) : (
          <div>
            <div className="row">{perguntaAtual}</div>
            <div>{botoesNavegacao}</div>
          </div>
        )}
      </div>
    );
  }
}

PerguntasContainer.propTypes = {
  salvaScoreUsuario: PropTypes.func.isRequired,
  calculaScore: PropTypes.func.isRequired,
  getDadosPerguntas: PropTypes.func.isRequired
};
const mapStateToProps = state => ({
  usuario: state.usuarioReducer,
  candidatos: state.candidatosReducer,
  perguntas: state.perguntasReducer
});

export default connect(
  mapStateToProps,
  {
    salvaScoreUsuario,
    calculaScore,
    getDadosPerguntas,
    passaPergunta,
    voltaPergunta
  }
)(PerguntasContainer);
