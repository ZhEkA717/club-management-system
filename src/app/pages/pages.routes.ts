import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Events } from '@/pages/events/events';
import { Members } from '@/pages/members/members';
import { Payments } from '@/pages/payments/payments';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'members', component: Members },
    { path: 'events', component: Events },
    { path: 'payments', component: Payments },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
