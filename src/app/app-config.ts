import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable()
export class AppConfig {

    config: any = null;

    constructor(
        private injector: Injector,private httpClient: HttpClient
    ){
    }

    public loadConfig() {
        const http = this.injector.get(HttpClient);
       /* if(environment.pod_port.indexOf('newmedia.spi-global.com')>-1){
            var hostname='182.76.143.242';
        }else*/ if(environment.pod_port.indexOf('dev.spi-global.com') > -1){
            var hostname='118.185.249.8';
        }else{
          var hostname=environment.pod_port;
        }
        return http.get('assets/config/config.json').pipe(
          tap((returnedConfig) => {
              this.config = returnedConfig;
              this.config.apiURL = window.location.protocol+"//"+hostname;
              this.config.hostURL = window.location.protocol+"//"+hostname;
              //this.config.uploadsURL = window.location.protocol+environment.pod_port+this.config.uploadsURL;
              // this.config.uploadsURL = window.location.protocol+environment.pod_port+this.config.uploadsURL;
              //this.config.uploadsURL = "http://182.76.143.242"+this.config.uploadsURL;
              this.config.uploadsURL = "./pod_assets/uploads/";
              //this.config.uploadsURL = window.location.protocol+hostname+":4200/uploads/";
              console.log("arrow function config ->",this.config);
          })
        ).toPromise();
    }
}
