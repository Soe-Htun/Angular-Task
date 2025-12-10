import { CommonModule, NgClass } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal
} from '@angular/core';
import { BehaviorSubject, Subscription, catchError, map, of, switchMap } from 'rxjs';

import { Task, TaskFilters, TaskPage } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { TaskBadgeDirective } from '../../../../shared/directives/task-badge.directive';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, NgClass, TaskBadgeDirective, PaginationComponent],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: TaskFilters | null = null;
  @Input() activeTaskId: number | null = null;

  @Output() selected = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<Task>();

  private currentFilters: TaskFilters = {};
  private readonly query$ = new BehaviorSubject<{ filters: TaskFilters; page: number; pageSize: number }>({
    filters: {},
    page: 1,
    pageSize: 10
  });
  readonly loading = signal(true);
  readonly hasLoaded = signal(false);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly pageData = signal<TaskPage | null>(null);
  private subscription?: Subscription;
  private tasksSubscription?: Subscription;

  readonly page$ = this.query$.pipe(
    switchMap((query) => {
      this.loading.set(true);
      this.pageData.set(null);
      return this.taskService.fetchTasks(query.filters);
    }),
    map((tasks) => {
      this.loading.set(false);
      this.hasLoaded.set(true);
      this.updatePageData(tasks);
      return this.pageData() ?? { items: [], total: 0 };
    }),
    catchError(() => {
      this.loading.set(false);
      this.total.set(0);
      this.pageData.set({ items: [], total: 0 });
      return of({ items: [], total: 0 } as TaskPage);
    })
  );

  constructor(private readonly taskService: TaskService) {}

  ngOnInit(): void {
    this.subscription = this.page$.subscribe();
    this.tasksSubscription = this.taskService.tasks$.subscribe((tasks) => this.updatePageData(tasks));
  }

  ngOnChanges(): void {
    this.currentFilters = this.filters ?? {};
    this.page.set(1);
    this.pushQuery();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.tasksSubscription?.unsubscribe();
  }

  trackById(_: number, task: Task): number {
    return task.id;
  }

  viewDetails(task: Task): void {
    this.loading.set(false);
    this.selected.emit(task);
  }

  editTask(task: Task): void {
    this.edit.emit(task);
  }

  deleteTask(task: Task): void {
    this.remove.emit(task);
  }

  onRowClick(task: Task): void {
    this.viewDetails(task);
  }

  changePage(page: number): void {
    this.page.set(page);
    this.pushQuery();
  }

  changePageSize(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.pushQuery();
  }

  private pushQuery(): void {
    this.query$.next({
      filters: this.currentFilters,
      page: this.page(),
      pageSize: this.pageSize()
    });
  }

  private updatePageData(tasks: Task[]): void {
    const total = tasks.length;
    this.total.set(total);

    const currentPage = this.page();
    const pageSize = this.pageSize();
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    if (safePage !== currentPage) {
      this.page.set(safePage);
    }

    const start = (this.page() - 1) * pageSize;
    const pagedItems = tasks.slice(start, start + pageSize);
    this.pageData.set({ items: pagedItems, total });
  }
}
