import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeMap, Observable, of } from 'rxjs';
import { Equipe, Saison } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly db =  inject(DatabaseService);
  private readonly auth = inject(AuthService);

  private currentTeamSubject = new BehaviorSubject<Equipe|undefined>(undefined);
  public currentTeam$ = this.currentTeamSubject.asObservable();

  public myTeams(): Observable<Equipe[]> {
    return this.auth.currentManager$.pipe(
      mergeMap(user => {
        if (!user) return of([]);    
        return from(this.db.getTeamsByManager(user.id));
      })
    );
  }

  public async addTeam(team: Omit<Equipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipe> {
    const user = this.auth.getCurrentManager();
    if (!user) throw new Error('User not authenticated');

    const newTeam: Omit<Equipe, 'id'> = {
      ...team,
      managerIds:  this.unique([...team.managerIds, user.id]),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return await this.db.addTeam(newTeam);
  }

  public async updateTeam(team: Equipe): Promise<void> {
    team.updatedAt = new Date().toISOString();
    team.managerIds = this.unique(team.managerIds);
    await this.db.updateTeam(team);
  }

  public async deleteTeam(teamId: number): Promise<void> {
    await this.db.deleteTeam(teamId);
  }

  public async setCurrentTeam(team: Equipe|undefined){
    this.currentTeamSubject.next(team);
    // TODO Stockage localement de l'id de l'équipe courante
  }
  public getCurrentTeam(): Equipe|undefined {
    return this.currentTeamSubject.getValue();
  }

  public currentSeason(): Saison {
    const curYear = Number(new Date().getFullYear());
    if (new Date().getMonth() < 6) {
      return ((curYear-1) + '/' + curYear) as Saison;
    } else {
      return (curYear + '/' + (curYear+1)) as Saison;
    }    
  }
  public emptyTeam(): Equipe {
    return {id:-1, nom: '', createdAt: '', managerIds:[], updatedAt:'', };
  }
  private unique(values: string[]): string[] {
    return [...new Set(values)];
  }
}
