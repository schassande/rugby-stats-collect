import { Component, inject, OnInit, signal } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule, DialogModule, ButtonModule, 
    InputTextModule, SelectModule
  ],
  template: `
    <section>
      <h2>{{isEdit ? 'Modifier équipe' : 'Créer équipe'}}</h2>
      <form [formGroup]="form">
        <div class="form-group">
          <label>Nom de l'équipe</label>
          <input pInputText class="team-name-input" formControlName="nom" 
            placeholder="Ex: Coxs" maxlength="50">
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
        @if (team()) {
          <div class="form-group">
            <label>Gestionnaires :</label>
            <div class="manager-list">
              @for(managerId of team()?.managerIds; track managerId) {
                <div class="manager-row">
                  <span>{{managerId}}</span>
                  @if (currentManager()?.id !== managerId) {
                    <p-button icon="fa fa-trash" severity="danger" [text]="true" [rounded]="true"
                      title="Supprimer ce gestionnaire"
                      (click)="removeManager(managerId)"></p-button>
                  }
                </div>
              }
            </div>
            <div class="add-manager">
              <input pInputText type="email" formControlName="managerEmail"
                placeholder="Adresse email du gestionnaire" (keyup.enter)="addManager()">
              <p-button label="Ajouter" icon="pi pi-plus"
                [disabled]="form.controls['managerEmail'].invalid" (click)="addManager()"></p-button>
            </div>
            @if (form.controls['managerEmail'].touched && form.controls['managerEmail'].invalid) {
              <small class="validation-error">Saisissez une adresse email valide.</small>
            }
          </div>
        }
      </form>
      <div class="form-actions">
        @if (isEdit) {
          <p-button label="Supprimer" (click)="delete()" icon="pi pi-trash" styleClass="p-button-danger"></p-button>
        }
        <p-button label="Annuler" (click)="cancel()" styleClass="p-button-text"></p-button>
        <p-button label="Enregistrer" (click)="save()"></p-button>
      </div>
    </section>
  `,
  styles: [`
    h2 { text-align: center; margin: 10px 0; }
    section { padding: 5px; }
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
    .manager-list { display: flex; flex-direction: column; gap: 4px; max-width: 500px; }
    .manager-row { 
      margin-left: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px;
      border: 1px solid var(--p-content-border-color); 
      border-radius: var(--p-border-radius); 
    }
    .add-manager { 
      margin-left: 30px;
      display: flex;
      align-items: center; 
      gap: 8px; 
      max-width: 500px; 
      margin-top: 8px;
    }
    .add-manager input { 
      max-width: 300px; 
      flex: 1;
    }
    .validation-error { color: var(--p-red-500); }
    .team-name-input {
      max-width: 300px;
    }
    .preview {
      text-align: center;
    }
    .preview-logo {
      max-width: 100px;
      max-height: 100px;
      margin: 10px auto;
    }
    .form-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 40px;
    }
    .form-actions p-button {
      display: block;
    }
    @media (max-width: 600px) {
      .form-actions {
        flex-direction: column;
        align-items: center;
      }
      .form-actions p-button,
      .form-actions ::ng-deep .p-button {
      }
    }
    `]
})
export class TeamEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamService = inject(TeamService);
  private db = inject(DatabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  currentManager = toSignal(this.authService.currentManager$);

  form: FormGroup;
  displayDialog = true;
  isEdit = false;
  team = signal<Equipe|undefined>(undefined);

  constructor() {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      logo: [''],
      managerIds: [[this.authService.getCurrentManager()?.id]],
      managerEmail: ['', Validators.email]
    });
  }

  ngOnInit() {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.isEdit = true;
      this.loadTeam(teamId);
    }
  }

  private async loadTeam(teamId: string) {
    this.team.set(await this.db.getTeam(teamId));
    const t = this.team();
    if (t) {
      this.form.patchValue(t);
    }
  }

  async save() {
    if (!this.form.valid) return;

    try {
      let id: string;
      const t:Equipe = { ...this.team(), ...this.form.value };
      delete (t as any).managerEmail; // delete form field
      this.team.set(t);
      if (this.isEdit) {
        await this.teamService.updateTeam(t);
      } else {
        this.team.set(await this.teamService.addTeam(t));
      }
      id = this.team()!.id;
      this.router.navigate(['/app/teams', id]);
    } catch (error) {
      console.error('Error saving team:', error);
    }
  }

  async delete() {
    if (this.team && confirm('Supprimer cette équipe?')) {
      await this.teamService.deleteTeam(this.team()!.id);
      this.router.navigate(['/app/teams']);
    }
  }

  addManager() {
    const control = this.form.controls['managerEmail'];
    control.markAsTouched();
    if (control.invalid || !this.team) return;
    const email = String(control.value).trim().toLowerCase();
    if (!email || this.team()!.managerIds.includes(email)) { control.reset(); return; }
    this.team()!.managerIds = [...this.team()!.managerIds, email];
    this.form.controls['managerIds'].setValue(this.team()!.managerIds);
    control.reset();
  }

  removeManager(managerId: string) {
    if (!this.team) return;
    this.team()!.managerIds = this.team()!.managerIds.filter(id => id !== managerId);
    this.form.controls['managerIds'].setValue(this.team()!.managerIds);
  }

  cancel() {
    this.router.navigate(['/app/teams']);
  }
}
