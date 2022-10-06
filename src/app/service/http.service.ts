import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
	providedIn: 'root'
})

export class HttpService {
	restapiURL: any = null;
	tokenData: any = null;
	storageData: any;
	httpheader: any;

	constructor(private httpClient: HttpClient) {
	  	/*if(environment.pod_port.indexOf('newmedia.spi-global.com')>-1){
	        var hostname='182.76.143.242';
	    }else*/ if (environment.pod_port.indexOf('dev.spi-global.com') > -1) {
			var hostname = '118.185.249.8';
		} else {
			var hostname = environment.pod_port;
		}

		this.restapiURL = window.location.protocol + "//" + hostname;
	}
	
	restGetter(request: any): Observable<any> {
		return this.httpClient.get(this.restapiURL + request.url);
	}

	restPost(request: any): Observable<any> {
		return this.httpClient.post(this.restapiURL + request.url, request.params);
	}

	getToken() {
		// // Get Token from localStorage.
		this.storageData = JSON.parse(localStorage.getItem('currentUser'));
		if (this.storageData && this.storageData.token) {
			this.tokenData = this.storageData.token;
			this.httpheader = new HttpHeaders().set('Authorization', `Bearer ${this.tokenData}`);
		}
		return this.tokenData;
	}
}
