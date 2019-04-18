import { Component, OnChanges, AfterContentInit, Input, SimpleChanges } from '@angular/core';

import * as d3 from 'd3';
import * as sl from 'sainte-lague';

import { Parlamentar } from '../../shared/models/parlamentar.model';

@Component({
  selector: 'app-congresso-chart',
  template: '<div id="chart-parlamento" class="mb-4"></div>',
  styleUrls: ['./congresso-chart.component.scss']
})
export class CongressoChartComponent implements AfterContentInit, OnChanges {
  @Input() parlamentares: any[];
  @Input() view: any;

  svg: any;
  g: any;
  circles: any;
  color: any;
  width: number;
  height: number;
  margin: any;
  r: number;
  length: number;

  constructor() {
    this.length = 0;
  }

  ngAfterContentInit() {
    this.width = 500;
    this.height = 600;
    this.margin = {
      left: 20,
      right: 20,
      top: 20,
      bottom: 20
    };
    this.r = 5;
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      typeof changes.parlamentares !== 'undefined' &&
      typeof changes.parlamentares.currentValue !== 'undefined' &&
      changes.parlamentares.currentValue.length
    ) {
      this.parlamentares = JSON.parse(JSON.stringify(changes.parlamentares.currentValue));
      this.draw(this.parlamentares).then(resolve => {
        this.paint(this.parlamentares);
      });
    }
    if (
      typeof changes.view !== 'undefined' &&
      typeof changes.view.currentValue !== 'undefined' &&
      !changes.view.firstChange
    ) {
      if (changes.view.currentValue === 'lg') {
        this.showArc();
      } else {
        this.showBeeswarm();
      }
    }
  }

  initChart() {
    this.svg = d3
      .select('#chart-parlamento')
      .append('svg')
      .attr('version', '1.1')
      .attr('xmlns:svg', 'http://www.w3.org/2000/svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('viewBox', '0 0 ' + this.width + ' ' + this.height);

    this.g = this.svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    this.color = d3
      .scaleThreshold<string, string>()
      // .range(['#b2182b','#ef8a62','#fddbc7','#f7f7f7','#d1e5f0','#67a9cf','#2166ac'])
      .range(d3.schemePRGn[7])
      .domain(['0.3', '0.4', '0.5', '0.6', '0.7', '0.8']);
  }

  draw(parlamentares: any[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.g.selectAll('.circle-parlamentar').remove();
      const inicioArco = 20;
      const fimArco = 440;
      const alturaArco = 200;
      const distanciaFilas = 12;
      const angulo = 20;

      const xBeeSwarm = d3.scaleLinear().range([this.width * 0.7, 0]);
      const simulation = d3
        .forceSimulation(this.parlamentares)
        .force('x', d3.forceX((d: any) => xBeeSwarm(d.alinhamento.alinhamento)).strength(1))
        .force('y', d3.forceY(this.height * 0.5))
        .force('collide', d3.forceCollide(this.r))
        .stop();
      for (let i = 0; i < 120; ++i) {
        simulation.tick();
      }

      const camara = this.getFilas(parlamentares);
      for (let i = 0; i < 13; i++) {
        const [p1, p2, p3] = [
          [inicioArco + (distanciaFilas * i), alturaArco],
          [fimArco - (distanciaFilas * i), alturaArco],
          [angulo + (distanciaFilas * i), alturaArco - 100]];
        const [rad, flag1, flag2] = this.arcviaslope([p1[0], p1[1]], [p2[0], p2[1]], [p3[0], p3[1]]);

        const
          arc = this.g.append('path')
            .attr('fill', 'none')
            // .attr('stroke-width', '1.5px')
            // .attr('stroke', 'black')
            .attr('d', rad && `M${p1[0]},${p1[1]} A${rad},${rad},0,${flag1},${flag2},${p2[0]},${p2[1]}`);

        const length = arc.node().getTotalLength();

        const xArc = d3.scaleLinear().domain([0, camara[i].length - 1]).range([0, length]);

        this.circles = this.g.selectAll()
          .data(camara[i])
          .enter()
          .append('circle')
          .attr('id', (d) => 'circle-parlamentar-' + d.idParlamentar)
          .attr('class', 'circle-parlamentar')
          .attr('r', this.r)
          .attr('fill', 'white')
          .attr('stroke', 'none')
          .attr('cx', (d, z) => {
            d.arcX = arc.node().getPointAtLength(xArc(z)).x;
            return arc.node().getPointAtLength(xArc(z)).x;
          })
          .attr('cy', (d, w) => {
            d.arcY = arc.node().getPointAtLength(xArc(w)).y;
            return arc.node().getPointAtLength(xArc(w)).y;
          })
          .attr('opacity', 1)
          .on('mouseover', (d) => console.log(d));

      }
      resolve(true);
      return;
    });
  }

  paint(parlamentares: Parlamentar[]) {
    this.g.selectAll('.circle-parlamentar')
      .transition()
      .ease(d3.easeCubicOut)
      .duration((d, i) => i * 5)
      .delay(500)
      .attr('fill', (d) => this.color(d.alinhamento.alinhamento));
  }

  showArc() {
    this.g.selectAll('.circle-parlamentar')
      .transition()
      .duration((d) => d.alinhamento.alinhamento * 1000 + 300)
      .delay(250)
      .attr('cx', d => d.arcX)
      .attr('cy', d => d.arcY);
  }

  showClusters(view: string) {

  }

  showBeeswarm() {
    this.g.selectAll('.circle-parlamentar')
      .transition()
      .duration((d) => d.alinhamento.alinhamento * 1000 + 300)
      .delay(250)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  getFilas(parlamentares: Parlamentar[]) {
    const filas = [60, 57, 53, 50, 46, 43, 39, 36, 33, 29, 26, 22, 19];
    const camara = new Array();

    const grupos = d3.nest()
      .key((d: Parlamentar) => this.color(d.alinhamento.alinhamento))
      .entries(parlamentares);

    const distribuicao = grupos.map(g => g.values.length);

    for (const f of filas) {
      const g = sl(distribuicao, f);

      const fila = [];
      for (let j = 0; j < grupos.length; j++) {
        fila.push(...grupos[j].values.splice(0, g[j]));
      }
      camara.push(fila);
    }

    return camara;
  }

  // getFilas(parlamentares: any[]) {
  //   let camara = [];
  //   let cadeiras = 58;
  //   const distanciaCadeiras = 3;
  //   let total = parlamentares.length;
  //   while (total > 0) {
  //     let inicio = parlamentares.length - total;
  //     const fila = parlamentares.slice(inicio, cadeiras + inicio);
  //     camara.push(fila);
  //     total = total - cadeiras;
  //     cadeiras = cadeiras - distanciaCadeiras;
  //   }
  //   console.log(camara);
  //   return camara;
  // }

  // [pA1, pA2], [pB1, pB2], [pP1, pP2]
  arcviaslope([pA1, pA2], [pB1, pB2], [pP1, pP2]) {
    // vectors t from P -> A, v from A -> B
    const [t1, t2] = [pA1 - pP1, pA2 - pP2];
    const [v1, v2] = [pB1 - pA1, pB2 - pA2];

    const tdotv = t1 * v1 + t2 * v2;
    const twedgev = t1 * v2 - t2 * v1;
    const tvCtg = tdotv / twedgev;
    const vv = v1 * v1 + v2 * v2;

    const radius = (1 / 2) * Math.sqrt(vv * (1 + tvCtg * tvCtg));
    const largeArcFlag = +(tdotv > 0);
    const sweepFlag = +(!(twedgev > 0)); // ab_cotangent > 1;

    return [radius, largeArcFlag, sweepFlag];
  }

}
