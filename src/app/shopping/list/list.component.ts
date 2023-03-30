import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

/* Breakpoint observations */
import { BreakpointObserver } from '@angular/cdk/layout';

import {Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';


import { Item, Shop, SList, SlistEdge, SlistItem, SlistEdgeItem, TrendItem } from '../../interfaces';
import { DataService } from '../../data.service';

//Table option
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

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
  name = "";
  screenSize: boolean;
  fontSize = "normal";
  renderDefaultType = true; // true = accordion | false = table

  currency :curr[] = [
    {abbr: "USD", symbol: "$", icon: "🇺🇸", value: 0},
    {abbr: "EUR", symbol: "€", icon: "🇪🇺", value: 0},
    {abbr: "KWZ", symbol: "Kz", icon: "🇦🇴", value: 0},
    {abbr: "NAD", symbol: "N$", icon: "🇳🇦", value: 0},
    {abbr: "ZAR", symbol: "R", icon: "🇿🇦", value: 0},
  ];
  currencySel = 3;

  //Table option
  displayedColumns: string[] = ['label', 'qty', 'nett', 'cost', 'trolley'];
  dataSource = new MatTableDataSource<SlistItem>(); //Initiate data source class. Requires import of MatTableDataSource above.
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) { 
    this.badge = [];
    this.screenSize = breakpointObserver.isMatched('(max-width: 490px)');
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.getShoppingList();
    this.getName(this.id.toString());
    this.setFontSize();
    this.getShoppingListTable();
  }

  setCurrency(x: number){
    this.currencySel = x;
  }

  setFontSize(): void {
    if (this.screenSize) {
      this.fontSize = "small";
    }
  }

  getShoppingList(): void {
    this.dataService.getShoppingList(this.id.toString()).subscribe({
      next: (list) => this.shopList = list,
      error: (err)=> console.log(err),
      complete: () => this.setTrolleyInit(),
    }
    );
  }

  getShoppingListTable(): void {
    this.dataService.getShoppingList(this.id.toString()).subscribe({
      next: (list) => {
        
        var list2: SlistItem[] = [];
        list.forEach(function (value){
          value.items.forEach( function (value2) {
            var listx = value2;
            list2.push(listx)
          })
        });
        
        this.dataSource.data = list2;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: e => console.error(e),
    }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //Update shopping list is used to dynamically update shopList when add/edit/remove/move
  updateShoppingList(s: SList, a: string, b?: SList) {
    switch(a) {
      case "ADD": {
        var si = this.shopList.findIndex(l => l.shop === s.shop);
        if (si < 0) {
          //-1 if not found. So need to add Shop & Items
          this.shopList.push(s)
        } else {
          //0 or more, entry for Shop already exists. Only add Items
          this.shopList[si].items.push(s.items[0])
        }
        break;
      }
      case "DEL":{
        var si = this.shopList.findIndex(l => l.shop === s.shop);
        var ii = this.shopList[si].items.findIndex(m => m.item_id === s.items[0].item_id);
        this.shopList[si].items.splice(ii, 1);
        break;
      }
      case "MOV":{
        if (typeof b !== 'undefined') {
          //Get Indices for current shop, new shop and item 
          var si = this.shopList.findIndex(l => l.shop === s.shop);
          var ni = this.shopList.findIndex(k => k.shop === b.shop);
          var ii = this.shopList[si].items.findIndex(m => m.item_id === s.items[0].item_id);
               
          //Remove from current shop - note adjustment needed if last item.
          if (this.shopList[si].items.length === 1) {
            this.shopList.splice(si, 1);
          } else {
            this.shopList[si].items.splice(ii, 1);
          }

          //Insert in new shop - existing or not
          if (ni < 0) {
            //-1 if not found. So need to add Shop & Items
            this.shopList.push(b)
          } else {
            //0 or more, entry for Shop already exists. Only add Items
            this.shopList[ni].items.push(b.items[0])
          }
        } else {
          console.error("Invalid destination shop.");
        }
        break;
      }
      case "EDT": {
          var si = this.shopList.findIndex(l => l.shop === s.shop);
          var ii = this.shopList[si].items.findIndex(m => m.item_id === s.items[0].item_id);
          this.shopList[si].items.splice(ii, 1, s.items[0]);
        break;
      }
      default: {
        console.error("No suitable action specified");
        break;
      }

    }
    this.setTrolleyInit();
  }

  getName(i: string): void {
    this.dataService.getShoppingListName(i).subscribe({
      next: (a) => {
        interface name {label:	string;}
        var b = a[0]
        var c = b as name
        this.name = c.label
      },
    });
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
    this.trolleyCosts = 0;
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
          this.trolleyCosts += a.qty * a.price;
        } else {
          this.badge[i]--;
          this.trolleyCosts -= a.qty * a.price;
        }
      }
    )
  }



  delShopListItem(key: SlistItem, shopD: string){
    //warning modal
    var a = confirm("Do you really want to remove this item from your shopping list?");
    if (a) {
      this.dataService.delShopListItems(this.id.toString(), key.edge_id).subscribe(
        result => {
          //TODO: Remove item from ShoppingList array or get ShoppingList anew
          var itemD: SList = {shop: shopD, items: [key]}
          this.updateShoppingList(itemD,"DEL");
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
      var shopA: string = result.form.listShop;
      var itemA: string = result.iteml;
      var nettA: number = result.nett;
      var nettuA: string = result.nettu;

      //Run POST and retrieve key
      this.dataService.addShopListItems(post, this.id.toString()).subscribe({
        next: (result) => {
          //if successful, update the ShoppingList array
          //result from post contains item_id
          var newItem: SList = {shop: shopA, items: [{label: itemA, nett: nettA, nett_unit: nettuA, price: post.price, currency: post.currency, qty: post.qty, trolley: post.trolley, special: post.special, tag: "", edge_id: result, item_id: to, shop_id: from}]}
          this.updateShoppingList(newItem, "ADD");
        },
        error: (err) => console.error(err)
        //TODO: Toaster pop-up for success
      })

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
          var itemE: SList = {shop: sh, items: [it]};
          itemE.items[0].currency = patch.currency;
          itemE.items[0].price = patch.price;
          itemE.items[0].qty = patch.qty;
          itemE.items[0].special = patch.special;
          itemE.items[0].tag = patch.tag;
          itemE.items[0].trolley = patch.trolley;
          this.updateShoppingList(itemE, "EDT");
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
      var froml :string = result.shopl;

      //Set up body for PATCH. The _from should be different to what was in "it"
      var patch :SlistEdge = {"_to": to, "_from": from, date: 0, price: result.form.listPrice, qty: result.form.listQty, currency: result.form.listCurrency, trolley: result.form.listTrolley, special: result.form.listSpecial, tag: ""}
      
      this.dataService.moveShopListItem(patch, this.id.toString(), it.edge_id).subscribe(
          result => {
            var itemM: SList = {shop: sh, items: [it]};
            var itemN: SList = {shop: froml, items: [it]}
            itemN.items[0].edge_id = result;
            this.updateShoppingList(itemM, "MOV", itemN);
          });

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
        this.dialogRef.close(
          {
            form: this.shopList.value,
            shop: this.filteredShopObject !== undefined ? this.filteredShopObject[this.filteredSelect].id : this.shopInit.id,
            shopl: this.filteredShopObject !== undefined ? this.filteredShopObject[this.filteredSelect].name : this.shopInit.name,
            item: this.filteredItemObject !== undefined ? this.filteredItemObject[0].id : this.itemInit.id,
            iteml: this.filteredItemObject !== undefined ? this.filteredItemObject[0].name : this.itemInit.name,
            nett: this.filteredItemObject !== undefined ? this.filteredItemObject[0].nett : this.itemInit.nett,
            nettu: this.filteredItemObject !== undefined ? this.filteredItemObject[0].nett_unit : this.itemInit.nett_unit,
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
