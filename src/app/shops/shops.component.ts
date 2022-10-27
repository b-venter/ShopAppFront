import { Component, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Shop, ShopNew } from '../interfaces';
import { DataService } from '../data.service';

@Component({
  selector: 'app-shops',
  templateUrl: './shops.component.html',
  styleUrls: ['./shops.component.scss']
})

export class ShopsComponent implements OnInit, AfterViewInit {
  
  spinner:boolean;
  displayedColumns: string[] = ['name', 'branch', 'city', 'country', 'edit'];
  dataSource = new MatTableDataSource<Shop>(); //Initiate data source class. Requires import of MatTableDataSource above.

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dataService: DataService,
    public dialog: MatDialog,
  ) { 
    this.spinner = true;
  }

  ngOnInit(): void {
    this.getShops();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getShops(): void {
    this.dataService.getShopsAll().subscribe({
      next: (shops) => this.dataSource.data = shops,
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
  updateShopsTable(sh: Shop, up: boolean): void {
    var tb = this.dataSource.data;
    if (!up) {
      tb.push(sh);
      this.dataSource.data = tb;
    } else {
      var x = tb.findIndex(m => m.id === sh.id);
      tb[x] = sh;
      this.dataSource.data = tb;
    }
    //TODO: Set MatDataSource to be observable, because this function does nothing worthwile unless shows up.
  }




  //Dialog/modal related. See also the constructor above
  openDialog(): void {
    const dialogRef = this.dialog.open(AddShop, {
      width: '400px',
      data: {
        header: "Add a shop"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //TODO: Add test whether close, cancel or Save
      var post :ShopNew = {name: result.shopName, branch: result.shopBranch, city: result.shopCity, country: result.shopCountry};

      //Run POST and retrieve key
      var key = ""
      this.dataService.newShop(post).subscribe(
        result => {
          key = result;
          var localArray: Shop = {id: key, name: post.name, branch: post.branch, city: post.city, country: post.country}; //if success, Update local array
          this.updateShopsTable(localArray, false);
        });
      //TODO: Toaster pop-up for success
    });
  }

  editDialog(sh: Shop): void {
    const dialogRef = this.dialog.open(AddShop, {
      width: '400px',
      data: {
        header: "Edit a shop",
        formData: sh,
      }
    });

    //Run PATCH
    //TODO: Add test whether close, cancel or Save
    dialogRef.afterClosed().subscribe(result => {
      var post :ShopNew = {name: result.shopName, branch: result.shopBranch, city: result.shopCity, country: result.shopCountry};
      var id: string = sh.id;

      this.dataService.updateShop(post, id).subscribe(
        result => {
          var localArray: Shop = {id: id, name: post.name, branch: post.branch, city: post.city, country: post.country}; //if success, Update local array
          this.updateShopsTable(localArray, true);
        });
      //TODO: Toaster pop-up for success
    });


  }


}

/* ****************
  Add / Edit dialog/modal
 *********************/
//Remember that this component must be declared in app.module.ts as well
@Component({
  selector: 'add-shop',
  templateUrl: 'add-shop-dialog.html',
  styleUrls: ['add-shop-dialog.css'],
})
export class AddShop {

  shopNew: FormGroup;
  header: string;

  constructor(
    public dialogRef: MatDialogRef<AddShop>,
    @Inject(MAT_DIALOG_DATA) data: any) {
      
      this.header = data.header;
      
      this.shopNew = new FormGroup({  
        shopName: new FormControl('', [Validators.required]),
        shopBranch: new FormControl('', [Validators.required]),
        shopCity: new FormControl('', [Validators.required]),
        shopCountry: new FormControl('', [Validators.required]),
      });

      //For edits, the "data" object should include formData with the existing values for that shop. Update the form here with those values.
      if (data.formData) {
        this.shopNew.patchValue(
        {
          shopName: data.formData.name,
          shopBranch: data.formData.branch,
          shopCity: data.formData.city,
          shopCountry: data.formData.country
        }
      )
    }


  }

    cancel() {
      this.dialogRef.close();
    }
    save() {
      this.dialogRef.close(this.shopNew.value);
    }

    
}


