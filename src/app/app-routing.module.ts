import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }  from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ItemsComponent } from './items/items.component';
import { ShopsComponent } from './shops/shops.component';
import { ShoppingComponent } from './shopping/shopping.component';
import { TemplatesComponent } from './shopping/templates/templates.component';
import { DetailsComponent } from './shopping/templates/details/details.component';
import { ListComponent } from './shopping/list/list.component';
import { TrolleyComponent } from './shopping/trolley/trolley.component';
import { AdminComponent } from './admin/admin.component';

import { AuthGuard } from '@auth0/auth0-angular';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], },
  { path: 'items', component: ItemsComponent, canActivate: [AuthGuard], },
  { path: 'shops', component: ShopsComponent, canActivate: [AuthGuard], },
  { path: 'shopping', component: ShoppingComponent, canActivate: [AuthGuard], },
  { path: 'shopping/list/:id', component: ListComponent, canActivate: [AuthGuard], }, /*:id refers to shoppinglist id */
  { path: 'shopping/trolley/:id/:shop', component: TrolleyComponent, canActivate: [AuthGuard], }, /*:id refers to shoppinglist id, :shop is the key for the shop */
  { path: 'shopping/templates', component: TemplatesComponent, canActivate: [AuthGuard], },
  { path: 'shopping/templates/details/:id', component: DetailsComponent, canActivate: [AuthGuard], },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
