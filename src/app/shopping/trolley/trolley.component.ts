import { Component, OnInit, ViewChild, AfterViewInit, } from '@angular/core';
import {Location} from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Shop, SlistItem } from '../../interfaces';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-trolley',
  templateUrl: './trolley.component.html',
  styleUrls: ['./trolley.component.scss']
})
export class TrolleyComponent implements OnInit, AfterViewInit {

  spinner:boolean;
  id!: number;
  shop!: number;
  dataSource = new MatTableDataSource<SlistItem>(); //Initiate data source class. Requires import of MatTableDataSource above.
  displayedColumns: string[] = ['price', 'name', 'nett', 'qty', 'price2'];

  costs: number = 0;
  shopDetail!: Shop;
  

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private _location: Location,
  ) {
    this.spinner = true;
  }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.shop = Number(this.route.snapshot.paramMap.get('shop'));
    this.getTrolley();
    this.getShop();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getTrolley() {
    this.dataService.getTrolley(this.id.toString(), this.shop.toString()).subscribe({
      next: (t) => this.dataSource.data = t,
      error: e => console.error(e),
      complete: () => {
        this.spinner = false;
        this.setTrolleyInit();
      }
    });
  }

  getShop() {
    this.dataService.getShop(this.shop.toString()).subscribe(
      s => this.shopDetail = s,
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  //Sets both the trolley counter and calculates trolley value
  setTrolleyInit(): void{
    //Zero the costs array
    this.costs = 0;
    for (let x of this.dataSource.data) {
      this.costs += x.qty * x.price;
    }
  }

  combinedPrice(p: number, q: number): number{
    return p * q
  }

  goBack():void {
    this._location.back();
  }

}
