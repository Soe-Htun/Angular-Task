import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { combineLatest, map } from 'rxjs';

import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskDetailComponent } from '../../components/task-detail/task-detail.component';

@Component({
  selector: 'app-task-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe, TaskDetailComponent],
  templateUrl: './task-detail.page.html'
})
export class TaskDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  readonly loading = signal(true);

  readonly task$ = combineLatest([this.route.paramMap, this.taskService.tasks$]).pipe(
    map(([params, tasks]) => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : NaN;
      if (Number.isNaN(id)) {
        return null;
      }
      return tasks.find((task) => task.id === id) ?? null;
    })
  );

  ngOnInit(): void {
    // Ensure tasks are loaded before attempting to render the detail view.
    this.taskService.fetchTasks({}).subscribe(() => this.loading.set(false));
  }
}
