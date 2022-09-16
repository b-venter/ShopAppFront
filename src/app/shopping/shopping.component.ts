import { Component, OnInit } from '@angular/core';

import { DataService } from '../data.service';
import { SList, ShopListsAll } from '../interfaces';

@Component({
  selector: 'app-shopping',
  templateUrl: './shopping.component.html',
  styleUrls: ['./shopping.component.scss']
})
export class ShoppingComponent implements OnInit {

  spinner:boolean;
  visible!: ShopListsAll[];
  history = false;
  
  constructor(
    private dataService: DataService,
  ) { 
    this.spinner = true;
  }

  ngOnInit(): void {
    this.getVisibleLists();
  }

  getVisibleLists(): void {
    this.spinner = true;
    this.dataService.getListsVis().subscribe(
      lists => this.visible = lists,
      _ => console.error(),
      () => this.spinner = false
    );
  }

  getHistory(): void {
    this.history = !this.history;
    if (this.history) {
      this.spinner = true;
      this.dataService.getListsAll().subscribe(
        lists => this.visible = lists,
        _ => console.error(),
        () => this.spinner = false
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

}
