import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { estados } from '../../shared/constants/estados';
import { ParlamentarService } from '../../shared/services/parlamentar.service';
import { TemaService } from '../../shared/services/tema.service';
import { ComissaoService } from 'src/app/shared/services/comissao.service';
import { Tema } from '../../shared/models/tema.model';
import { Comissao } from '../../shared/models/comissao.model';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit, OnDestroy {

  @Output() filterChange = new EventEmitter<any>();

  readonly FILTRO_PADRAO_ESTADO = 'Estados';
  readonly FILTRO_PADRAO_PARTIDO = 'Partidos';
  readonly FILTRO_PADRAO_COMISSAO = 'Comissões';
  readonly FILTRO_PADRAO_COMISSAO_VALUE = '-1';
  readonly FILTRO_PADRAO_TEMA = -1;
  readonly FILTRO_PADRAO_TEMA_SLUG = 'todos';

  filtro: any;

  private unsubscribe = new Subject();

  partidosPorEstado: any[];

  estados: string[];
  partidosFiltradosPorEstado: string[];
  temas: Tema[];
  comissoes: Comissao[];

  temaSelecionado: number;
  estadoSelecionado: string;
  nomePesquisado: string;
  partidoSelecionado: string;
  comissaoSelecionada: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private parlamentarService: ParlamentarService,
    private temaService: TemaService,
    private comissaoService: ComissaoService
  ) {
    this.estados = estados;
    this.estadoSelecionado = this.FILTRO_PADRAO_ESTADO;
    this.partidoSelecionado = this.FILTRO_PADRAO_PARTIDO;
    this.temaSelecionado = this.FILTRO_PADRAO_TEMA;
    this.comissaoSelecionada = this.FILTRO_PADRAO_COMISSAO_VALUE;

    this.filtro = {
      nome: '',
      estado: this.estadoSelecionado,
      partido: this.partidoSelecionado,
      tema: this.temaSelecionado,
      temaSlug: this.FILTRO_PADRAO_TEMA_SLUG
    };
  }

  ngOnInit() {
    this.parlamentarService.getPartidosPorEstado().pipe(takeUntil(this.unsubscribe)).subscribe(
      partidos => {
        this.partidosPorEstado = partidos;
        this.onChangeEstado();
      }
    );

    this.updateFiltroViaUrl();

    this.getTemas();
    this.getComissoes();
  }

  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'Filtros para Alinhamento' });
  }

  onChangeEstado() {
    this.partidosFiltradosPorEstado = this.partidosPorEstado.filter(value => value.estado === this.estadoSelecionado)[0].partidos;

    if (!this.partidosFiltradosPorEstado.includes(this.FILTRO_PADRAO_PARTIDO)) {
      this.partidosFiltradosPorEstado.splice(0, 0, this.FILTRO_PADRAO_PARTIDO);
    }

    if (!this.partidosFiltradosPorEstado.includes(this.partidoSelecionado)) {
      this.partidoSelecionado = this.FILTRO_PADRAO_PARTIDO;
    }
  }

  aplicarFiltro() {
    this.filtro = {
      nome: this.nomePesquisado,
      estado: this.estadoSelecionado,
      partido: this.partidoSelecionado,
      tema: this.temaSelecionado,
      temaSlug: this.temaService.getTemaSlugById(this.temas, this.temaSelecionado)
    };

    this.updateUrlFiltro(this.filtro);

    this.filterChange.emit(this.filtro);
    this.modalService.dismissAll();
  }

  limparFiltro() {
    this.estadoSelecionado = this.FILTRO_PADRAO_ESTADO;
    this.partidoSelecionado = this.FILTRO_PADRAO_PARTIDO;
    this.nomePesquisado = '';
    this.temaSelecionado = this.FILTRO_PADRAO_TEMA;

    this.aplicarFiltro();
  }

  limparFiltroEstado() {
    this.estadoSelecionado = this.FILTRO_PADRAO_ESTADO;
    this.onChangeEstado();
    this.aplicarFiltro();
  }

  limparFiltroPartido() {
    this.partidoSelecionado = this.FILTRO_PADRAO_PARTIDO;
    this.aplicarFiltro();
  }

  limparFiltroTema() {
    this.temaSelecionado = this.FILTRO_PADRAO_TEMA;
    this.aplicarFiltro();
  }

  getTemas() {
    this.temaService.getTemas().pipe(takeUntil(this.unsubscribe)).subscribe((temas) => {
      this.temas = temas;
    });
  }

  getComissoes() {
    this.comissaoService.getComissoes().pipe(takeUntil(this.unsubscribe)).subscribe((comissoes) => {
      comissoes.unshift({
        id_comissao_voz: this.FILTRO_PADRAO_COMISSAO_VALUE,
        sigla: this.FILTRO_PADRAO_COMISSAO,
        nome: this.FILTRO_PADRAO_COMISSAO
      });

      this.comissoes = comissoes;
    });
  }

  isTemaSelected(idTema: number) {
    return this.temaSelecionado === idTema;
  }

  selecionaTema(idTema: number) {
    if (this.temaSelecionado === idTema) {
      this.temaSelecionado = this.FILTRO_PADRAO_TEMA;
    } else {
      this.temaSelecionado = idTema;
    }
  }

  getTemaById(id: number) {
    if (this.temas && id !== this.FILTRO_PADRAO_TEMA) {
      return this.temas.filter(tema => tema.id === id)[0].tema;
    }
  }

  private updateUrlFiltro(filtro: any) {
    const queryParams: Params = {};

    if (filtro.nome !== '' && filtro.nome !== undefined) {
      queryParams.nome = filtro.nome;
    }

    if (filtro.estado !== this.FILTRO_PADRAO_ESTADO) {
      queryParams.estado = filtro.estado;
    }

    if (filtro.partido !== this.FILTRO_PADRAO_PARTIDO) {
      queryParams.partido = filtro.partido;
    }

    if (filtro.tema !== this.FILTRO_PADRAO_TEMA) {
      queryParams.tema = filtro.tema;
    }

    this.router.navigate([], { queryParams });
  }

  private updateFiltroViaUrl() {
    this.activatedRoute.queryParams.subscribe(
      params => {
        Object.keys(params).forEach(value => {
          if (value === 'nome') {
            this.nomePesquisado = params[value];
          }
          if (value === 'estado') {
            this.estadoSelecionado = params[value];
          }
          if (value === 'partido') {
            this.partidoSelecionado = params[value];
          }
          if (value === 'tema') {
            this.temaSelecionado = Number(params[value]);
          }
        });

        this.aplicarFiltro();
      }
    );
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
