import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DataTableComponent } from './data-table/data-table.component';

import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';

import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationCreateComponent } from './applications/application-create/application-create.component';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', component: DataTableComponent }

  , { path: 'server', component: DataTableComponent }

  , { path: 'apps', component: ApplicationListComponent }
  , { path: 'apps/create', component: ApplicationCreateComponent, canActivate: [AuthGuard] }
  , { path: 'apps/edit/:postId', component: ApplicationCreateComponent, canActivate: [AuthGuard] }

  , { path: 'posts', component: PostListComponent }
  , { path: 'posts/create', component: PostCreateComponent, canActivate: [AuthGuard] }
  , { path: 'posts/edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] }

  , { path: 'auth', loadChildren: './auth/auth.module#AuthModule'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {

}
