import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl +  '/data-server/';

@Injectable({providedIn: 'root'})
export class DataServerService {

  constructor(private http: HttpClient, private router: Router) {}

  getData() {
    return this.http.get(BACKEND_URL);
  }
}
