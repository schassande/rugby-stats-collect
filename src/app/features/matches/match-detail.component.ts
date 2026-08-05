import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService } from '@core/services/database.service';
import { TeamService } from '@core/services/team.service';
import { MatchService } from '@core/services/match.service';
import { Duree, Equipe, Evenement, Match } from '@core/models/datamodel';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MatchDashboardComponent } from './match-dashboard.component';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, MatchDashboardComponent],
  template: `
    @if (match()) {
    <section>
      <h2>Match contre <br>{{match().nomAdversaire}}</h2>
      <div class="match-info" aria-label="Informations du match">
        <div>Saison : {{ match().saison }} · Lieu : {{ match().lieu || 'Non renseigné' }}</div>
        <div>Date : {{ match().date | date:'yyyy/MM/dd' }}
          @if(match().temps?.debutMatch) {
           · Début : {{ match().temps?.debutMatch | date:'HH:mm' }}
           @if (match().temps?.finMatch) { · Fin : {{ match().temps?.finMatch | date:'HH:mm' }} }
          }
        </div>
        <div>Temps de jeu: 
          @if (match().temps?.duree1ereMiTemps) { {{match().temps?.duree1ereMiTemps?.minute}}min }
          @if (match().temps?.duree2iemeMiTemps) { + {{match().temps?.duree2iemeMiTemps?.minute}}min }
        </div>
        <div>Terrain : {{ match().terrain || 'Non renseigné' }} · Conditions : {{ match().conditions || 'Non renseignées' }}</div>
        @if (match().score) {
          <div>Score {{ match().temps?.finMatch ? 'final' : ' actuel'}} : {{ match().score?.nous ?? 0 }} - {{ match().score?.adversaire ?? 0}}</div>
        }
        <div><i class="fa fa-pencil link" aria-hidden="true" (click)="editMatch()"></i></div>
      </div>
      <div class="match-timing-buttons">
        @if (!match().temps?.debutMatch) {
          <p-button size="large" (click)="debuterMatch()">Débuter le match</p-button>
        } @else if (!match().temps?.fin1ereMiTemps) {
          <p-button size="large" (click)="fin1ereMiTemps()">Fin de la 1ère mi-temps</p-button>
        } @else if (!match().temps?.debut2iemeMiTemps) {
          <p-button size="large" (click)="debut2iemeMiTemps()">Débuter la 2nd mi-temps</p-button>
        } @else if (!match().temps?.finMatch) {
          <p-button size="large" (click)="finMatch()">Fin du match</p-button>
        }
      </div>
      
      <h3>Vue synthétique</h3>
      <app-match-dashboard [team]="team()" [match]="match()" [events]="events()" />

      <h3>Chronologie des événements</h3>
      <div class="events-list">
        <div class="event-list-header">
          <div class="column-NOUS-header"><strong>Nous</strong></div>
          <div class="column-ADV-header"><strong>{{match().nomAdversaire}}</strong></div>
        </div>
        @for (event of events(); track event.id) {
          @if (event.nature !== 'TEMPS') {
            <p-card class="column-{{event.equipe}}">
              <div class="event-header" (click)="viewEvent(event)">
                <span>{{ event.periode}}-{{ event.minute}}' : 
                @if (event.nature === 'SCORE') {
                  @if (event.type === 'ESSAI') {
                    <span>Essai {{ event.resultatTransformation == 'REUSSITE' ? '' : 'non'}} transformé, position: {{ event.positionLargeur }}</span>
                  } @else if (event.type === 'DROP') {
                    <span>Drop {{ event.resultat == 'REUSSITE' ? 'réussi' : 'raté'}} à {{ event.distanceJeuPied }}m, position: {{ event.positionLargeur }}</span>
                  }
                } @else if (event.nature === 'CONQUETE') {
                  @if (event.type === 'MELEE') {
                    <span>Mêlée {{ event.resultatMelee}}, 
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                    </span>
                  } @else if (event.type === 'TOUCHE') {
                    <span>Touche {{ event.resultatTouche}}, lancé en zone {{event.zoneLancee}}
                      <div class="event-desc-row">dans {{event.zoneTerrain}}</div>
                    </span>
                  } @else if (event.type === 'MAUL') {
                    <span>Maul conclu par {{ event.resultatMaul}}
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                    </span>
                  } @else if (event.type === 'CHANDELLE') {
                    <span>Chandelle {{ event.resultat == 'REUSSITE' ? '' : 'non'}} récupérée
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                    </span>
                  } @else if (event.type === 'RENVOI') {
                    <span>Renvoi {{ event.resultat == 'REUSSITE' ? '' : 'non'}} récupérée
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                    </span>
                  } @else {
                    <span>{{ event.nature }} - {{ event.type }} </span>
                  }
                } @else if (event.nature === 'FAIT_DE_JEU') {
                  @if (event.type === 'DEGAGEMENT_TOUCHE') {
                    <span>Dégagement en touche {{ event.resultat == 'REUSSITE' ? 'réussi' : 'raté'}}, depuis {{event.zoneTerrain}}
                      @if (event.distanceJeuPied &&  event.distanceJeuPied > 0) {  
                        <span>, coup de pied de {{event.distanceJeuPied}}m</span>
                      }
                    </span>
                  } @else if (event.type === 'RUCK') {
                    <span>Ruck {{ event.resultRuck }},
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                    </span>
                  } @else if (event.type === 'ARRET_VOLEE') {
                    <span>Arrêt de volée dans la zone {{ event.positionLargeur }} </span>
                  } @else if (event.type === '50_22') {
                    <span>50/22 {{ event.resultat === 'REUSSITE' ? 'réussi' :  'manqué' }}</span>
                  } @else if (event.type === 'INTERCEPTION') {
                    <span>Interception dans {{event.zoneTerrain}}</span>
                  } @else {
                    <span>{{ event.nature }} - {{ event.type }} </span>
                  }
                } @else if (event.nature === 'ERREUR') {
                  @if (event.type === 'EN_AVANT') {
                    <span>En avant dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</span>
                  }@else if (event.type === 'COUP_EN_TOUCHE_DIRECT') {
                    <span>Jeu au pied direct en touchee depuis {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</span>
                  }@else if (event.type === 'SORTIE_TOUCHE') {
                    <span>Sortie des limites du terrain {{event.zoneTerrain}}</span>
                  } @else {
                    <span>{{ event.nature }} - {{ event.type }} </span>
                  }
                } @else if (event.nature === 'DISCIPLINE') {
                  @if (event.type === 'PENALITE') {
                    <span>Pénalité obtenu pour {{event.fautesPenalite}}, 
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                      @if (event.complementDiscipline) {
                        <div class="event-desc-row">{{event.complementDiscipline}} 
                          @if (event.numeroJoueur1) {
                            pour le joueur {{event.numeroJoueur1}}
                          }
                        </div>
                      }
                      <div class="event-desc-row">Choix de jeu: 
                      @if (event.choixDeJeuPenalite === 'POTEAU') {
                        tapée @if (event.resultat == 'REUSSITE') { et réussie } @else { mais manquée } 
                      } @else if (event.choixDeJeuPenalite === 'TOUCHE') {
                        tapée en touche
                      } @else if (event.choixDeJeuPenalite === 'MAIN') {
                        jouée à la main
                      } @else if (event.choixDeJeuPenalite === 'MELEE') {
                        convertie en une mêlée
                      }
                      </div>
                    </span>
                  } @else if (event.type === 'BRAS_CASSE') {
                    <span>Bras cassé obtenu pour {{event.fautesBrasCasse}}, 
                      <div class="event-desc-row">dans {{event.zoneTerrain}}, position: {{ event.positionLargeur }}</div>
                      <div class="event-desc-row">Choix de jeu: 
                      @if (event.choixDeJeuPenalite === 'TOUCHE') {
                        Joué en touche
                      } @else if (event.choixDeJeuPenalite === 'MAIN') {
                        Joué à la main
                      } @else if (event.choixDeJeuPenalite === 'MELEE') {
                        Converti en une mêlée
                      }
                      </div>
                    </span>
                    
                  } @else {
                    <span>{{ event.nature }} - {{ event.type }} </span>
                  }
                } @else if (event.nature === 'REMPLACEMENT') {
                  @if (event.type === 'NORMAL') {
                    Remplacement normal du {{event.numeroJoueur1}} par le {{event.numeroJoueur2}}
                  } @else if (event.type === 'BLESSURE') {
                    Remplacement sur blessure du {{event.numeroJoueur1}} par le {{event.numeroJoueur2}}
                  } @else if (event.type === 'SAIGNEMENT') {
                    Remplacement sur saignement du {{event.numeroJoueur1}} par le {{event.numeroJoueur2}}
                  } @else if (event.type === 'RETOUR_SAIGNEMENT') {
                    Retour après saignement du {{event.numeroJoueur2}}. Sortie du {{event.numeroJoueur1}}
                  } @else if (event.type === 'PROTCOLE_COMMOTION') {
                    Protocole commotion. Remplacement du {{event.numeroJoueur1}} par le {{event.numeroJoueur2}}
                  } @else if (event.type === 'REOUR_PROTCOLE_COMMOTION') {
                    Retour de protocole commotion. Retour du {{event.numeroJoueur2}}. Sortie du {{event.numeroJoueur1}}
                  }
                } @else {
                  <span>{{ event.nature }} - {{ event.type }} </span>
                }
                </span>
              </div>
            </p-card>
            }
        } @empty {
          <p>Aucun événement enregistré.</p>
        }
      </div>
      @if (match().temps?.debutMatch && (!match().temps?.fin1ereMiTemps || match().temps?.debut2iemeMiTemps)) {
        <div class="buttons">
          <p-button icon="pi pi-plus" rounded="true" size="large" (click)="createEvent()"></p-button>
        </div>  
      }
    </section>
    }
    `,
  styles: [`
    .event-list-header {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      width: fit-content;
      text-align: center;
      margin: 1rem auto 0;
    }
    .column-ADV-header, .column-NOUS-header {
      text-align: center;
    }
    .column-ADV, .column-ADV-header, .column-NOUS, .column-NOUS-header {
      width: 50%;
    }
    .column-ADV {
      margin-left: 50%;
    }
    .column-NOUS {
      margin-right: 50%;
    }
    .event-desc-row {
      margin-left: 30px;
    }
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
    .match-timing-buttons {
      margin: 10px;
      text-align: center;
    }
    .buttons {
      position: absolute;
      bottom: 90px;
      right: 30px;
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
    this.matchService.setCurrentMatch(this.match());
    this.teamService.setCurrentTeam(this.team());
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
      const m = await this.db.getMatch(matchId);
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
    if (event.nature !== 'TEMPS') 
      this.router.navigate([`/app/event/${event.id}/edit`]);
  }
  editMatch() {
    this.router.navigate([`/app/match/${this.match().id}/edit`]);
  }
  async debuterMatch() {
    if (this.match().temps?.debutMatch) return;

    const d = new Date();

    // creation de l'evenement
    const debutEvt: Evenement = {
      id: '',
      createdAt: d.toISOString(),
      instant: d.toISOString(),
      matchId: this.match()!.id,
      nature: 'TEMPS',
      type: 'DEBUT_MATCH',
      periode: 1,
      rapporteurId: this.match().managerId,
      minute: 0,
      seconde: 0
    }
    await this.db.addEvent(debutEvt);

    // Mise à jour du Match
    this.match.update(m => {
      if (!m.temps) m.temps = {}
      m.temps.debutMatch = d.toISOString(); 
      return {...m};
    });
    this.db.updateMatch(this.match());
  }
  async fin1ereMiTemps() {
    if (!this.match().temps?.debutMatch) {
      console.error('Le temps de début la 1ère mi-temps n est pas enregistré dans le match', this.match())
      return;
    }

    const d = new Date().toISOString()
    const dur:Duree = this.matchService.calculerDuree(this.match().temps?.debutMatch!, d);

    // creation de l'evenement
    const debutEvt: Evenement = {
      id: '',
      createdAt: d,
      instant: d,
      matchId: this.match()!.id,
      nature: 'TEMPS',
      type: 'FIN_1ERE_MITEMPS',
      periode: 1,
      rapporteurId: this.match().managerId,
      ...dur
    }
    await this.db.addEvent(debutEvt);

    // Mise à jour du Match
    this.match.update(m => { 
      if (!m.temps) m.temps = {}
      m.temps.fin1ereMiTemps = d;
      m.temps.duree1ereMiTemps = dur;
      return {...m} 
    });
    this.db.updateMatch(this.match());
  }

  async debut2iemeMiTemps() {
    if (!this.match().temps?.debutMatch || !this.match().temps?.fin1ereMiTemps ) {
      console.error('Les temps de la 1ère mi-temps ne sont pas enregistrés dans le match', this.match())
      return;
    }

    const d = new Date().toISOString();
    const dur:Duree = this.match().temps!.duree1ereMiTemps!;
    // creation de l'evenement
    const debutEvt: Evenement = {
      id: '',
      createdAt: d,
      instant: d,
      matchId: this.match()!.id,
      nature: 'TEMPS',
      type: 'DEBUT_2ND_MITEMPS',
      periode: 2,
      rapporteurId: this.match().managerId,
      ...dur
    }
    await this.db.addEvent(debutEvt);

    // Mise à jour du Match
    this.match.update(m => { 
      if (!m.temps) m.temps = {}
      m.temps.debut2iemeMiTemps = d; 
      return {...m} 
    });
    this.db.updateMatch(this.match());
  }

  async finMatch() {
    if (!this.match().temps?.debutMatch || !this.match().temps?.fin1ereMiTemps || !this.match().temps?.debut2iemeMiTemps) {
      console.error('Les temps de la 1ère mi-temps et le début de la 2ieme mi temps ne sont pas enregistrés dans le match', this.match())
      return;
    }

    const d = new Date().toISOString();
    const duree2iemeMiTemps = this.matchService.calculerDuree(this.match().temps!.debut2iemeMiTemps!, d);
    const durEvt: Duree = this.matchService.ajouterDurations(this.match().temps!.duree1ereMiTemps!, duree2iemeMiTemps);
    // creation de l'evenement
    const debutEvt: Evenement = {
      id: '',
      createdAt: d,
      instant: d,
      matchId: this.match()!.id,
      nature: 'TEMPS',
      type: 'FIN_MATCH',
      periode: 2,
      rapporteurId: this.match().managerId,
      ...durEvt
    }
    await this.db.addEvent(debutEvt);

    // Mise à jour du Match
    this.match.update(m => { 
      if (!m.temps) m.temps = {}
      m.temps.finMatch = d; 
      m.temps.duree2iemeMiTemps = duree2iemeMiTemps;
      return {...m} 
    });
    this.db.updateMatch(this.match());
  }
}

