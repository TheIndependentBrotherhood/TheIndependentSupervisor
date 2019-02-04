import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ApplicationCreateComponent } from './application-create/application-create.component';
import { ApplicationListComponent } from './application-list/application-list.component';

import { AngularMaterialModule } from '../angular-material.module';

@NgModule({
  declarations: [
    ApplicationCreateComponent
    , ApplicationListComponent
  ]
  , imports: [
    CommonModule
    , ReactiveFormsModule
    , AngularMaterialModule
    , RouterModule
  ]
})
export class ApplicationsModule {}
