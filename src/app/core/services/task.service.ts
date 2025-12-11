import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

import {
  CreateTaskDto,
  Task,
  TaskFilters,
  TaskPriority,
  TaskStatus,
  UpdateTaskDto
} from '../models/task.model';
import { environment } from '../../../environments/environment.generated';

interface ApiTaskResponse {
  data: ApiTask[];
  totalrecord: number;
}

interface ApiTask {
  taskId: number;
  title: string;
  priority: string;
  status: string;
}

interface ApiListPayload {
  curRow: number;
  limitRow: number;
  filterText: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  private lastFilters: TaskFilters = {};

  readonly tasks$ = this.tasksSubject.asObservable();

  fetchTasks(filters?: TaskFilters): Observable<Task[]> {
    this.lastFilters = filters ?? {};
    const payload: ApiListPayload = {
      curRow: 0,
      limitRow: 1000,
      filterText: ''
    };

    return this.http
      .post<ApiTaskResponse>(`${environment.apiUrl}/GetAllTasks`, payload)
      .pipe(
        map((res) => this.applyFilters(this.mapApiTasks(res.data ?? []), filters)),
        tap((tasks) => this.tasksSubject.next(tasks)),
        catchError(() => of([]))
      );
  }

  getTask(id: number): Observable<Task | undefined> {
    return this.tasks$.pipe(map((tasks) => tasks.find((task) => task.id === id)));
  }

  createTask(payload: CreateTaskDto): Observable<Task> {
    const body = {
      title: payload.title,
      priority: this.toApiPriority(payload.priority),
      status: this.toApiStatus(payload.status)
    };

    return this.http
      .post<string>(`${environment.apiUrl}/SaveTask`, body)
      .pipe(
        tap(() => this.refreshTasks()),
        map(() => ({
          id: Date.now(),
          ...payload
        }))
      );
  }

  updateTask(payload: UpdateTaskDto): Observable<Task | null> {
    const body = {
      taskId: payload.id,
      title: payload.title,
      priority: payload.priority ? this.toApiPriority(payload.priority) : undefined,
      status: payload.status ? this.toApiStatus(payload.status) : undefined
    };

    return this.http
      .post<string>(`${environment.apiUrl}/UpdateTask`, body)
      .pipe(
        tap(() => this.refreshTasks()),
        map(() => {
          const existing = this.tasksSubject.value.find((task) => task.id === payload.id);
          return existing ? { ...existing, ...payload } : null;
        })
      );
  }

  deleteTask(id: number): Observable<number> {
    return this.http
      .delete<string>(`${environment.apiUrl}/DeleteTask/${id}`)
      .pipe(
        tap(() => this.refreshTasks()),
        map(() => id)
      );
  }

  private applyFilters(tasks: Task[], filters?: TaskFilters): Task[] {
    if (!filters) {
      return tasks;
    }

    return tasks.filter((task) => {
      const matchesPriority = filters.priority ? task.priority === filters.priority : true;
      const matchesStatus = filters.status ? task.status === filters.status : true;
      return matchesPriority && matchesStatus;
    });
  }

  private mapApiTasks(apiTasks: ApiTask[]): Task[] {
    return apiTasks.map((item) => ({
      id: item.taskId,
      title: item.title,
      description: 'No description provided.',
      priority: this.fromApiPriority(item.priority),
      status: this.fromApiStatus(item.status)
    }));
  }

  private toApiPriority(priority: TaskPriority): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  private fromApiPriority(value: string): TaskPriority {
    const normalized = value.toLowerCase() as TaskPriority;
    return ['low', 'medium', 'high'].includes(normalized) ? normalized : 'medium';
  }

  private toApiStatus(status: TaskStatus): string {
    if (status === 'inprogress') {
      return 'inprogress';
    }
    return status;
  }

  private fromApiStatus(value: string): TaskStatus {
    const normalized = value.toLowerCase();
    if (normalized === 'inprogress') return 'inprogress';
    if (normalized === 'todo') return 'todo';
    return 'completed';
  }

  private refreshTasks(): void {
    this.fetchTasks(this.lastFilters).subscribe();
  }

  constructor(private readonly http: HttpClient) {}
}
