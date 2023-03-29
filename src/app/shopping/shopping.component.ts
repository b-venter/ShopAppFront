import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

/* Breakpoint observations */
import { BreakpointObserver } from '@angular/cdk/layout';

import { DataService } from '../data.service';
import { ShopListsAll } from '../interfaces';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss']
})
export class ShoppingComponent implements OnInit {

  spinner:boolean;
  visible!: ShopListsAll[];
  history = false;
  isSmallScreen: boolean;
  maxWidth: number = 70;

  
  constructor(
    private dataService: DataService,
    private _snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
  ) { 
    this.spinner = true;
    this.isSmallScreen = breakpointObserver.isMatched('(max-width: 420px)');
  }

  ngOnInit(): void {
    this.getVisibleLists();
    this.setMaxWidth();
  }

  setMaxWidth(): void {
    if (this.isSmallScreen) {
      this.maxWidth = 100;
    }
  }

  getVisibleLists(): void {
    this.spinner = true;
    this.dataService.getListsVis().subscribe({
      next: (lists) => this.visible = lists,
      error: (e) => console.error(e),
      complete: () => this.spinner = false
    }
    );
  }

  getHistory(): void {
    this.history = !this.history;
    if (this.history) {
      this.spinner = true;
      this.dataService.getListsAll().subscribe({
        next: (lists) => this.visible = lists,
        error: (e) => console.error(e),
        complete: () => this.spinner = false
      }
      );
    } else {
      this.getVisibleLists();
    }
  }

  createShopList(): void {
    this.dataService.newShoppingList().subscribe(
      result => {
        this.getVisibleLists();
      }
    );
  }

  toggleVisibility(b: boolean, n: string, i: number): void {
    //Toggle hidden = true/false
    b = !b;

    var c = this.visible[i];
    c.hidden = b;

    this.dataService.updateShopListHide(c, n).subscribe(
      result => {
       //Remove shopping list from array
       if (b == true) {
        this.visible.splice(i,1);
       }
      }
    );
  }

  makeTemplate(i: string) {
    this.dataService.makeTemplate(i).subscribe({
      error: (e) => {
        console.error(e),
        this._snackBar.open("Template error", "Close")
      },
      complete: () => this._snackBar.open("Template created", "Close"),
    });
  }

  
  //TODO: This should really b done as a custom directive
  //https://angular.io/guide/template-reference-variables#accessing-in-a-nested-template
  //https://ultimatecourses.com/blog/element-refs-in-angular-templates
  rename(a: HTMLInputElement, b: MatIcon, c: ShopListsAll)
  {
    var text = a.value;
    if(a.disabled == true){
      a.disabled = false;
      a.hidden = false;
      b._elementRef.nativeElement.innerHTML = "done";
    } else {
      b._elementRef.nativeElement.innerHTML = "hourglass_full";
      c.label = a.value;
      this.dataService.updateShopList(c, c.id).subscribe({
        next: (success) => {
          a.disabled = true;
          a.hidden = true;
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
