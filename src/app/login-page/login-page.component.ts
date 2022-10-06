import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Http } from '@angular/http';
import { map } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, RoutesRecognized } from '@angular/router';
import { AppConfig } from '../app-config';
import { HttpService } from '../service/http.service';
import { User } from 'src/app/models/user';
import { CognitoService } from 'src/app/services/cognito.service';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
    /*Variable decalration*/
    showlogin;
    status;
    APIUrl;
    successmsg;
    errmsg;
    isConfirm:boolean = false;
    alertMessage: string = '';
    showAlert:boolean = false;
    isForgotPassword:boolean = false;
    newPassword:string = '';
    condition:boolean = true;
    Cognitosignin = new FormGroup({
        email: new FormControl(),
        password: new FormControl()
    })
    Cognitoforgotlogin = new FormGroup({
        code: new FormControl(),
        newPassword: new FormControl()
    
    })
    Cognitosignup = new FormGroup({
        givenName: new FormControl(),
        familyName: new FormControl(),
        email: new FormControl(),
        password: new FormControl()
      })
      Cognitoconfirmsignup = new FormGroup({
        code: new FormControl()
    
      })

    /*emit upon loggedin*/
    @Output() checkLogin: EventEmitter<any> = new EventEmitter();

    /*Toggle Login and forgot password*/
    showForgotPassword() {
        this.showlogin = false;
    }
    forgotPasswordClicked(){
        this.cognitoService.forgotPassword(this.Cognitosignin.value)
        .then(() => {
            this.isForgotPassword = true;
        })
        .catch((error:any) => {
            this.displayAlert(error.message);
        })
    }

    public signUpWithCognito(){
        //console.log(this.Cognitosignup.value);
        this.cognitoService.signUp(this.Cognitosignup.value)
        .then(() => {
          this.isConfirm = true;
         })
        .catch((error:any)=>{
          this.displayAlert(error.message);
       })
    
      }
    
      public confirmSignUp(){
        var userconfirm = {...this.Cognitosignup.value, ...this.Cognitoconfirmsignup.value};
        //console.log(userconfirm);
        this.cognitoService.confirmSignUp(userconfirm)
        .then(() => {
        this.condition = !this.condition;
        this.router.navigate(['/sign-in'])
          var adduserurl = this.APIUrl + "/signupuser";
          let inputreq = this.Cognitosignup.value;
          this.http.post(adduserurl, inputreq).
          subscribe((data: any) => {
            var response = data;
            if (response.status) {
              this.successmsg = response.message;
              setTimeout(() => this.successmsg = '', 5000);
              this.Cognitosignup.reset();
            } else {
              this.errmsg = response.message;
            }
          })
        })
        .catch((error:any) =>{
          this.displayAlert(error.message);
        })
    }


      newPasswordSubmit(){
         var userconfirm = {...this.Cognitosignin.value, ...this.Cognitoforgotlogin.value};
          console.log(userconfirm);
          this.cognitoService.forgotPasswordSubmit(userconfirm, this.Cognitoforgotlogin.value.newPassword.trim())
          .then(() => {
            this.displayAlert("Password Updated");
            this.isForgotPassword = false;
          })
          .catch((error:any) => {
            this.displayAlert(error.message);
          })
      }

    /*Handles login function*/
    signInWithCognito(){
          console.log(this.Cognitosignin.value);
          this.cognitoService.signIn(this.Cognitosignin.value)
          .then(() => {
            var loginUrl = "/login";
            var inputReq = {
                email : this.Cognitosignin.value.email
            };
            this.httpService.restPost({ 'url': loginUrl, 'params': inputReq }).subscribe((responseData: any) => {
                var response = responseData;
                if (response && response.user && response.user.status == 'success') {
                    let currentUser = response.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    this.checkLogin.emit(response);
                } 
            });
            this.router.navigate(['/projectslist']);
          })
          .catch((error:any) => {
            this.displayAlert(error.message);
          })
      }

    showloginfn() {
        this.showlogin = true;
        this.router.navigate(['/']);
        this.isForgotPassword = false;
        this.condition = !this.condition;
    }

    private sub: any;
    constructor(private cognitoService : CognitoService, private httpService: HttpService, private http: Http, private route: ActivatedRoute, private router: Router, public appConfig: AppConfig) {
        this.APIUrl = appConfig.config.apiURL;
        console.log(this.httpService, " rest service data");
    }
    ngOnInit() {
        this.showlogin = true;
    }

    private displayAlert(message:string){
        this.alertMessage = message;
        this.showAlert  = true;         
      }

      signupPage(){
        this.condition = !this.condition;
      }

}