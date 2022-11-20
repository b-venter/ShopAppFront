import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';


import { Item, Shop, SList, SlistEdge, SlistItem, SlistEdgeItem, TrendItem } from '../../interfaces';
import { DataService } from '../../data.service';

//Chart specific imports
import { ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


export interface Cost {
  shop: string;
  cost: number;
}

export interface curr {
  abbr: string;
  symbol: string;
  icon: string;
  value: number;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  id!: number;
  shopList!: SList[];
  badge: number[];
  costs: Cost[] = [];
  shoppingCosts = 0;
  trolleyCosts = 0;
  trolleyCostBool = false;

  currency :curr[] = [
    {abbr: "USD", symbol: "$", icon: "🇺🇸", value: 0},
    {abbr: "EUR", symbol: "€", icon: "🇪🇺", value: 0},
    {abbr: "KWZ", symbol: "Kz", icon: "🇦🇴", value: 0},
    {abbr: "NAD", symbol: "N$", icon: "🇳🇦", value: 0},
    {abbr: "ZAR", symbol: "R", icon: "🇿🇦", value: 0},
  ];
  currencySel = 3;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public dialog: MatDialog,
  ) { 
    this.badge = [];
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.getShoppingList();
  }

  setCurrency(x: number){
    this.currencySel = x;
  }

  getShoppingList(): void {
    this.dataService.getShoppingList(this.id.toString()).subscribe({
      next: (list) => this.shopList = list,
      error: (err)=> console.log(err),
      complete: () => this.setTrolleyInit(),
    }
    );
    
  }

  //Sets both the trolley counter and calculates trolley value
  setTrolleyInit(): void{
    //Zero the costs array
    this.costs = [];

    //interesting use of both iterator in TS: in and of
    var s = this.shopList;
    for (let i in s) {
      this.badge[i] = 0;
      var shop = s[i].shop;
      var cost = 0;

      //Set trolley badge vallue
      for (let x of s[i].items){
        if (x.trolley === true) {
          this.badge[i]++;
        }
        cost += x.price * x.qty;
      }
      this.costs.push({shop: shop, cost: cost});
    }

    //Set total cost
    this.totalShopping(this.costs);
    this.totalTrolleys();
  }

  totalShopping(c: Cost[]): void{
    var total = 0;
    for (let x of c) {
      var cost = x.cost;
      total += cost;
    }
    this.shoppingCosts = total;
  }

  totalTrolleys() :void{
    var s = this.shopList;
    var tData: SlistItem[] = [];
    for (let i of s) {
      this.dataService.getTrolley(this.id.toString(), i.items[0].shop_id.toString()).subscribe(
        t => tData = t,
        _ => console.error(),
        () => {
          for (let j of tData) {
            this.trolleyCosts += j.qty * j.price;
          }
        }
      );
    }

  }


  moveItemToOtherShop(b:SlistEdge, key :string): void {
    this.dataService.moveShopListItem(b, this.id.toString(), key).subscribe(
      result => {
        this.getShoppingList();
      });
    }

  setTrolleyCounter(i: number, in2: number): void {
    var a = this.shopList[i].items[in2];
    a.trolley = !a.trolley;
    //date to be updated by api
    var b: SlistEdgeItem = {date: 0, price: a.price, currency: a.currency, special: a.special, trolley: a.trolley, qty: a.qty, tag: a.tag}
    //updateTrolley(body, id in ShoppingLists, id of edge doc)
    this.dataService.updateTrolley(b, this.id.toString(), a.edge_id).subscribe(
      result => {
        if (a.trolley) {
          this.badge[i]++;
        } else {
          this.badge[i]--;
        }
      }
    )
  }

  delShopListItem(key: string){
    //warning modal
    var a = confirm("Do you really want to remove this item from your shopping list?");
    if (a) {
      this.dataService.delShopListItems(this.id.toString(), key).subscribe(
        result => {
          //TODO: Remove item from ShoppingList array or get ShoppingList anew
          this.getShoppingList();
        });
    }
  }


  //Dialog/modal related. See also the constructor above
  openDialog(): void {
    const dialogRef = this.dialog.open(AddtoList, {
      width: '400px',
      data: {
        header: "Add to shopping list",
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //TODO: Add test whether close, cancel or Save
      var to :string = result.item;
      var from :string = result.shop;

      //Set up body for POST
      var post :SlistEdge = {"_to": to, "_from": from, date: 0, price: result.form.listPrice, qty: result.form.listQty, currency: result.form.listCurrency, trolley: result.form.listTrolley, special: result.form.listSpecial, tag: ""}

      //Run POST and retrieve key
      this.dataService.addShopListItems(post, this.id.toString()).subscribe(
        result => {
          //if successful, re-populate the ShoppingList
          this.getShoppingList();
        }
      )
      //TODO: Toaster pop-up for success
    });
  }

  editDialog(it: SlistItem, sh: string): void {
    const dialogRef = this.dialog.open(AddtoList, {
      width: '400px',
      data: {
        header: "Edit item",
        formData: it,
        shName: sh,
        purpose: "edit"
      }
    });

    //Run PATCH
    //TODO: Add test whether close, cancel or Save
    dialogRef.afterClosed().subscribe(result => {
      var to :string = result.item;
      var from :string = result.shop;

      //Set up body for POST
      var patch :SlistEdge = {"_to": to, "_from": from, date: 0, price: result.form.listPrice, qty: result.form.listQty, currency: result.form.listCurrency, trolley: result.form.listTrolley, special: result.form.listSpecial, tag: ""}
      this.dataService.updateTrolley(patch, this.id.toString(), it.edge_id).subscribe(
        result => {
          this.getShoppingList();
        }
      )
      //TODO: Toaster pop-up for success
    });
  }

  moveDialog(it: SlistItem, sh: string): void {
    const dialogRef = this.dialog.open(AddtoList, {
      width: '400px',
      data: {
        header: "Move item:",
        formData: it,
        shName: sh,
        purpose: "move",
      }
    });

    //Run PATCH
    //TODO: Add test whether close, cancel or Save
    dialogRef.afterClosed().subscribe(result => {
      var to :string = result.item;
      var from :string = result.shop;

      //Set up body for PATCH. The _from should be different to what was in "it"
      var patch :SlistEdge = {"_to": to, "_from": from, date: 0, price: result.form.listPrice, qty: result.form.listQty, currency: result.form.listCurrency, trolley: result.form.listTrolley, special: result.form.listSpecial, tag: ""}
      this.moveItemToOtherShop(patch, it.edge_id);

      //TODO: Toaster pop-up for success
    });
  }


  trendDialog(i: string): void {
    const dialogRef = this.dialog.open(TrendItemDialog, {
      width: '400px',
      data: {
        header: "Price trend",
        item: i,
      }
    });
  }



}



/* ****************
  Add / Edit dialog/modal
 *********************/
//Remember that this component must be declared in app.module.ts as well
@Component({
  selector: 'add-shop',
  templateUrl: 'add-list-dialog.html',
  styleUrls: ['add-list-dialog.css'],
})
export class AddtoList implements OnInit {

  shopList: FormGroup;
  header: string;
  edit: boolean = false; //Edit is set to true when formData is present
  move: boolean = false; //MOve is set to true when moveData is present

  currency :curr[] = [
    {abbr: "USD", symbol: "$", icon: "🇺🇸", value: 0},
    {abbr: "EUR", symbol: "€", icon: "🇪🇺", value: 0},
    {abbr: "KWZ", symbol: "Kz", icon: "🇦🇴", value: 0},
    {abbr: "NAD", symbol: "N$", icon: "🇳🇦", value: 0},
    {abbr: "ZAR", symbol: "R", icon: "🇿🇦", value: 0},
  ];
  currencySel = 3;

  //Required static values on "edit", as the filtered objects will remain blank
  shopInit! :Shop;
  shopId!: string;
  itemInit! :Item;
  itemId!: string;

  filteredSelect: number = 0;
  filteredShops!: Observable<string[]>;
  filteredShopObject!: Shop[] | undefined;

  filteredItem: number = 0;
  filteredItems!: Observable<string[]>;
  filteredItemObject!: Item[] | undefined;
  itemSearchLive = true;

  private shopFilter(value: string): string[] {

    var a: Shop[]
    var b: string[] = []
    
    this.dataService.getShopLike(value.toLowerCase()).subscribe(
        result => {
          a = result;
          for (let x in a) {
            var y = a[x].name;
            b.push(y);
          }
          this.filteredShopObject = a;
        });

    return b
  }

  private itemFilter(value: string): string[] {

    var a: Item[]
    var b: string[] = []
    
    this.dataService.getItemLike(value.toLowerCase()).subscribe(
        result => {
          a = result;
          for (let x in a) {
            var y = a[x].name;
            var z = a[x].brand;
            b.push(y);
          }
          this.filteredItemObject = a;
        });

    return b
  }

  constructor(
    public dialogRef: MatDialogRef<AddtoList>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data: any) {
      
      this.header = data.header;
      
      this.shopList = new FormGroup({  
        listShop: new FormControl('', [Validators.required]),
        listItem: new FormControl('', [Validators.required]),
        listPrice: new FormControl('', [Validators.required]),
        listQty: new FormControl('', [Validators.required]),
        listCurrency: new FormControl(this.currency[this.currencySel].abbr, [Validators.required]),
        listSpecial: new FormControl(false, [Validators.required]),
        listTrolley: new FormControl(false, [Validators.required]),
      });      

      //For edits, the "data" object should include formData with the existing values for that shop. Update the form here with those values.
      if (data.purpose == "edit") {
        this.shopList.patchValue(
        {
          listShop: data.shName,
          listItem: data.formData.label,
          listPrice: data.formData.price,
          listQty: data.formData.qty,
          listCurrency: data.formData.currency,
          listSpecial: data.formData.special,
          listTrolley: data.formData.trolley,
        }
      );
      this.shopId = data.formData.shop_id;
      this.itemId = data.formData.item_id;
      this.edit = true;
    };

    if (data.purpose == "move") {
      this.shopList.patchValue(
      {
        listShop: data.shName,
        listItem: data.formData.label,
        listPrice: data.formData.price,
        listQty: data.formData.qty,
        listCurrency: data.formData.currency,
        listSpecial: data.formData.special,
        listTrolley: data.formData.trolley,
      }
    );
    this.shopId = data.formData.shop_id;
    this.itemId = data.formData.item_id;
    this.move = true;
  };


  }

    cancel() {
      this.dialogRef.close();
    }
    save() {
      console.log("ShopObject:" + this.filteredShopObject)     
        this.dialogRef.close(
          {
            form: this.shopList.value,
            shop: this.filteredShopObject !== undefined ? this.filteredShopObject[this.filteredSelect].id : this.shopInit.id,
            item: this.filteredItemObject !== undefined ? this.filteredItemObject[0].id : this.itemInit.id,
          }
        );  
    }

    ngOnInit(): void {
      
      this.filteredShops = this.shopList.get("listShop")!.valueChanges.pipe(
        startWith(this.filteredShops || ''),
        map(value => this.shopFilter(value || '')),
      );

      this.filteredItems = this.shopList.get("listItem")!.valueChanges.pipe(
        startWith(''),
        map(value => this.itemFilter(value || '')),
      );

      this.getBaseEdit();

    }

    getBaseEdit() :void {
      if (this.edit || this.move) {
        this.dataService.getShop(this.shopId).subscribe(result => this.shopInit = result);
        this.dataService.getItem(this.itemId).subscribe(result => this.itemInit = result);
      }
    }

    //When clicked, set array to contain only clicked item
    selectItem(s: number) :void{
      if (this.filteredItemObject) {
        var a = this.filteredItemObject[s];
        this.filteredItemObject = [];
        this.filteredItemObject.push(a);
        this.itemSearchLive = false;
        console.log(this.filteredItemObject);
      }
    }

    clearItems() :void{
      this.itemSearchLive=true;
      this.shopList.patchValue({
        listItem: "",
      })
    }

    
}


/* ****************
  Item price trend
 *********************/
//Remember that this component must be declared in app.module.ts as well
@Component({
  selector: 'item-trend',
  templateUrl: '../../trend-item/trend-item-dialog.html',
  styleUrls: [],
})
export class TrendItemDialog implements OnInit {

  header: string;
  item: string;
  trend!: TrendItem[];

  //Chart data
  cLabel: string[] = [];
  cData: number[] = [];
  cTest: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<TrendItem>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data: any) {
      
      this.header = data.header;
      this.item = data.item;

  }

  ngOnInit(): void {
    this.getTrend(this.item); 
  }

  //For reference: correct/updated implementation of subscribe
  getTrend(i: string){
    this.dataService.getTrendItem(i).subscribe({
      next: (res) => this.trend = res,
      error: (err) => console.error(err),
      complete: () => this.chartData()
    }
    );
  }

  //UNIX date vs Javascript date
  dateConv(d: number) :Date {
    return new Date(d * 1000);
  }

  chartData() {
    for (let x of this.trend){
      var dt = this.dateConv(x.date)
      var d = dt.getDate().toString();
      var m = (dt.getMonth() + 1).toString();
      var y = dt.getFullYear().toString();
      this.cLabel.push( d + '/' + m + '/' + y);
      this.cData.push(x.price);
      this.cTest = true;
    }
  }

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: this.cData,
        label: 'Pricing',
        backgroundColor: 'rgba(105,240,174,0.2)',
        borderColor: 'rgba(105,240,174,1)',
        pointBackgroundColor: 'rgba(156,39,176,1)',
        pointBorderColor: 'rgba(156,39,176,1)',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        fill: 'origin',
      },
    ],
    labels: this.cLabel
  };
  
  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      x: {},
      'y-axis-0':
        {
          position: 'left',
        },
    },

    plugins: {
      legend: { display: true },
    }
  };


  public lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

    
}
