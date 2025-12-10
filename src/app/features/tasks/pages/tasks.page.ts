import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { Task, TaskFilters, TaskPriority, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TaskListComponent } from '../components/task-list/task-list.component';
import { getControlError } from '../../../shared/utils/forms';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, TaskListComponent],
  templateUrl: './tasks.page.html'
})
export class TasksPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  protected readonly statusOptions: TaskStatus[] = ['todo', 'inprogress', 'completed'];
  protected readonly priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];

  protected readonly filters = signal<TaskFilters>({});
  protected readonly editingTask = signal<Task | null>(null);
  protected readonly createModalOpen = signal(false);
  protected readonly editModalOpen = signal(false);
  protected readonly deleteModalOpen = signal(false);
  protected readonly pendingDelete = signal<Task | null>(null);

  protected readonly taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as TaskPriority, [Validators.required]],
    status: ['todo' as TaskStatus, [Validators.required]]
  });

  ngOnInit(): void {
    this.taskService.fetchTasks({}).pipe(take(1)).subscribe();
  }

  handleSelect(task: Task): void {
    this.router.navigate(['/tasks', task.id]);
  }

  openCreateModal(): void {
    this.editingTask.set(null);
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo'
    });
    this.createModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    this.editingTask.set(task);
    this.taskForm.reset({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status
    });
    this.editModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.createModalOpen.set(false);
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo'
    });
  }

  closeEditModal(): void {
    this.editModalOpen.set(false);
    this.editingTask.set(null);
    this.taskForm.reset({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo'
    });
  }

  submitCreate(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.createTask(this.taskForm.getRawValue()).subscribe(() => {
      this.toastr.success('Task created');
      this.closeCreateModal();
    });
  }

  submitUpdate(): void {
    const current = this.editingTask();
    if (!current) {
      return;
    }

    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.taskService.updateTask({ id: current.id, ...this.taskForm.getRawValue() }).subscribe(() => {
      this.toastr.success('Task updated');
      this.closeEditModal();
    });
  }

  deleteTask(task: Task): void {
    this.pendingDelete.set(task);
    this.deleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const task = this.pendingDelete();
    if (!task) {
      return;
    }

    this.taskService.deleteTask(task.id).subscribe(() => {
      if (this.editingTask()?.id === task.id) {
        this.closeEditModal();
      }
      this.closeDeleteModal();
      this.toastr.success('Task deleted');
    });
  }

  closeDeleteModal(): void {
    this.pendingDelete.set(null);
    this.deleteModalOpen.set(false);
  }

  changeFilter(type: 'status' | 'priority', value: string): void {
    const updated: TaskFilters = { ...this.filters() };
    if (value === 'all') {
      delete updated[type];
    } else if (type === 'status') {
      updated.status = value as TaskStatus;
    } else {
      updated.priority = value as TaskPriority;
    }
    this.filters.set(updated);
  }

  clearFilters(): void {
    this.filters.set({});
  }

  getFieldError(controlName: string): string | null {
    return getControlError(this.taskForm.get(controlName));
  }

  hasError(controlName: string): boolean {
    const control = this.taskForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
