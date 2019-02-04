import { Component, OnInit, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css'],
})
export class MainNavComponent implements OnInit, OnDestroy {
  private authListenerSubs: Subscription;
  userIsAuthenticated = false;
  isAdmin = false;
  username = null;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
  );

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthService) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    if (this.userIsAuthenticated) {
      this.authService.getUser(this.authService.getUserId())
      .subscribe(user => {
        this.isAdmin = user.isAdmin;
        this.username = user.username;
      });
    }
    
    this.authListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        if (isAuthenticated) {
          this.authService.getUser(this.authService.getUserId())
          .subscribe(user => {
            this.isAdmin = user.isAdmin;
            this.username = user.username;
          });
        }
        this.userIsAuthenticated = isAuthenticated;
    });
  }

  onLogout() {
    this.isAdmin = false;
    this.username = null;
    this.userIsAuthenticated = null;
    this.authService.logout();
  }

  ngOnDestroy() {
    this.isAdmin = false;
    this.username = null;
    this.userIsAuthenticated = null;
    this.authListenerSubs.unsubscribe();
  }

}
