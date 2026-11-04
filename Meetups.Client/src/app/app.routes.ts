import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';
import { guestGuard } from './core/auth/guest-guard';
import { AuthLayout } from './features/auth/auth-layout';
import { AppShell } from './layout/app-shell';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login').then((module) => module.Login),
        title: 'routes.login',
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register').then((module) => module.Register),
        title: 'routes.register',
      },
    ],
  },
  {
    path: '',
    component: AppShell,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((module) => module.Dashboard),
        title: 'routes.dashboard',
      },
      {
        path: 'meetups',
        loadComponent: () =>
          import('./features/meetups/meetup-list/meetup-list').then((module) => module.MeetupList),
        title: 'routes.meetups',
      },
      {
        path: 'meetups/new',
        loadComponent: () =>
          import('./features/meetups/meetup-form/meetup-form').then((module) => module.MeetupForm),
        data: { mode: 'create' },
        title: 'routes.newMeetup',
      },
      {
        path: 'meetups/:id',
        loadComponent: () =>
          import('./features/meetups/meetup-detail/meetup-detail').then(
            (module) => module.MeetupDetail,
          ),
        title: 'routes.detail',
      },
      {
        path: 'meetups/:id/edit',
        loadComponent: () =>
          import('./features/meetups/meetup-form/meetup-form').then((module) => module.MeetupForm),
        data: { mode: 'edit' },
        title: 'routes.edit',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found').then((module) => module.NotFound),
    title: 'routes.notFound',
  },
];
