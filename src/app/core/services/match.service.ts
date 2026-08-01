import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeMap, Observable, of } from 'rxjs';
import { Equipe, Evenement, Match, Saisons } from '@core/models/datamodel';
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
    return {
      id:-1,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
      date: new Date().toDateString(),
      equipeId: 0,
      managerId: this.auth.getCurrentManager()!.id,
      nomAdversaire:'Eux',
      saison: Saisons[0],
      score: { 
        adversaire:0,
        nous: 0
      }
    };
  }

  public getHHMM(date: Date) : string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  }

  public async calculerScore(matchId: number): Promise<void> {
    const match = await this.databaseService.getMatch(matchId);
    if (!match) return Promise.resolve();
    const events = await this.databaseService.getEventsByMatch(matchId);
    match.score.nous = 0;
    match.score.adversaire = 0;
    events.filter(evt => evt.nature === 'SCORE')
      .forEach(evt => this.appliquerEvenement(evt, match));
    return this.databaseService.updateMatch(match);
  }

  private appliquerEvenement(evt: Evenement, match: Match) {
    if (evt.nature !== 'SCORE') return;
    if (evt.type !== 'ESSAI') {
      if (!evt.resultat) {
        console.error("Impossible d appliquer un score: l'evenement n'a pas de resultat", evt);
        return;
      }
      if (evt.resultat !== 'REUSSITE') return;
    }

    let points = 0;
    switch(evt.type) {
      case 'ESSAI' : points = 5;
        break;
      case 'PENALITE' :
      case 'DROP' : 
        points = 3;
        break;
      case 'TRANSFORMATION' : 
        points = 2;
        break;
      default: 
        console.error("Impossible d appliquer un score: l'evenement de nature score n'est pas géré", evt);
        return;
    }
    if (!evt.equipe) {
      console.error("Impossible d appliquer un score: l'evenement n'a pas d'équipe", evt);
      return;
    }
    if (evt.equipe === 'NOUS') {
      match.score.nous += points;
    } else if (evt.equipe === 'ADV') {
      match.score.adversaire += points;
    }
  }
}
