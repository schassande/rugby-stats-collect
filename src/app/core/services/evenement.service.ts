import { inject, Injectable } from '@angular/core';
import { ConfigTypeEvenement, Duree, Evenement, Match, Periode } from '@core/models/datamodel';
import { AuthService } from './auth.service';
import { MatchService } from './match.service';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private readonly auth = inject(AuthService);
  private readonly matchService = inject(MatchService);
  public periodeCourante: Periode = 1;

  public emptyEvenement(): Evenement {
    const d = new Date();
    return {
      id:'',
      createdAt: new Date().toDateString(),
      instant: d.toISOString(),
      matchId: '',
      periode: this.periodeCourante,
      nature: 'SCORE',
      type:'ESSAI',
      rapporteurId: this.auth.getCurrentManager()!.id
    };
  }

  public calculerEvenementHeureMinute(evenement: Evenement, match: Match) {
    let duree: Duree|undefined;
    if (evenement.periode === 1) {
      duree = this.matchService.calculerDuree(match.temps!.debutMatch!, evenement.instant);
    } else if (evenement.periode === 2) {
      duree = this.matchService.ajouterDurations(
        match.temps!.duree1ereMiTemps!,
        this.matchService.calculerDuree(match.temps!.debut2iemeMiTemps!, evenement.instant));
    }
    if (duree) {
      evenement.minute = Math.floor(duree.minute);
      evenement.seconde = Math.floor(duree.seconde);
    }
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
