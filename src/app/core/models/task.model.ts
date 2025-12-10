export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inprogress' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface TaskFilters {
  priority?: TaskPriority;
  status?: TaskStatus;
}

export type CreateTaskDto = Omit<Task, 'id'>;
export type UpdateTaskDto = Partial<CreateTaskDto> & { id: number };

export interface TaskPage {
  items: Task[];
  total: number;
}
