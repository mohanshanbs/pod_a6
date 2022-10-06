import { Injectable } from '@angular/core';
import Amplify, { Auth } from 'aws-amplify';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class CognitoService {

  constructor() { 
    Amplify.configure({
      Auth:environment.cognito
    })
  }

  public signUp(user: any): Promise<any> {
    return Auth.signUp({
      username: user.email,
      password:user.password,
      attributes:{
        email: user.email,
        given_name: user.givenName,
        family_name: user.familyName
      }
    })
      

  }

    public confirmSignUp(user: any) : Promise<any> {
      return Auth.confirmSignUp(user.email, user.code);
    }


    // this method will return user info if any user is logged in  with valid email and password
    public getUser()  : Promise<any> {
      return Auth.currentUserInfo();
    }

    public signIn(user: any) : Promise<any> {
      return Auth.signIn(user.email, user.password);
    }

    public signOut(): Promise<any> {
      return Auth.signOut();
    }


    // This method will send a new code to user via email
    public forgotPassword(user: any) : Promise<any> {
      return Auth.forgotPassword(user.email);
    }


    // we submit the new password with email and code sent to the email
    public forgotPasswordSubmit(user: any, new_password:string): Promise<any> {
      return Auth.forgotPasswordSubmit(user.email, user.code, new_password);
    }
}
