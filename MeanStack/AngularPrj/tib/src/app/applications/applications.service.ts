import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import { Application } from './application.model';

const BACKEND_URL = environment.apiUrl +  '/apps/';

@Injectable({providedIn: 'root'})
export class ApplicationsService {
  private applications: Application[] = [];
  private applicationsUpdated = new Subject<{applications: Application[], applicationCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getApplications(applicationPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${applicationPerPage}&page=${currentPage}`;
    this.http
      .get<{message: string, applications: any, maxApplications: number}>(BACKEND_URL + queryParams)
      .pipe(
        map((applicationData) => {
          return { applications: applicationData.applications.map(application => {
              return {
                id: application._id,
                title: application.title,
                content: application.content,
                imagePath: application.imagePath,
                creator: application.creator,
                isRunning: application.isRunning
              };
            })
            , maxApplications: applicationData.maxApplications
          };
        })
      )
      .subscribe((transformedapplicationData) => {
          this.applications = transformedapplicationData.applications;
          this.applicationsUpdated.next({
            applications: [...this.applications]
            , applicationCount: transformedapplicationData.maxApplications
          });
      });
  }

  getApplicationUpdateListener() {
    return this.applicationsUpdated.asObservable();
  }

  getApplication(id: string) {
    return this.http.get<{
      _id: string
      , title: string
      , content: string
      , imagePath: string
      , creator: string
      , isRunning: boolean }
    >(BACKEND_URL + id);
  }

  addApplication(title: string, content: string, image: File) {
    const applicationData = new FormData();
    applicationData.append('title', title);
    applicationData.append('content', content);
    applicationData.append('image', image, title);
    this.http.post<{ message: string, application: Application }>(BACKEND_URL, applicationData)
      .subscribe((responseData) => {
        this.router.navigate(['/apps']);
      });
  }

  updateApplication(id: string, title: string, content: string, image: File | string) {
    let applicationData: Application | FormData;
    if (typeof(image) === 'object') {
      applicationData = new FormData();
      applicationData.append('id', id);
      applicationData.append('title', title);
      applicationData.append('content', content);
      applicationData.append('image', image, title);
    } else {
      applicationData = {
        id: id
        , title: title
        , content: content
        , imagePath: image
        , creator: null
        , isRunning: null
      };
    }
    this.http.put(BACKEND_URL + id, applicationData)
      .subscribe(response => {
        this.router.navigate(['/apps']);
      });
  }

  deleteApplication(applicationId: string) {
    return this.http.delete(BACKEND_URL + applicationId);
  }

  startApplication(applicationId: string) {
    return this.http.put(BACKEND_URL + applicationId + '/run', null);
  }

  updateSoftwareApplication(applicationId: string) {
    return this.http.put(BACKEND_URL + applicationId + '/update', null);
  }

  stopApplication(applicationId: string) {
    return this.http.put(BACKEND_URL + applicationId + '/stop', null);
  }
}
