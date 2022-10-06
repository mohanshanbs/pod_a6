import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { CognitoService } from 'src/app/services/cognito.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from 'src/app/app-config';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  
  APIUrl;
  errmsg;
  successmsg;
  user:User | undefined;
  isConfirm:boolean = false;
  alertMessage: string = '';
  showAlert:boolean = false;
  Cognitosignup = new FormGroup({
    givenName: new FormControl(),
    familyName: new FormControl(),
    email: new FormControl(),
    password: new FormControl()
  })
  Cognitoconfirmsignup = new FormGroup({
    code: new FormControl()

  })

  constructor(private router:Router, private cognitoService : CognitoService, private http: HttpClient, public appConfig: AppConfig) {
    this.APIUrl = appConfig.config.apiURL;
   }

  ngOnInit(): void {
    this.user = {} as User;
    this.isConfirm = false;
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

  private displayAlert(message:string){
    this.alertMessage = message;
    this.showAlert  = true;
     
  }
  
}
