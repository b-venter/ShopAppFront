import { Component, OnInit } from '@angular/core';

import { AuthService } from '@auth0/auth0-angular';
import { Cats } from '../interfaces';
import { DataService } from '../data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cat! :string
  welcome = "purple"

  constructor(
    private dataService: DataService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.Cat();
  }

  Cat() :void {
    var url: Cats[]
    this.dataService.getCat().subscribe({
      next: (result) => url = result,
      error: (e) => console.error(e),
      complete: () => this.cat = url[0].url,
    });
  }

}
