import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, mergeMap, Observable, of } from 'rxjs';
import { ConfigTypeEvenement, Equipe, Evenement, Match, Periode, Saisons } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from './auth.service';
import { MatchService } from './match.service';

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

  public nettoyerEvenement(evt: Evenement, cfg: ConfigTypeEvenement) {
    if (!cfg._choixDeJeuBrasCasse) delete evt.choixDeJeuBrasCasse;
    if (!cfg._choixDeJeuPenalite) delete evt.choixDeJeuPenalite;
    if (!cfg._complementDiscipline) delete evt.complementDiscipline;
    if (!cfg._distanceJeuPied) delete evt.distanceJeuPied;
    if (!cfg._equipe) delete evt.equipe;
    if (!cfg._fautesBrasCasse) delete evt.fautesBrasCasse;
    if (!cfg._fautesPenalite) delete evt.fautesPenalite;
    if (!cfg._numeroJoueur1) delete evt.numeroJoueur1;
    if (!cfg._numeroJoueur2) delete evt.numeroJoueur2;
    if (!cfg._positionLargeur) delete evt.positionLargeur;
    if (!cfg._recuperation) delete evt.recuperation;
    if (!cfg._resultat) delete evt.resultat;
    if (!cfg._resultatMaul) delete evt.resultatMaul;
    if (!cfg._resultatMelee) delete evt.resultatMelee;
    if (!cfg._resultatRuck) delete evt.resultRuck;
    if (!cfg._resultatTouche) delete evt.resultatTouche;
    if (!cfg._zoneLancee) delete evt.zoneLancee;
    if (!cfg._zoneTerrain) delete evt.zoneTerrain;
  }
}
