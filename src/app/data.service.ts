import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment as env } from '../environments/environment';

import { Item, ItemNew, Shop, ShopNew, SList, ShopListsAll, SlistItem, SlistEdge, SlistEdgeItem, AdmUser, TrendItem, TplDtl, TplItem, TplEdge, Cats } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  baseUrl = env.api.api;


  /* ITEMS API CALLS */
  
  getItem(id: string): Observable<Item> {
    //Note id is string, even though appear to be number. 
    var api = "/items/view/"
    return this.http.get<Item>(this.baseUrl + api + id);
  }

  getItemsAll(): Observable<Item[]> {
    var api = "/items/"
    return this.http.get<Item[]>(this.baseUrl + api + "all");
  }

  getItemLike(id: string): Observable<Item[]> {
    //Note id is string, even though appear to be number. 
    var api = "/items/like/"
    return this.http.get<Item[]>(this.baseUrl + api + id);
  }

  newItem(body: ItemNew): Observable<any> {
    var api = "/items/new"
    return this.http.post<any>(this.baseUrl + api, body);
  }

  updateItem(body: ItemNew, id: string): Observable<any> {
    var api = "/items/update/"
    return this.http.patch<ItemNew>(this.baseUrl + api + id, body)
  }


  /* SHOPS API CALLS */
  /***************** */
  getShop(id: string): Observable<Shop> {
    //Note id is string, even though appear to be number. 
    var api = "/shops/view/"
    return this.http.get<Shop>(this.baseUrl + api + id);
  }

  getShopsAll(): Observable<Shop[]> {
    var api = "/shops/"
    return this.http.get<Shop[]>(this.baseUrl + api + "all");
  }

  getShopLike(id: string): Observable<Shop[]> {
    //Note id is string, even though appear to be number. 
    var api = "/shops/like/"
    return this.http.get<Shop[]>(this.baseUrl + api + id);
  }

  newShop(body: ShopNew): Observable<any> {
    var api = "/shops/new"
    return this.http.post<any>(this.baseUrl + api, body);
  }

  updateShop(body: ShopNew, id: string): Observable<any> {
    var api = "/shops/update/"
    return this.http.patch<ShopNew>(this.baseUrl + api + id, body)
  }

  /* SHOPPING LIST API CALLS */
  /************************* */

  getListsVis(): Observable<ShopListsAll[]> {
    var api = "/shoppinglist"
    return this.http.get<ShopListsAll[]>(this.baseUrl + api + "/allvisible");
  }

  getListsAll(): Observable<ShopListsAll[]> {
    var api = "/shoppinglist"
    return this.http.get<ShopListsAll[]>(this.baseUrl + api + "/all");
  }

  getShoppingList(id: string): Observable<SList[]> {
    var api = "/shoppinglist/view/"
    return this.http.get<SList[]>(this.baseUrl + api + id);
  }

  getShoppingListName(id: string): Observable<object[]> {
    var api = "/shoppinglist/name/"
    return this.http.get<object[]>(this.baseUrl + api + id);
  }

  getTrolley(id: string, shop: string): Observable<SlistItem[]> {
    var api = "/shoppinglist/trolley/"
    return this.http.get<SlistItem[]>(this.baseUrl + api + id + '/' + shop);
  }

  updateShopListHide(body: ShopListsAll, id: string): Observable<any> {
    var api = "/shoppinglist/hide/"
    return this.http.patch<ShopListsAll>(this.baseUrl + api + id, body)
  }

  //Update Shopping List name, date
  updateShopList(body: ShopListsAll, id: string): Observable<any> {
    var api = "/shoppinglist/edit/"
    return this.http.patch<ShopListsAll>(this.baseUrl + api + id, body)
  }

  updateTrolley(body: SlistEdgeItem, id: string, id2: string): Observable<any> {
    var api = "/shoppinglist/trolley/"
    return this.http.patch<SlistEdgeItem>(this.baseUrl + api + id + "/" + id2, body)
  }
  
  newShoppingList(): Observable<any> {
    var api = "/shoppinglist/new"
    return this.http.post<any>(this.baseUrl + api, '');
  }

  makeShoppingList(id: string): Observable<any> {
    var api = "/shoppinglist/make/"
    return this.http.post<any>(this.baseUrl + api + id, '');
  }

  addShopListItems(body: SlistEdge, id: string): Observable<any> {
    var api = "/shoppinglist/additem/"
    return this.http.patch<SlistEdge>(this.baseUrl + api + id, body)
  }

  moveShopListItem(body: SlistEdge, id: string, key: string): Observable<any> {
    var api = "/shoppinglist/moveitem/"
    return this.http.patch<SlistEdge>(this.baseUrl + api + id + "/" + key, body)
  }

  delShopListItems(id: string, key: string): Observable<any> {
    var api = "/shoppinglist/delete/item/"
    return this.http.delete<any>(this.baseUrl + api + id + "/" + key)
  }

  //ShoppingList Templates
  getTemplatesAll(): Observable<ShopListsAll[]> {
    var api = "/shoppinglist"
    return this.http.get<ShopListsAll[]>(this.baseUrl + api + "/templates");
  }

  getTemplateDetails(id: string): Observable<TplDtl[]> {
    var api = "/shoppinglist/templates/details/"
    return this.http.get<TplDtl[]>(this.baseUrl + api + id);
  }

  getTemplateName(id: string): Observable<object[]> {
    var api = "/shoppinglist/templates/name/"
    return this.http.get<object[]>(this.baseUrl + api + id);
  }

  enableTemplates(): Observable<any> {
    var api = "/shoppinglist/templates/enable"
    return this.http.post<any>(this.baseUrl + api, '');
  }

  newTemplate(): Observable<any> {
    var api = "/shoppinglist/templates"
    return this.http.post<any>(this.baseUrl + api, '');
  }

  //Create new Template based on Shopping List
  makeTemplate(id: string): Observable<any> {
    var api = "/shoppinglist/templates/"
    return this.http.post<any>(this.baseUrl + api + id, '');
  }

  addTemplateItems(body: TplEdge, id: string): Observable<any> {
    var api = "/shoppinglist/templates/details/"
    return this.http.patch<SlistEdge>(this.baseUrl + api + id, body)
  }

  moveTemplateItem(body: TplEdge, id: string, key: string): Observable<any> {
    var api = "/shoppinglist/templates/moveitem/"
    return this.http.patch<TplEdge>(this.baseUrl + api + id + "/" + key, body)
  }

  //Update Template name, date
  updateTemplate(body: ShopListsAll, id: string): Observable<any> {
    var api = "/shoppinglist/templates/"
    return this.http.patch<ShopListsAll>(this.baseUrl + api + id, body)
  }

  updateTemplateItem(body: TplEdge, id: string, id2: string): Observable<any> {
    var api = "/shoppinglist/templates/details/"
    return this.http.patch<TplEdge>(this.baseUrl + api + id + "/" + id2, body)
  }

  delTemplateItem(id: string, key: string): Observable<any> {
    var api = "/shoppinglist/templates/details/"
    return this.http.delete<any>(this.baseUrl + api + id + "/" + key)
  }

  //Delete Template
  delTemplate(id: string): Observable<any> {
    var api = "/shoppinglist/templates/"
    return this.http.delete<any>(this.baseUrl + api + id)
  }

  /* TREND API CALLS */
  /***************** */

  getTrendItem(id: string): Observable<TrendItem[]> {
    //Note id is string, even though appear to be number. 
    var api = "/trend/item/"
    return this.http.get<TrendItem[]>(this.baseUrl + api + id);
  }


  /* ADMIN LIST API CALLS */
  /* ******************** */
  getAdminRole(): Observable<string> {
    var api = "/admin"
    return this.http.get<string>(this.baseUrl + api + "/maybe");
  }
  
  getDbUsers(): Observable<AdmUser[]> {
    var api = "/admin"
    return this.http.get<AdmUser[]>(this.baseUrl + api + "/users");
  }

  createDbUser(body: AdmUser): Observable<any> {
    var api = "/admin/users"
    return this.http.post<any>(this.baseUrl + api, body);
  }

  /* CATS API */
  //Change 'limit' to increase number received. e.g. limit=10 for 10 random
  catUrl = "https://api.thecatapi.com/v1/images/search?format=json&limit=1";

  getCat(): Observable<Cats[]> {
    return this.http.get<Cats[]>(this.catUrl);
  }

  constructor(private http: HttpClient) { 
    
  }
}
