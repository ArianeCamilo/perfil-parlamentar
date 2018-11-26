import React, { Component } from "react";

// Containers imports
import Questionario from "../../questionario/QuestionarioContainer";
import PerguntasContainer from "../../perguntas/PerguntasContainer";
import CandidatosContainer from "../../candidatos/CandidatosContainer";
import { isMobile } from "react-device-detect";
import ScrollIntoView from "react-scroll-into-view";
import ScrollIntoViewOnChange from "../../../scroll/scrollIntoViewOnChange";
import StickyBox from "react-sticky-box";

import querystring from "query-string";

// Redux stuff
import { connect } from "react-redux";
import PropTypes from "prop-types";
//
// Actions
import {
  getDadosCandidatos,
  setFiltroCandidatos,
  calculaScore,
  setPartidos,
  verTodosEleitos,
  mostrarTodosCandidatos,
  setActiveTab
} from "../../../actions/candidatosActions";

import { facebookLoginComCodigo } from "../../../actions/authActions";

import {
  vamosComecar,
  escondePerguntas
} from "../../../actions/perguntasActions";
import { salvaScoreUsuario } from "../../../actions/usuarioActions";

import {
  getArrayUrl,
  getDict,
  votosValidos,
  estadoValido
} from "../../../constantes/tratamentoUrls";

import FlipMove from "react-flip-move";

// CSS imports
import "./home.css";

// Import função de estado
import { estados } from "../../../constantes/filtrosSeletoresCandidatos";

class Home extends Component {
  constructor(props) {
    super(props);

    this.selecionaEstado = this.selecionaEstado.bind(this);
    this.vamosComecar = this.vamosComecar.bind(this);
    this.mostrarTodos = this.mostrarTodos.bind(this);
    this.salvaRespostasCache = this.salvaRespostasCache.bind(this);
  }

  mostrarTodos() {
    this.props.verTodosEleitos();
    this.props.mostrarTodosCandidatos();
  }

  selecionaEstado(e) {
    e.preventDefault();

    const novoFiltroEstado = {
      nome: "",
      partido: "Partidos",
      estado: e.target.value,
      reeleicao: "-1",
      respondeu: "-1"
    };

    //if(!isMobile) this.props.verTodosEleitos();
    // if (isMobile) this.props.escondePerguntas();

    if (novoFiltroEstado.estado === "TODOS") {
      this.props.setActiveTab("eleitos");
    }

    this.props.setFiltroCandidatos(novoFiltroEstado);
    this.props.getDadosCandidatos();
  }

  vamosComecar(e) {
    e.preventDefault();
    this.props.vamosComecar();
  }

  componentDidMount() {
    if (!isMobile) this.props.vamosComecar();
    const { votos, estado } = this.props.match.params;

    const parsed = querystring.parse(this.props.location.search);

    if (parsed.state === "facebookdirect") {
      this.props.facebookLoginComCodigo(parsed.code);
      this.props.history.push("/");
    }

    if (votos && estado) {
      if (votosValidos(votos) && estadoValido(estado)) {
        const arrayVotosUsuario = getArrayUrl(votos);
        const votosUsuario = getDict(arrayVotosUsuario);

        const filtroEstado = {
          nome: "",
          partido: "Partidos",
          estado: estado
        };

        this.props.setFiltroCandidatos(filtroEstado);
        this.props.getDadosCandidatos();

        this.props.salvaScoreUsuario(votosUsuario, arrayVotosUsuario);
        this.props.vamosComecar();
        this.props.history.push("/");
      } else {
        this.props.history.push("/");
      }
    }

    window.addEventListener("beforeunload", this.salvaRespostasCache);
  }

  salvaRespostasCache() {
    const { respostasUsuario, arrayRespostasUsuario } = this.props.usuario;
    console.log(respostasUsuario);
    localStorage.setItem("respostasUsuario", JSON.stringify(respostasUsuario));
    localStorage.setItem("arrayRespostasUsuario", arrayRespostasUsuario);
  }

  componentWillUnmount() {
    this.salvaRespostasCache();
    window.removeEventListener("beforeunload", this.salvaRespostasCache);
  }

