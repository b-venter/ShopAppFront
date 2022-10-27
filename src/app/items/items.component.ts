import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Item, ItemNew } from '../interfaces';
import { DataService } from '../data.service';
import { TrendItemDialog } from '../shopping/list/list.component';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
})

export class ItemsComponent implements OnInit, AfterViewInit {

  spinner:boolean;
  displayedColumns: string[] = ['name', 'nett', 'nett_unit', 'brand', 'edit'];
  dataSource = new MatTableDataSource<Item>(); //Initiate data source class. Requires import of MatTableDataSource above.

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
  ) { 
    this.spinner = true;
  }

  ngOnInit(): void {
    this.getItems();
  }

  ngAfterViewInit() {
    
  }

  getItems(): void {
    this.dataService.getItemsAll().subscribe({
      next: (items) => {
        this.dataSource.data = items;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        console.log(this.sort);
      },
      error: e => console.error(e),
      complete: () => this.spinner = false
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

  //up is a boolean as to whether this is an add or replace operation on the dataSource
  updateItemsTable(it: Item, up: boolean): void {
    var tb = this.dataSource.data;
    if (!up) {
      tb.push(it);
      this.dataSource.data = tb;
    } else {
      var x = tb.findIndex(m => m.id === it.id);
      tb[x] = it;
      this.dataSource.data = tb;
    }
    //TODO: Set MatDataSource to be observable, because this function does nothing worthwile unless shows up.
  }




  //Dialog/modal related. See also the constructor above
  openDialog(): void {
    const dialogRef = this.dialog.open(AddItem, {
      width: '400px',
      data: {
        header: "Add an item"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //TODO: Add test whether close, cancel or Save
      var post :ItemNew = {name: result.itemName, nett: result.itemWeight, nett_unit: result.itemUnit, brand: result.itemBrand}

      //Run POST and retrieve key
      var key = ""
      this.dataService.newItem(post).subscribe(
        result => {
          key = result;
          var localArray: Item = {id: key, name: post.name, nett: post.nett, nett_unit: post.nett_unit, brand: post.brand}; //if success, Update local array
          this.updateItemsTable(localArray, false);
        });
      //TODO: Toaster pop-up for success
    });
  }

  editDialog(it: Item): void {
    const dialogRef = this.dialog.open(AddItem, {
      width: '400px',
      data: {
        header: "Edit an item",
        formData: it,
      }
    });

    //Run PATCH
    //TODO: Add test whether close, cancel or Save
    dialogRef.afterClosed().subscribe(result => {
      var post :ItemNew = {name: result.itemName, nett: result.itemWeight, nett_unit: result.itemUnit, brand: result.itemBrand};
      var id: string = it.id;

      this.dataService.updateItem(post, id).subscribe(
        result => {
          var localArray: Item = {id: id, name: post.name, nett: post.nett, nett_unit: post.nett_unit, brand: post.brand}; //if success, Update local array
          this.updateItemsTable(localArray, true);
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
  selector: 'add-item',
  templateUrl: '../dialog-add-edit/add-item-dialog.html',
  styleUrls: ['../dialog-add-edit/add-item-dialog.css'],
})
export class AddItem {

  itemNew: FormGroup;
  header: string;

  constructor(
    public dialogRef: MatDialogRef<AddItem>,
    @Inject(MAT_DIALOG_DATA) data: any) {
      
      this.header = data.header;
      
      this.itemNew = new FormGroup({  
        itemName: new FormControl('', [Validators.required]),
        itemWeight: new FormControl('', [Validators.required]),
        itemUnit: new FormControl('', [Validators.required]),
        itemBrand: new FormControl('', [Validators.required]),
      });

      //For edits, the "data" object include formData, with the existing values for that item. Update the form here with those values.
      if (data.formData) {
        this.itemNew.patchValue(
        {
          itemName: data.formData.name,
          itemWeight: data.formData.nett,
          itemUnit: data.formData.nett_unit,
          itemBrand: data.formData.brand
        }
      )
    }


  }

    cancel() {
      this.dialogRef.close();
    }
    save() {
      this.dialogRef.close(this.itemNew.value);
    }

    
}
