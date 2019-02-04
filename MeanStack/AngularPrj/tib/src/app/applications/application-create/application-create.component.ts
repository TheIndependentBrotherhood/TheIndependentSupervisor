import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApplicationsService } from '../applications.service';
import { Application } from '../application.model';
import { mimeType } from './mime-type.validator';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-application-create'
  , templateUrl: './application-create.component.html'
  , styleUrls: ['./application-create.component.css']
})
export class ApplicationCreateComponent implements OnInit, OnDestroy {
  application: Application;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private applicationId: string;
  private authStatusSub: Subscription;

  constructor(public applicationsService: ApplicationsService, public route: ActivatedRoute, private authService: AuthService) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(
        authStatus => {
          this.isLoading = false;
        }
    );
    this.form = new FormGroup({
        title: new FormControl(null, {
          validators: [Validators.required, Validators.minLength(3)]
        }),
        content: new FormControl(null, {
          validators: [Validators.required]
        }),
        image: new FormControl(null, {
          validators: [Validators.required]
          , asyncValidators: [mimeType]
        })
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('applicationId')) {
        this.mode = 'edit';
        this.applicationId = paramMap.get('applicationId');
        this.isLoading = true;
        this.applicationsService.getApplication(this.applicationId).subscribe(applicationData =>  {
          this.isLoading = false;
          this.application = {
            id: applicationData._id
            , title: applicationData.title
            , content: applicationData.content
            , imagePath: applicationData.imagePath
            , creator: applicationData.creator
            , isRunning: applicationData.isRunning
          };
          this.form.setValue({
            title: this.application.title
            , content: this.application.content
            , image: this.application.imagePath
          });
        });
      } else {
        this.mode = 'create';
        this.applicationId = null;
      }
    });
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveApplication() {
    if (this.form.invalid ) {
      return;
    }

    this.isLoading = true;
    if (this.mode === 'create') {
      this.applicationsService.addApplication(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.applicationsService.updateApplication(this.applicationId, this.form.value.title, this.form.value.content, this.form.value.image);
    }

    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
