import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app-config';


@Component({
  selector: 'app-addusers-page',
  templateUrl: './addusers-page.component.html',
  styleUrls: ['./addusers-page.component.scss']
})
export class AddusersPageComponent implements OnInit {
  selectedItem;
  adduser;
  projectListData;
  errmsg;
  successmsg;
  APIUrl;
  constructor(private route: Router, private http: HttpClient, public appConfig: AppConfig) {
    this.APIUrl = appConfig.config.apiURL;
  }

  /*Event for addUser*/
  addUser(data) {
    if (data.value.confpassword != data.value.password) {
      this.errmsg = 'Confirm password dose not match';
      return;
    }

    var adduserurl = this.APIUrl + "/adduser";
    let inputreq = data.value;
    this.http.post(adduserurl, inputreq).
      subscribe((data: any) => {
        var response = data;
        if (response.status) {
          this.successmsg = response.message;
          setTimeout(() => this.successmsg = '', 5000);
          this.adduser.reset();
        } else {
          this.errmsg = response.message;
        }
      })
  }
  ngOnInit() {
    this.adduser = new FormGroup({
      username: new FormControl("", Validators.compose([
        Validators.required
      ])),
      confpassword: new FormControl("", Validators.compose([
        Validators.required
      ])),
      password: new FormControl("", Validators.compose([
        Validators.required
      ])),
      email: new FormControl("", Validators.compose([
        Validators.required
      ])),
      projectname: new FormControl("", Validators.compose([
        Validators.required
      ])),
      usertype: new FormControl("", Validators.compose([
        Validators.required
      ]))
    });

    var projectlistUrl = this.APIUrl + "/projectslist";
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    this.http.post(projectlistUrl, { userid: userid }).
      subscribe((data: any) => {
        var response = data;
        this.projectListData = response;
      })

  }

}
