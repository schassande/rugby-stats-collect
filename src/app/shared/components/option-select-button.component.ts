import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

export interface OptionSelectButtonOption<T extends string | number = string> {
  label: string;
  value: T;
  icon?: string;
}

@Component({
  selector: 'app-option-select-button',
  standalone: true,
  imports: [FormsModule, SelectButtonModule],
  template: `
    <p-selectbutton
      [options]="options" [ngModel]="value"
      [optionLabel]="'label'" [optionValue]="'value'"
      [allowEmpty]="false"
      (onChange)="valueChange.emit($event.value)">
      <ng-template pTemplate="item" let-option>
        <span class="option-select-button-item">
          @if (option.icon) {
            <img [src]="option.icon" alt={{option.icon}} aria-hidden="true" />
          }
          <span class="option-select-button-label">{{ option.label }}</span>
        </span>
      </ng-template>
    </p-selectbutton>
  `,
  styles: [`
    :host ::ng-deep .p-selectbutton {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      width: 100%;
    }

    :host ::ng-deep .p-selectbutton .p-togglebutton {
      flex: 0 0 6rem;
      width: 5rem;
      justify-content: center;
      border-radius: 0.75rem;
      border: 1px solid grey;
      background: #ffffff;
    }


    :host ::ng-deep .p-selectbutton .p-togglebutton.p-togglebutton-checked {
      border: 1px solid black;
      border-radius: 0.75rem;
      background-color: #1976d2 !important;
      color: #ffffff;
    }

    :host ::ng-deep .p-selectbutton .p-togglebutton.p-togglebutton-checked .option-select-button-item {
      background-color: #1976d2;
      color: #ffffff;
      font-weight: bold;
    }

    :host ::ng-deep .p-selectbutton .p-togglebutton.p-togglebutton-checked .p-togglebutton-content {
      background-color: #1976d2;
      color: #ffffff;
      border-radius: 0.65rem;
    }

    .option-select-button-item {
      display: inline-flex;
      width: 100%;
      min-width: 0;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      text-align: center;
      gap: 0.1rem;
      font-size: 0.9rem;
    }

    .option-select-button-label {
      max-width: 100%;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .option-select-button-item img {
      width: 4rem;
      height: 4rem;
      object-fit: contain;
    }
  `]
})
export class OptionSelectButtonComponent<T extends string | number = string> {
  @Input({ required: true }) options: OptionSelectButtonOption<T>[] = [];
  @Input() value: T | null = null;
  @Output() readonly valueChange = new EventEmitter<T>();
}
