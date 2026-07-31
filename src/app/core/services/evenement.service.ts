import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeMap, Observable, of } from 'rxjs';
import { Equipe, Evenement, Match, Periode, Saisons } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private readonly auth = inject(AuthService);

  public periodeCourante: Periode = 1;

  public emptyEvenement(): Evenement {
    const d = new Date();
    return {
      id:-1,
      createdAt: new Date().toDateString(),
      equipe: 'NOUS',
      instant: d.toISOString(),
      matchId: 0,
      periode: this.periodeCourante,
      nature: 'SCORE',
      type:'ESSAI',
      rapporteurId: this.auth.getCurrentManager()!.id
    };
  }

  public calculerEvenementHeureMinute(evenement: Evenement, match: Match) {
    const debutMatch = new Date(match.debut!);
    const evtDateTime = new Date(evenement.instant);
    const dureeEnSecondes = Math.floor((evtDateTime.getTime() - debutMatch.getTime()) / 1000);
    const secondesEcoulees = dureeEnSecondes - (evenement.periode === 2 ? 15 * 60 : 0);

    evenement.minute = Math.floor(secondesEcoulees / 60);
    evenement.seconde = secondesEcoulees % 60;
  }
}
