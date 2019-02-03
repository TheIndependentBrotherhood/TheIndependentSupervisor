import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthData } from './auth-data.model';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/users/';

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticated = false;
  private isAdmin = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();

  private users: AuthData[] = [];
  private usersUpdated = new Subject<{users: AuthData[], userCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getIsAdmin() {
    return this.isAdmin;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUser(id: string) {
    return this.http.get<{
      _id: string
      , email: string
      , username: string
      , isAdmin: boolean }
    >(BACKEND_URL + id);
  }

  getUsers(userPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${userPerPage}&page=${currentPage}`;
    this.http
      .get<{message: string, users: any, maxUsers: number}>(BACKEND_URL + queryParams)
      .pipe(
        map((userData) => {
          return { users: userData.users.map(user => {
              return {
                id: user._id,
                email: user.email,
                username: user.username,
                password: user.password
              };
            })
            , maxUsers: userData.maxUsers
          };
        })
      )
      .subscribe((transformeduserData) => {
          this.users = transformeduserData.users;
          this.usersUpdated.next({
            users: [...this.users]
            , userCount: transformeduserData.maxUsers
          });
      });
  }

  createUser(email: string, username: string, password: string) {
    const authData: AuthData = { email: email, password: password, username: username, isAdmin: false};
    this.http
      .post(BACKEND_URL + 'signup', authData)
      .subscribe(() => {
        this.router.navigate(['/']);
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password, username: null, isAdmin: false };
    this.http.post<{ token: string, expiresIn: number, userId: string, isAdmin: boolean }>(BACKEND_URL + 'login', authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTime(expiresInDuration);
          this.isAuthenticated = true;
          this.isAdmin = response.isAdmin;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTime(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private setAuthTime(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token
      , expirationDate: new Date(expirationDate)
      , userId: userId
    };
  }
}
