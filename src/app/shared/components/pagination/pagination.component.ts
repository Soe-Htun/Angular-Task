import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="text-xs text-slate-400">
        Showing
        <span class="font-semibold text-slate-100">{{ startIndex }}</span>
        -
        <span class="font-semibold text-slate-100">{{ endIndex }}</span>
        of
        <span class="font-semibold text-slate-100">{{ total }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Rows
          <select
            class="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs font-semibold text-slate-100 focus:border-indigo-400 focus:outline-none"
            [value]="pageSize"
            (change)="onPageSizeChange($any($event.target).value)"
          >
            <option *ngFor="let size of pageSizeOptions" [value]="size" [selected]="size === pageSize">
              {{ size }}
            </option>
          </select>
        </label>

        <div class="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
          <button
            type="button"
            class="rounded-md px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="page === 1 || total === 0"
            (click)="changePage(page - 1)"
          >
            Prev
          </button>
          <div class="px-3 text-xs font-semibold text-slate-300">
            Page <span class="text-slate-50">{{ page }}</span> / <span class="text-slate-50">{{ totalPages }}</span>
          </div>
          <button
            type="button"
            class="rounded-md px-3 py-1 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="page === totalPages || total === 0"
            (click)="changePage(page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input({ required: true }) page = 1;
  @Input({ required: true }) pageSize = 10;
  @Input({ required: true }) total = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 20];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    const pages = Math.ceil(this.total / this.pageSize);
    return pages > 0 ? pages : 1;
  }

  get startIndex(): number {
    if (this.total === 0) {
      return 0;
    }
    return (this.page - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (this.total === 0) {
      return 0;
    }
    return Math.min(this.page * this.pageSize, this.total);
  }

  changePage(target: number): void {
    const next = Math.min(Math.max(target, 1), this.totalPages);
    if (next !== this.page) {
      this.pageChange.emit(next);
    }
  }

  onPageSizeChange(size: number): void {
    const parsed = Number(size);
    if (!Number.isNaN(parsed)) {
      this.pageSizeChange.emit(parsed);
    }
  }
}
