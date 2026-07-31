import { Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeMap, Observable, of } from 'rxjs';
import { Equipe, Saison } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teamsSubject = new BehaviorSubject<Equipe[]>([]);
  teams$ = this.teamsSubject.asObservable();
  private currentTeamSubject = new BehaviorSubject<Equipe|undefined>(undefined);
  currentTeam$ = this.currentTeamSubject.asObservable();

  constructor(
    private db: DatabaseService,
    private auth: AuthService
  ) {
    this.loadTeams();
    // TODO Chargement localement l'id de l'équipe courante
    this.currentTeamSubject.next(undefined);
  }

  public myTeams(): Observable<Equipe[]> {
    return this.auth.currentManager$.pipe(
      mergeMap(user => {
        if (!user) return of([]);    
        return from(this.db.getTeamsByManager(user.id));
      })
    );
  }

  private async loadTeams() {
    const user = this.auth.getCurrentManager();
    if (!user) return;

    const teams = await this.db.getTeamsByManager(user.id);
    this.teamsSubject.next(teams);
  }

  public async addTeam(team: Omit<Equipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Equipe> {
    const user = this.auth.getCurrentManager();
    if (!user) throw new Error('User not authenticated');

    const newTeam: Omit<Equipe, 'id'> = {
      ...team,
      managerIds: [...team.managerIds, user.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = await this.db.addTeam(newTeam);
    this.teamsSubject.next([...this.teamsSubject.value, created]);
    return created;
  }

  async updateTeam(team: Equipe): Promise<void> {
    team.updatedAt = new Date().toISOString();
    await this.db.updateTeam(team);
    const updated = this.teamsSubject.value.map(t => t.id === team.id ? team : t);
    this.teamsSubject.next(updated);
  }

  async deleteTeam(teamId: number): Promise<void> {
    await this.db.deleteTeam(teamId);
    const filtered = this.teamsSubject.value.filter(t => t.id !== teamId);
    this.teamsSubject.next(filtered);
  }

  async setCurrentTeam(team: Equipe){
    this.currentTeamSubject.next(team);
    // TODO Stockage localement de l'id de l'équipe courante
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
    return {id:-1, nom: '', createdAt: '', managerIds:[], updatedAt:''};
  }
}
