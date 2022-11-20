import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { MatIcon } from '@angular/material/icon';

import { DataService } from '../../data.service';
import { ShopListsAll } from '../../interfaces';

@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {

  spinner:boolean;
  tpls!: ShopListsAll[]; //Templates share same data structure
  enabled = true; //Test is Templates are enabled. Avoid false negatives.
  addnew = false; //Only allow adding new template once estanlished Templates are enabled.

  constructor(
    private location: Location,
    private dataService: DataService,
  ) {
    this.spinner = true;
   }

  ngOnInit(): void {
    
    this.getTemplates();
  }

  back(){
    this.location.back()
  }

  getTemplates() :void {
    this.dataService.getTemplatesAll().subscribe({
      next: (templ) => this.tpls = templ,
      error: (e) => {
        if (e.status == 500) { //Means Templates not enabled
          this.enabled = false;
        } else if (e.status == 400) { //Means Templates enabled but empty
          this.addnew = true;   
        } ;
        this.spinner = false;
      },
      complete: () => {
        this.spinner = false,
        this.addnew = true
      }
    });
  }

  enableTemplates() :void {
    this.spinner = true;
    this.dataService.enableTemplates().subscribe({
      next: () => this.enabled = true,
      error: (e) => console.error(e),//TODO: display error banner
      complete: () => {
        this.spinner = false,
        this.getTemplates(),
        this.addnew = true
      }
    });
  }

  addNewTemplate() {
    this.spinner = true;
    this.dataService.newTemplate().subscribe({
      next: _ => console.log("New template created"),
      error: (e) => console.error(e),//TODO: display error banner
      complete: () => {
        this.spinner = false,
        this.getTemplates()
      }
    });
  }

  makeShopList(i: string) {
    this.dataService.makeShoppingList(i).subscribe({
      error: (e) => console.error(e),
      complete: () => console.log("template created")
    });
  }

  rename(a: HTMLInputElement, b: MatIcon, c: ShopListsAll)
  {
    var text = a.value;
    if(a.disabled == true){
      a.disabled = false;
      b._elementRef.nativeElement.innerHTML = "done";
    } else {
      b._elementRef.nativeElement.innerHTML = "hourglass_full";
      c.label = a.value;
      this.dataService.updateTemplate(c, c.id).subscribe({
        next: (success) => {
          a.disabled = true;
          b._elementRef.nativeElement.innerHTML = "edit";
        },
        error: error => console.error(error)
      }
      );
    }
    //a.disabled = false;
    //b._elementRef.nativeElement.innerHTML = "done";
    //console.log(b._elementRef.nativeElement.innerHTML);
  }

}
