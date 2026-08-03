import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Duree, Evenement, Match, Saisons } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private currentMatchSubject = new BehaviorSubject<Match|undefined>(undefined);
  currentMatch$ = this.currentMatchSubject.asObservable();

  private readonly auth = inject(AuthService);
  private readonly databaseService = inject(DatabaseService);

  public setCurrentMatch(match: Match|undefined) {
    this.currentMatchSubject.next(match);
  }
  public getCurrentMatch(): Match|undefined {
    return this.currentMatchSubject.getValue();
  }

  public emptyMatch(): Match {
    const manager = this.auth.getCurrentManager();
    
    return {
      id:'',
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
      date: new Date().toDateString(),
      equipeId: '',
      managerId: manager ? manager.id : '',
      nomAdversaire:'Eux',
      saison: Saisons[0]
    };
  }

  public getHHMM(date: Date) : string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }
  public calculerDuree(debut: string, fin: string): Duree {
    const debutPeriode = new Date(debut);
    const finPeriode = new Date(fin);
    const dureeEnSecondes = Math.floor((finPeriode.getTime() - debutPeriode.getTime()) / 1000);
    return { minute: Math.floor(dureeEnSecondes / 60), seconde: dureeEnSecondes % 60 };
  }
  public ajouterDurations(d1: Duree, d2: Duree): Duree {
    const somSec = d1.seconde + d2.seconde;
    return { minute: d1.minute + d2.minute + somSec/60, seconde: somSec % 60}
  }

  public async calculerScore(matchId: string): Promise<void> {
    const match = await this.databaseService.getMatch(matchId);
    if (!match) return Promise.resolve();
    const events = await this.databaseService.getEventsByMatch(matchId);
    match.score = {nous: 0, adversaire: 0};
    events.forEach(evt => this.appliquerScoreEvenement(evt, match));
    return this.databaseService.updateMatch(match);
  }

  private appliquerScoreEvenement(evt: Evenement, match: Match) {
    let points = 0;
    if (evt.type === 'ESSAI') { 
      if (evt.resultatTransformation && evt.resultatTransformation === 'REUSSITE') {
        points = 7;
      } else {
        points = 5;
      }
    } else if (evt.type === 'PENALITE' && evt.choixDeJeuPenalite === 'POTEAU' && evt.resultat === 'REUSSITE') {
        points = 3;
    } else if (evt.type === 'DROP' && evt.resultat === 'REUSSITE') {
        points = 3;
    }
    if (points > 0) {
      if (!evt.equipe) {
        console.error("Impossible d appliquer un score: l'evenement n'a pas d'équipe", evt);
        return;
      }
      if (!match.score) {
        match.score = { nous: 0, adversaire: 0 };
      }
      if (evt.equipe === 'NOUS') {
        match.score.nous += points;
      } else if (evt.equipe === 'ADV') {
        match.score.adversaire += points;
      }
    }
  }
}
