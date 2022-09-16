import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { DataService } from '../data.service';
import { AdmUser } from '../interfaces';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['email', 'role'];
  dataSource = new MatTableDataSource<AdmUser>(); //Initiate data source class. Requires import of MatTableDataSource above.

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  userNew = new FormGroup({  
    userEmail: new FormControl('', [Validators.required, Validators.email]),
    userRole: new FormControl('user', [Validators.required]),
  });

  constructor(
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getUsers(): void {
    this.dataService.getDbUsers().subscribe(
      u => this.dataSource.data = u,
    );
  }

  newUser(): void {
    var a = this.userNew.value;
    var b = a.userEmail!.valueOf();
    var post: AdmUser = {email: b, role: "user"}
    this.dataService.createDbUser(post).subscribe(
      //TODO: toaster pop-up
    );
  }

}
