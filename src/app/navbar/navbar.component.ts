import { Component, OnInit } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';

import { DataService } from '../data.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  admin: string = ""

  constructor(
    public auth: AuthService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.auth.user$.subscribe();
    this.checkAdmin();
  }

  loginWithRedirect(): void {
    this.auth.loginWithRedirect();
  }

  logout(): void {
    this.auth.logout({ logoutParams:{returnTo: "http://"+window.location.host+"/loggedout"} });
  }

  checkAdmin() :void {
    this.dataService.getAdminRole().subscribe(
      ad => this.admin = ad,
    );
  }

}
