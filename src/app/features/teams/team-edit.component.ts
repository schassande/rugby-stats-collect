import { Component, isWritableSignal, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Equipe, Saison, Saisons } from '@core/models/datamodel';
import { TeamService } from '@core/services/team.service';
import { DatabaseService } from '@core/services/database.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule, DialogModule, ButtonModule, 
    InputTextModule, SelectModule
  ],
  template: `
    <p-dialog [(visible)]="displayDialog" [modal]="true" [header]="isEdit ? 'Modifier équipe' : 'Créer équipe'">
      <form [formGroup]="form">
        <div class="form-group">
          <label>Nom de l'équipe</label>
          <input pInputText formControlName="nom" placeholder="Ex: Coxs">
        </div>
        <div class="form-group">
          <label>URL Logo</label>
          <input pInputText formControlName="logo" placeholder="http://...">
          @if (form.value.logo) {
            <div class="preview">
              <img class="preview-logo" src={{form.value.logo}}/>
            </div>
          }          
        </div>
        @if (isEdit) {
          <div class="form-group">
            <label>Gestionnaire</label>
          </div>
        }
      </form>
      <ng-template pTemplate="footer">
        <p-button label="Annuler" (click)="cancel()" styleClass="p-button-text"></p-button>
        @if (isEdit) {
          <p-button label="Supprimer" (click)="delete()" icon="pi pi-trash" styleClass="p-button-danger"></p-button>
        }
        <p-button label="Enregistrer" (click)="save()"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .form-group {
      margin-top: 20px;
    }
    .form-group label {
      display: block;
      margin-bottom: 10px;
    }
    .form-group input{
      display: block;
      width: 100%;
    }
    .form-group input{
      width: 100%;
    }
    .preview {
      text-align: center;
    }
    .preview-logo {
      max-width: 100px;
      max-height: 100px;
      margin: 10px auto;
    }
    `]
})
export class TeamEditComponent implements OnInit {
  form: FormGroup;
  displayDialog = true;
  isEdit = false;
  team?: Equipe;

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private db: DatabaseService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      logo: [''],
      managerIds: [[this.authService.getCurrentManager()?.id]]
    });
  }

  ngOnInit() {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.isEdit = true;
      this.loadTeam(+teamId);
    }
  }

  private async loadTeam(teamId: number) {
    this.team = await this.db.getTeam(teamId);
    if (this.team) {
      this.form.patchValue(this.team);
    }
  }

  async save() {
    if (!this.form.valid) return;

    try {
      if (this.isEdit && this.team) {
        await this.teamService.updateTeam({
          ...this.team,
          ...this.form.value
        });
      } else {
        await this.teamService.addTeam(this.form.value);
      }
      this.router.navigate(['/app/teams']);
    } catch (error) {
      console.error('Error saving team:', error);
    }
  }

  async delete() {
    if (this.team && confirm('Supprimer cette équipe?')) {
      await this.teamService.deleteTeam(this.team.id);
      this.router.navigate(['/app/teams']);
    }
  }

  cancel() {
    this.router.navigate(['/app/teams']);
  }
}
