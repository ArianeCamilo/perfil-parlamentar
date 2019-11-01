import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { ParlamentarService } from 'src/app/shared/services/parlamentar.service';
import { ParlamentarInvestimento } from 'src/app/shared/models/parlamentarInvestimento.model';

@Component({
  selector: 'app-capital',
  templateUrl: './capital.component.html',
  styleUrls: ['./capital.component.scss']
})
export class CapitalComponent implements OnInit {

  private unsubscribe = new Subject();

  parlamentar: ParlamentarInvestimento;

  constructor(
    private activatedroute: ActivatedRoute,
    private parlamentarService: ParlamentarService) { }

  ngOnInit() {
    this.activatedroute.parent.params.pipe(take(1)).subscribe(params => {
      this.getParlamentarById(params.id);
    });
  }

  getParlamentarById(id: string) {
    this.parlamentarService
      .getInvestimentoById(id)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        parlamentar => {
          this.parlamentar = parlamentar;
        },
        error => {
          console.log(error);
        }
      );
  }

}