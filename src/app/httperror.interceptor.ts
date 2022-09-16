import { Injectable } from '@angular/core';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

import { DataService } from './data.service';

@Injectable()
export class HttperrorInterceptor implements HttpInterceptor {

  constructor(
    private dataService: DataService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    request = request.clone({
      //let header = new HttpHeaders({ "Authorization": "Bearer " + this.oauthValue(), "Accept": "application/json"});
      //setHeaders: { Authorization: `Bearer ${this.dataService.oauthValue()}`, Accept: `application/json` },
      setHeaders: { Authorization: `Bearer justarandomstringfornow`, Accept: `application/json` },
  });

    return next.handle(request).pipe(
      retry(2),
      catchError((error) => {
        if (error.status == 401) {
          error.log("Server auth error 401");
          //Add token refresh action (normally in data.service)
        } else  {
          //Can replace with case. Handle various errors
        }
        return throwError(() => error);
      }),
    );  
  }

  /*
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request);
  }
  */
}
