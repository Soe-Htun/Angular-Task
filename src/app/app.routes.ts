import { Routes } from '@angular/router';

import { TasksPageComponent } from './features/tasks/pages/tasks.page';
import { TaskDetailPageComponent } from './features/tasks/pages/task-detail/task-detail.page';

export const routes: Routes = [
  {
    path: '',
    component: TasksPageComponent
  },
  {
    path: 'tasks/:id',
    component: TaskDetailPageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
