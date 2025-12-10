import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="open" class="fixed inset-0 z-40 flex items-center justify-center px-4 py-10">
      <div class="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" (click)="close()"></div>
      <div class="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl">
        <header class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <h3 class="text-lg font-semibold text-slate-50">{{ title }}</h3>
          <button
            type="button"
            aria-label="Close"
            class="rounded-md px-2 py-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            (click)="close()"
          >
            ✕
          </button>
        </header>
        <div class="px-6 py-5">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input({ required: true }) open = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }
}
