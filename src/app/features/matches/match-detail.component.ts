import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '@core/services/database.service';
import { TeamService } from '@core/services/team.service';
import { MatchService } from '@core/services/match.service';
import { Equipe, Evenement, Match } from '@core/models/datamodel';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    @if (match()) {
    <section>
      <h2>Match contre <br>{{match().nomAdversaire}} <i class="fa fa-pencil link" aria-hidden="true" (click)="editMatch()"></i></h2>
      <div class="match-info" aria-label="Informations du match">
        <div>Saison : {{ match().saison }} · Lieu : {{ match().lieu || 'Non renseigné' }}</div>
        <div>Date : {{ match().date | date:'yyyy/MM/dd' }} · Début : {{ match().debut || 'Non renseigné' }}@if (match().fin) { · Fin : {{ match().fin }} }</div>
        <div>Terrain : {{ match().terrain || 'Non renseigné' }} · Conditions : {{ match().conditions || 'Non renseignées' }}</div>
        <div>Score {{ match().fin ? 'final' : ' actuel'}} : {{ match().score.nous }} - {{ match().score.adversaire }}</div>
      </div>
      
      <h3>Liste des événements</h3>
      <div class="events-list">
        @for (event of events(); track event.id) {
          <p-card>
            <div class="event-header" (click)="viewEvent(event)">
              <span>{{ event.instant | date: 'HH:mm:ss' }} : {{ event.nature }} - {{ event.type }} </span>
              <strong>{{ 
                event.equipe === 'NOUS' 
                ? 'Nous' 
                : event.equipe === 'ADV' ? match().nomAdversaire : ""
              }}</strong>
            </div>
            @if (event.commentaire) {
              <div>{{ event.commentaire }}</div>
            }
          </p-card>
        } @empty {
          <p>Aucun événement enregistré.</p>
        }
      </div>

    </section>
    <div class="buttons">
      <p-button icon="pi pi-plus" rounded="true" size="large" (click)="createEvent()"></p-button>
    </div>  
    }
    `,
  styles: [`
    section {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 5px;
    }
    h2 {
      text-align: center;
    }
    h3 {
      margin: 20px 0 10px 0;
    }

    .match-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: fit-content;
      margin: 1rem auto 0;
      text-align: center;
    }
    .events-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .event-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
    }
    .buttons {
      position: absolute;
      bottom: 90px;
      right: 10px;
    }
    .buttons pi{
      font-weight: bold;
      font-size: 1.5rem;
    }
    .link:hover {
      cursor: pointer;
    }
    `]
})
export class MatchDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly db = inject(DatabaseService);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);

  readonly team = signal<Equipe>(this.teamService.emptyTeam());
  readonly match = signal<Match>(this.matchService.emptyMatch());
  readonly events = signal<Evenement[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  async ngOnInit() {
    // chargement du match
    if (! await this.loadMatch()) {
      this.router.navigate(['/app/home']);
      return;
    }
    this.matchService.setCurrentMatch(this.match())
    this.teamService.setCurrentTeam(this.team())
    // chargement de la liste des événements
    this.loadMatchEvents();
  }
  private async loadMatch(): Promise<Match|undefined> {
    try {
      const matchId = this.route.snapshot.paramMap.get('matchId');
      if (!matchId) {
        this.error.set('Aucun identifiant de match fourni dans l url');
        return undefined;
      }
      const m = await this.db.getMatch(+matchId);
      if (!m) {
        this.error.set('Match introuvable: '+matchId);
        return undefined;
      }
      this.match.set(m);

      const team = await this.db.getTeam(this.match().equipeId);
      if (!team) {
        this.error.set('Match avec une équipe introuvable: '+this.match().equipeId);
        return undefined;
      }
      this.team.set(team);

      return this.match();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de charger le match.');
      return undefined;
    }    
  }

  private async loadMatchEvents() {
    this.events.set(await this.db.getEventsByMatch(this.match().id));
  }
  createEvent() {
    this.router.navigate([`/app/match/${this.match().id}/event/new`]);
  }
  viewEvent(event: Evenement) {
    this.router.navigate([`/app/event/${event.id}/edit`]);
  }
  editMatch() {
    this.router.navigate([`/app/match/${this.match().id}/edit`]);
  }
}