  render() {
    const { filtro, isVerTodosEleitos } = this.props.candidatos;
    const { isVamosComecar } = this.props.perguntas;
    const { quantidadeVotos } = this.props.usuario;

    let linkCompartilhamento = "www.vozativa.org/";
    let textoCompartilhamento =
      "Nos diga o que você defende e em oito minutos a gente apresenta candidatos alinhados com você. " +
      linkCompartilhamento;

    let barraCompartilhamento = (
      <StickyBox offsetTop={20} offsetBottom={20} offsetRight={20}>
        <ul className="share-box">
          <li className="share-element">
            <a
              href={
                "https://twitter.com/intent/tweet/?text=" +
                textoCompartilhamento
              }
              data-show-count="false"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-twitter share-icon btn btn-link btn-icon"
            />
          </li>
          <li className="share-element">
            <a
              href={
                "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fvozativa.org%2F&amp;src=sdkpreparse"
              }
              data-show-count="false"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-facebook share-icon btn btn-link btn-icon"
            />
          </li>
          <li className="share-element">
            <a
              href={
                "https://web.whatsapp.com/send?text=" + textoCompartilhamento
              }
              data-show-count="false"
              target="_blank"
              rel="noopener noreferrer"
              className="icon-zapzap share-icon btn btn-link btn-icon"
            />
          </li>
        </ul>
      </StickyBox>
    );

    return (
      <div>
        {!isMobile && barraCompartilhamento}
        <section className="intro">
          <div className="container">
            <h2 className="intro-title text-center">
              Descubra quais deputados/as e candidatos/as são{" "}
              <strong className="strong">alinhados</strong> com você.
            </h2>
            <div className="d-flex justify-content-center">
              <form>
                <div className="form-group">
                  {isMobile ? (
                    <ScrollIntoViewOnChange selector="#candidatos">
                      <select
                        className="form-control"
                        onChange={this.selecionaEstado}
                        value={filtro.estado}
                      >
                        <option defaultValue="--">Selecione um Estado</option>
                        {estados()}
                      </select>
                    </ScrollIntoViewOnChange>
                  ) : (
                      <select
                        className="form-control"
                        onChange={this.selecionaEstado}
                        value={filtro.estado}
                      >
                        <option defaultValue="--">Selecione um Estado</option>
                        {estados()}
                      </select>
                    )}
                </div>
              </form>
            </div>
          </div>
        </section>

        <div className="grid-wrapper" id="candidatos">
          <div className="grid-main">
            <section className="grid-panel panel-master">
              <FlipMove>
                {filtro.estado !== "" && <CandidatosContainer />}
                <div className="d-flex justify-content-center mb-3">
                  {isMobile && !isVamosComecar && filtro.estado !== "" && (
                    <div className="pr-1">
                      <ScrollIntoView selector="#scroll">
                        <button
                          className="btn btn-secondary"
                          onClick={this.vamosComecar}
                        >
                          Votar
                        </button>
                      </ScrollIntoView>
                      <div id="scroll" />
                    </div>
                  )}
                  {filtro.estado !== "" &&
                    !isVerTodosEleitos &&
                    quantidadeVotos < 1 && (
                      <div>
                        <button
                          className="btn btn-secondary"
                          onClick={this.mostrarTodos}
                        >
                          Ver Eleitos
                        </button>
                      </div>
                    )}
                </div>
              </FlipMove>
            </section>
            {filtro.estado !== "" && <div className="grid-separator" />}
            <section className="grid-panel panel-detail">
              <FlipMove>
                {filtro.estado !== "" && isVamosComecar && (
                  <Questionario />
                )}
              </FlipMove>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  getDadosCandidatos: PropTypes.func.isRequired,
  setFiltroCandidatos: PropTypes.func.isRequired,
  calculaScore: PropTypes.func.isRequired,
  setPartidos: PropTypes.func.isRequired,
  salvaScoreUsuario: PropTypes.func.isRequired,
  escondePerguntas: PropTypes.func.isRequired,
  verTodosEleitos: PropTypes.func.isRequired,
  mostrarTodosCandidatos: PropTypes.func.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  facebookLoginComCodigo: PropTypes.func.isRequired
};
const mapStateToProps = state => ({
  candidatos: state.candidatosReducer,
  perguntas: state.perguntasReducer,
  usuario: state.usuarioReducer
});

export default connect(
  mapStateToProps,
  {
    getDadosCandidatos,
    setFiltroCandidatos,
    calculaScore,
    vamosComecar,
    setPartidos,
    salvaScoreUsuario,
    escondePerguntas,
    verTodosEleitos,
    mostrarTodosCandidatos,
    setActiveTab,
    facebookLoginComCodigo
  }
)(Home);
