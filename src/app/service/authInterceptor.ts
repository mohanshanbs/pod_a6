import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { HttpService } from '../service/http.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: HttpService, private router: Router) { }

    // private handleAuthError(err: HttpErrorResponse): Observable<any> {
    //     if(err.status === 401 || err.status === 403){
    //         this.router.navigateByUrl('/login');
    //         return of(err.message);
    //     }
    //     return throwError(err);
    // }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to api url
        const Token = this.authenticationService.getToken();
        if (Token) {
            request = request.clone({
                setHeaders: {
                    authorization: `Bearer ${Token}`
                }
            });
        }

        return next.handle(request);
    }
}