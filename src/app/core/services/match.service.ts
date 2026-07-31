import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeMap, Observable, of } from 'rxjs';
import { Equipe, Match, Saisons } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private currentMatchSubject = new BehaviorSubject<Match|undefined>(undefined);
  currentMatch$ = this.currentMatchSubject.asObservable();

  private readonly auth = inject(AuthService);

  public setcurrentMatch(match: Match) {
    this.currentMatchSubject.next(match);
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
}
