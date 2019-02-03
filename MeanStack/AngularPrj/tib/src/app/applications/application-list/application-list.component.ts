import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Subscription } from 'rxjs';

import { Application } from '../application.model';
import { ApplicationsService } from '../applications.service';
import { AuthService } from '../../auth/auth.service';

@Component ({
  selector: 'app-application-list'
  , templateUrl: './application-list.component.html'
  , styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  applications: Application[] = [];
  isLoading = false;
  totalApplications = 0;
  applicationsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [5, 10, 25, 50];
  userIsAuthenticated = false;
  isAdmin = false;
  username = null;
  userId: string;
  private applicationsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(public applicationsService: ApplicationsService, private authService: AuthService ) {}

  ngOnInit() {
    this.isLoading = true;
    this.applicationsService.getApplications(this.applicationsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.applicationsSub = this.applicationsService.getApplicationUpdateListener()
      .subscribe((applicationData: {applications: Application[], applicationCount: number}) => {
        this.isLoading = false;
        this.totalApplications = applicationData.applicationCount;
        this.applications = applicationData.applications;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authService.getUser(this.authService.getUserId())
      .subscribe(user => {
        this.isAdmin = user.isAdmin;
        this.username = user.username;
      });
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.authService.getUser(this.authService.getUserId())
        .subscribe(user => {
          this.isAdmin = user.isAdmin;
          this.username = user.username;
        });
        this.userId = this.authService.getUserId();
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.applicationsPerPage = pageData.pageSize;
    this.applicationsService.getApplications(this.applicationsPerPage, this.currentPage);
  }

  onDelete(applicationId: string) {
    this.isLoading = true;
    this.applicationsService
      .deleteApplication(applicationId)
      .subscribe(() => {
        this.applicationsService.getApplications(this.applicationsPerPage, this.currentPage);
      }, () => {
        this.isLoading = false;
      });
  }

  onStart(applicationId: string) {
    this.isLoading = true;
    this.applicationsService
      .startApplication(applicationId)
      .subscribe(() => {
        this.applicationsService.getApplications(this.applicationsPerPage, this.currentPage);
      }, () => {
        this.isLoading = false;
      });
  }

  onStop(applicationId: string) {
    this.isLoading = true;
    this.applicationsService
      .stopApplication(applicationId)
      .subscribe(() => {
        this.applicationsService.getApplications(this.applicationsPerPage, this.currentPage);
      }, () => {
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.applicationsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}
