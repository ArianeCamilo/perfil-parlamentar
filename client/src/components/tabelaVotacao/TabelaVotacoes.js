import React, { Component } from "react";
import {Table} from 'reactstrap';

import { connect } from "react-redux";
import PropTypes from "prop-types";

class TabelaVotacoes extends Component{
    render(){
        const {dadosCandidatos} = this.props;
        const {dadosPerguntas} = this.props.perguntas;
        const {arrayRespostasUsuario} = this.props.usuario;

        const perguntas = []
        Object.keys(dadosPerguntas).map(tema => (
            dadosPerguntas[tema].map(p => {
                return perguntas.push(p.pergunta)
            })
        ))

        let votacoesCandidato = dadosCandidatos.respostas;

        function getValorVotacao(num) {
            switch (num) {
                case 1:
                    return "Sim";
                    break;
                case 0:
                    return "Não respondeu";
                    break;
                case -1:
                    return "Não";
                    break;
                case -2:
                    return "Não sabe";
                    break;
            }
          }


        return(
            <Table>
                <thead>
                <tr>
                    <th>Tema</th>
                    <th>Votos de {dadosCandidatos.nome.substr(0,dadosCandidatos.nome.indexOf(' '))}</th>
                    <th>Seus votos</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                        {}
                        <td>{perguntas[0]}</td>
                        <td>{getValorVotacao(votacoesCandidato[0])}</td>
                        <td>{getValorVotacao(arrayRespostasUsuario[0])}</td>
                    </tr>
                </tbody>
            </Table>
        )
    }
}
TabelaVotacoes.propTypes = {
  };
  const mapStateToProps = state => ({
    usuario: state.usuarioReducer,
    perguntas: state.perguntasReducer
  });
  
  export default connect(
    mapStateToProps,
    { }
  )(TabelaVotacoes);