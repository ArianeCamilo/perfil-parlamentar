import React, { Component } from "react";

import { Link } from "react-router-dom";

import { connect } from "react-redux";

import { isMobile } from "react-device-detect";

import "./navbar.css";

class Navbar extends Component {
  onSignInWithGoogle(e) {
    e.preventDefault();

    this.props.loginUser();
  }

  onSignOut(e) {
    e.preventDefault();

    this.props.logoutUser();
  }

  render() {
    let linkCompartilhamento = "www.vozativa.org/";
    let textoCompartilhamento =
      "Nos diga o que você defende e em oito minutos a gente apresenta candidatos alinhados com você. " +
      linkCompartilhamento;
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container">
            <Link to="/" className="navbar-brand">
              <img
                src={require("../../../data/img/logo.png")}
                alt="Voz Ativa"
                width="100px"
              />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#mainNavbar"
              aria-expanded="false"
              aria-label="Menu"
            >
              <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="mainNavbar">
              <ul className="navbar-nav ml-auto pr-3">
                <li className="nav-item">
                  <Link to="/sobre" className="nav-link">
                    Sobre
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/soucandidato" className="nav-link">
                    Sou candidato
                  </Link>
                </li>
              </ul>
              <span className="navbar-text navbar-text-strong">
                compartilhe
              </span>
              <ul className="navbar-nav navbar-inline">
                <li className="nav-item">
                  <a
                    href={
                      "https://twitter.com/intent/tweet/?text=" +
                      textoCompartilhamento
                    }
                    data-show-count="false"
                    className="nav-link nav-strong"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="icon-twitter share-icon" />
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href={
                      "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fvozativa.org%2F&amp;src=sdkpreparse"
                    }
                    data-show-count="false"
                    className="nav-link nav-strong"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="icon-facebook share-icon" />
                  </a>
                </li>
                {!isMobile && (
                  <li className="nav-item">
                    <a
                      href={
                        "https://web.whatsapp.com/send?text=" +
                        textoCompartilhamento
                      }
                      data-show-count="false"
                      className="nav-link nav-strong"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="icon-zapzap share-icon" />
                    </a>
                  </li>
                )}
                {isMobile && (
                  <li className="nav-item">
                    <a
                      href={"whatsapp://send?text=" + textoCompartilhamento}
                      className="nav-link"
                    >
                      <span className="icon-zapzap share-icon" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  {}
)(Navbar);
