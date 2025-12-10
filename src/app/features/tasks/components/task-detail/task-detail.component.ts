import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Task } from '../../../../core/models/task.model';
import { TaskBadgeDirective } from '../../../../shared/directives/task-badge.directive';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, TaskBadgeDirective],
  templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent {
  @Input() task: Task | null = null;
}
