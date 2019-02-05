import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { DataServerService } from './data-server.service';
import { AuthService } from '../auth/auth.service';

import { DataServer } from './data-server.model';

@Component ({
  selector: 'app-data-server'
  , templateUrl: './data-server.component.html'
  , styleUrls: ['./data-server.component.css']
})
export class DataServerComponent implements OnInit, OnDestroy {
  dataServer: DataServer[] = [];
  isLoading = false;
  userIsAuthenticated = false;
  isAdmin = false;
  username = null;
  userId: string;
  private authStatusSub: Subscription;

  // lineChart
  public lineChartData: Array<any> = [
    {data: Array, label: '% CPU'},
    {data: Array, label: '% RAM'},
    {data: Array, label: '% Disk Storage'}
  ];
  public lineChartLabels: Array<any> = ['-1h', '-50min', '-40min', '-30min', '-20min', '-10min', 'Now'];
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';

  constructor( public dataServerService: DataServerService, public route: ActivatedRoute, private authService: AuthService ) {}

  ngOnInit() {
    this.isLoading = true;
    this.dataServerService.getData();
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    if (this.userIsAuthenticated) {
      this.authService.getUser(this.authService.getUserId())
      .subscribe(user => {
        this.isAdmin = user.isAdmin;
        this.username = user.username;
      });
    }
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        if (this.userIsAuthenticated) {
          this.authService.getUser(this.authService.getUserId())
          .subscribe(user => {
            this.isAdmin = user.isAdmin;
            this.username = user.username;
          });
        }
        this.userId = this.authService.getUserId();
      });

    this.onRefresh();
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  onRefresh() {
    this.isLoading = true;
    this.dataServerService
      .getData()
      .subscribe(result => {
        this.isLoading = false;
        const _lineChartData: Array<any> = new Array(this.lineChartData.length);
        const keyArr = ['rateCPU', 'rateRAM', 'rateDiskStorage'];

        /* const _lineChartLabels: Array<any> = new Array(result['dataServer'].length + 1);
        for (let i = 0; i < result['dataServer'].length; i++) {
          _lineChartLabels[i] = result['dataServer'][i]['date'];
        }
        _lineChartLabels[result['dataServer'].length] = result['curData']['date'];

        console.log(_lineChartLabels);

        this.lineChartLabels = _lineChartLabels; */

        // for (let j = (result['dataServer'].length - 1); j > 0; j--) {

        for (let i = 0; i < this.lineChartData.length; i++) {
          _lineChartData[i] = {data: new Array(result['dataServer'].length + 1), label: this.lineChartData[i].label};
          for (let j = 0; j < result['dataServer'].length; j++) {
            _lineChartData[i].data[(this.lineChartLabels.length - 2) - j] = result['dataServer'][j][keyArr[i]];
          }
          _lineChartData[i].data[this.lineChartLabels.length - 1] = result['curData'][keyArr[i]];
        }

        this.lineChartData = _lineChartData;

        this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}

