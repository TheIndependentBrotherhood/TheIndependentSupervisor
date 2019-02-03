import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataTableComponent } from './data-table/data-table.component';

import { DataServerComponent } from './data-server/data-server.component';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';

import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationCreateComponent } from './applications/application-create/application-create.component';

import { AuthGuard } from './auth/auth.guard';
import { AuthAdminGuard } from './auth/auth-admin.guard';

const routes: Routes = [
  { path: '', component: DataTableComponent }

  , { path: 'server', component: DataServerComponent, canActivate: [AuthAdminGuard] }

  , { path: 'apps', component: ApplicationListComponent }
  , { path: 'apps/create', component: ApplicationCreateComponent, canActivate: [AuthAdminGuard] }
  , { path: 'apps/edit/:applicationId', component: ApplicationCreateComponent, canActivate: [AuthAdminGuard] }

  , { path: 'posts', component: PostListComponent }
  , { path: 'posts/create', component: PostCreateComponent, canActivate: [AuthGuard] }
  , { path: 'posts/edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] }

  , { path: 'auth', loadChildren: './auth/auth.module#AuthModule'}
  , { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, AuthAdminGuard]
})
export class AppRoutingModule {

}
