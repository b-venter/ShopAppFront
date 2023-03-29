import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'dshopsmart';

  //Added meta service for view port
  constructor (
    private metaService: Meta
  ) {
    this.metaService.updateTag({
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    }, 'name=viewport');
  }


}
