import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../app-config';

@Component({
  selector: 'app-assignproject-page',
  templateUrl: './assignproject-page.component.html',
  styleUrls: ['./assignproject-page.component.scss']
})
export class AssignprojectPageComponent implements OnInit {
  /*Variable declaration*/
  searchuser: any;
  assignform;
  userListData;
  projectname;
  projectid;
  successmsg;
  removeUser;
  errmsg;
  APIUrl;
  editvalue;
  edit_access;
  private sub: any;
  usersList = false;
  noRecords = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, public appConfig: AppConfig, @Inject(DOCUMENT) private document: Document) {
    this.APIUrl = appConfig.config.apiURL;
  }
  ngOnInit() {
    this.assignform = new FormGroup({
      selecteduser: new FormControl("", Validators.compose([
        Validators.required
      ]))
    });
    this.sub = this.route.params.subscribe(params => {
      this.getUserList(params.id);
      this.getProjectName(params.id);
      this.projectid = params.id;
    });

    this.document.body.classList.add('wrapCont');
  }

  /*Event to get user list*/
  getUserList(arg) {
    // console.log(this.projectid)
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    let userlistUrl = this.APIUrl + "/getusers";
    this.http.post(userlistUrl, { projectid: arg, userid: userid }).
      subscribe((data: any) => {
        let response = data;
        this.userListData = null;
        if (response.length == 0) {
          this.noRecords = true;
          this.userListData = null;
        } else {
          this.noRecords = false;
          this.userListData = response;
          this.userListData.forEach(element => {
            if (element.assigned_user_edit == '1') {
              element.edit_access = true;
            } else {
              element.edit_access = false;
            }
            console.log(this.edit_access)
            // console.log(element.assign_project_id,this.projectid)
            if (element.assign_project_id == this.projectid) {
              element.assign = false;
              element.removeUser = true;
            } else {
              element.assign = true;
              element.removeUser = false;
            }
          });
        }
      })
  }


  /*Event to get project name by id*/
  getProjectName(arg) {
    let projectnameUrl = this.APIUrl + "/getprojectbyid";
    this.http.post(projectnameUrl, { projectid: arg }).
      subscribe((data: any) => {
        let response = data;
        this.projectname = response.project_name;
        this.projectid = arg;
      })
  }

  /*Event to assign project*/
  assignProject(Userdata, typeval) {

    if (typeval == 'edit') {
      if (Userdata.assigned_user_edit == '1') {
        this.editvalue = '0';
      }
      else if (Userdata.assigned_user_edit == '0') {
        this.editvalue = '1';
      }
    }
    else {
      this.editvalue = '0';
    }
    var assignuserurl = this.APIUrl + "/assignuser";
    let inputreq = {
      project_id: this.projectid,
      user_id: Userdata.id,
      assignee: (JSON.parse(localStorage.getItem('currentUser'))).userid,
      type: typeval,
      editval: this.editvalue
    };

    this.http.post(assignuserurl, inputreq).
      subscribe((data: any) => {
        let response = data;
        if (response.status) {
          this.userListData.forEach(element => {
            if (element.id == Userdata.id) {
              element.assign = false;
              element.removeUser = true;
              element.assigner = (JSON.parse(localStorage.getItem('currentUser'))).username;
              element.assigned_user_edit = this.editvalue;
            }
          })
          this.successmsg = response.msg;
          setTimeout(() => this.successmsg = '', 5000);
        }
      })
  }

  removeAssignee(user) {
    var reqUrl = this.APIUrl + "/remove_assigned_user";
    this.http.post(reqUrl, user).
      subscribe((data: any) => {
        let response = data;
        if (response.status) {
          user.assign = true;
          user.removeUser = false;
          user.assigner = null;
          user.assigned_user_edit = '0';
          user.edit_access = false;
        }
        this.successmsg = response.msg;
        setTimeout(() => this.successmsg = '', 5000);
      })
  }

  onChange(status) {
    if (status) {
      let userlistUrl = this.APIUrl + "/getAssignedUsers";
      this.http.post(userlistUrl, { projectid: this.projectid }).
        subscribe((data: any) => {
          let response = data;
          console.log(response.length)
          this.userListData = null;
          if (response.length == 0) {
            this.noRecords = true;
            this.userListData = null;
          } else {
            this.noRecords = false;
            this.userListData = response;
            this.userListData.forEach(element => {
              element.assign = false;
              element.removeUser = true;
              if (element.assigned_user_edit == '1') {
                element.edit_access = true;
              } else {
                element.edit_access = false;
              }
            });

          }
        });

    } 
    else {
      this.getUserList(this.projectid);
    }
  }
}
