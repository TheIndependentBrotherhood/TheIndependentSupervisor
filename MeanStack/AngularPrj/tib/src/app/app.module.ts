import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ChartsModule } from 'ng2-charts';

import { LayoutModule } from '@angular/cdk/layout';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MainNavComponent } from './main-nav/main-nav.component';
import { DataTableComponent } from './data-table/data-table.component';
import { DataServerComponent } from './data-server/data-server.component';
import { ErrorComponent } from './error/error.component';
import { HomeComponent } from './home/home.component';

import { AuthInterceptor } from './auth/auth-interceptor';
import { ErrorInterceptor } from './error-interceptor';

import { AngularMaterialModule } from './angular-material.module';
import { PostsModule } from './posts/posts.module';
import { ApplicationsModule } from './applications/applications.module';

@NgModule({
  declarations: [
    AppComponent
    , MainNavComponent
    , DataTableComponent
    , DataServerComponent
    , ErrorComponent
    , HomeComponent
  ],
  imports: [
    BrowserModule
    , AppRoutingModule
    , BrowserAnimationsModule
    , LayoutModule
    , HttpClientModule
    , AngularMaterialModule
    , PostsModule
    , ApplicationsModule
    , ChartsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    , { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ErrorComponent]
})
export class AppModule { }
