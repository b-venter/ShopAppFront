import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { DataService } from '../../../data.service';
import { TplDtl, TplItem, TplEdge, Shop, Item } from '../../../interfaces';

import { TrendItemDialog } from '../../../shopping/list/list.component';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  id!: number;
  template!: TplDtl[];
  spinner:boolean;
  get200or204 = false;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public dialog: MatDialog,
  ) { 
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.spinner = true;
  }

  ngOnInit(): void {
    this.getTemplate(this.id);
  }

  getTemplate(a: number) {

    this.dataService.getTemplateDetails(a.toString()).subscribe({
      next: (tpl) => this.template = tpl,
      error: (e) => {
        this.spinner = false;
        //Banner or toast message regarding failure
      },
      complete: () => {
        this.spinner = false;
        this.get200or204 = true;
        console.log(this.get200or204)
      }
    });
  }

  moveItemToOtherShop(b:TplEdge, key :string): void {
    this.dataService.moveTemplateItem(b, this.id.toString(), key).subscribe(
      result => {
        this.getTemplate(this.id);
      });
    }

    delShopListItem(key: string){
      //warning modal
      var a = confirm("Do you really want to remove this item from your shopping list?");
      if (a) {
        this.dataService.delTemplateItem(this.id.toString(), key).subscribe(
          result => {
            this.getTemplate(this.id);
          });
      }
    }

  //Dialog/modal related. See also the constructor above
  addDialog(): void {
    const dialogRef = this.dialog.open(AddtoTpl, {
      width: '400px',
      data: {
        header: "Add to template",
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //TODO: Add test whether close, cancel or Save
      var to :string = result.item;
      var from :string = result.shop;

      //Set up body for POST
      var post :TplEdge = {"_to": to, "_from": from, qty: result.form.listQty}

      //Run POST and retrieve key
      this.dataService.addTemplateItems(post, this.id.toString()).subscribe(
        result => {
          //if successful, re-populate the ShoppingList
          this.getTemplate(this.id);
        }
      )
      //TODO: Toaster pop-up for success
    });
  }

  editDialog(it: TplItem, sh: string): void {
    const dialogRef = this.dialog.open(AddtoTpl, {
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
      var patch :TplEdge = {"_to": to, "_from": from, qty: result.form.listQty}

      this.dataService.updateTemplateItem(patch, this.id.toString(), it.edge_id).subscribe(
        result => {
          this.getTemplate(this.id);
        }
      );
      //TODO: Toaster pop-up for success
      
    });
  }

  moveDialog(it: TplItem, sh: string): void {
    const dialogRef = this.dialog.open(AddtoTpl, {
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
      var patch :TplEdge = {"_to": to, "_from": from, qty: result.form.listQty}
      this.moveItemToOtherShop(patch, it.edge_id);

      //TODO: Toaster pop-up for success
    });
  }


  
  //TODO: fantastic little hack here! Move trenditem to own componenet rather than import from Shopping List?
  // Use elswhere to reduce repeated patterns?
  // See import above for TrendItemDialog
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
  TODO: This is currently mostly duplicated from list.components.ts. There is 
      probably a more efficient way.
 *********************/
//Remember that this component must be declared in app.module.ts as well
@Component({
  selector: 'add-template',
  templateUrl: 'add-template-dialog.html',
  styleUrls: ['add-template-dialog.css'],
})
export class AddtoTpl implements OnInit {

  templateForm: FormGroup;
  header: string;
  edit: boolean = false; //Edit is set to true when formData is present
  move: boolean = false; //Move is set to true when moveData is present


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
    public dialogRef: MatDialogRef<AddtoTpl>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) data: any) {
      
      this.header = data.header;
      
      this.templateForm = new FormGroup({  
        listShop: new FormControl('', [Validators.required]),
        listItem: new FormControl('', [Validators.required]),
        listQty: new FormControl('', [Validators.required]),
      });      

      //For edits, the "data" object should include formData with the existing values for that shop. Update the form here with those values.
      if (data.purpose == "edit") {
        this.templateForm.patchValue(
        {
          listShop: data.shName,
          listItem: data.formData.label,
          listQty: data.formData.qty,
        }
      );
      this.shopId = data.formData.shop_id;
      this.itemId = data.formData.item_id;
      this.edit = true;
    };

    if (data.purpose == "move") {
      this.templateForm.patchValue(
      {
        listShop: data.shName,
        listItem: data.formData.label,
        listQty: data.formData.qty,
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
            form: this.templateForm.value,
            shop: this.filteredShopObject !== undefined ? this.filteredShopObject[this.filteredSelect].id : this.shopInit.id,
            item: this.filteredItemObject !== undefined ? this.filteredItemObject[0].id : this.itemInit.id,
          }
        );  
    }

    ngOnInit(): void {
      
      this.filteredShops = this.templateForm.get("listShop")!.valueChanges.pipe(
        startWith(this.filteredShops || ''),
        map(value => this.shopFilter(value || '')),
      );

      this.filteredItems = this.templateForm.get("listItem")!.valueChanges.pipe(
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
      this.templateForm.patchValue({
        listItem: "",
      })
    }

    
}