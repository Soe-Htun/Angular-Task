import { Directive, HostBinding, Input, OnChanges } from '@angular/core';

import { TaskPriority, TaskStatus } from '../../core/models/task.model';

type BadgeValue = TaskPriority | TaskStatus;

@Directive({
  selector: '[appTaskBadge]',
  standalone: true
})
export class TaskBadgeDirective implements OnChanges {
  @Input({ required: true }) appTaskBadge!: BadgeValue;

  @HostBinding('class') classes = '';

  ngOnChanges(): void {
    this.classes = this.computeClasses(this.appTaskBadge);
  }

  private computeClasses(value: BadgeValue): string {
    const base =
      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset whitespace-nowrap capitalize';

    const priorityClasses: Record<TaskPriority, string> = {
      low: 'bg-sky-500/10 text-sky-200 ring-sky-400/50',
      medium: 'bg-amber-500/15 text-amber-200 ring-amber-400/60',
      high: 'bg-rose-500/15 text-rose-200 ring-rose-400/60'
    };

    const statusClasses: Record<TaskStatus, string> = {
      todo: 'bg-slate-800 text-slate-100 ring-slate-500/60',
      inprogress: 'bg-indigo-500/15 text-indigo-200 ring-indigo-400/50',
      completed: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/60'
    };

    if ((value as TaskPriority) in priorityClasses) {
      return `${base} ${priorityClasses[value as TaskPriority]}`;
    }

    return `${base} ${statusClasses[value as TaskStatus]}`;
  }
}
