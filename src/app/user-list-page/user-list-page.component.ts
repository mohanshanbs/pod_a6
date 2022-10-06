import { Component, OnInit, ViewChild, Inject, EventEmitter, Input, Output } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatPaginator, MatTableDataSource, MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort } from '@angular/material';
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Http } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppConfig } from '../app-config';
import CryptoJS from 'crypto-js';

/**
 * @title Table with pagination
 */
export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'app-user-list-page',
  templateUrl: './user-list-page.component.html',
  styleUrls: ['./user-list-page.component.scss']
})

export class UserListPageComponent implements OnInit {
  userListData;
  confirmmsg;
  successmsg;
  errmsg;
  APIUrl;
  displayedColumns = ['username', 'email', 'userrole', 'actions'];
  dataSource;
  loginuser;
  userCount;
  animal: string;
  name: string;
  noRecords = false;

  constructor(private http: HttpClient, private router: Router, private activatedRouter: ActivatedRoute, private modalService: NgbModal, public dialog: MatDialog, public appConfig: AppConfig, @Inject(DOCUMENT) private document: Document) {
    this.APIUrl = appConfig.config.apiURL;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AdduserDialog, {
      width: '60%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      const data = this.dataSource.data;
      console.log(result);
      this.noRecords = false;
      if (result) {
        // result.usertype == 4 ? result.userrole = "User" : result.userrole = "Admin";
        result.usertype == 5 ? result.userrole = "Guest" : (result.usertype == 4 ? result.userrole = "Student" : (result.usertype == 3 ? result.userrole = "Teacher" : result.userrole = "Admin"));
        console.log(result);
        data.unshift(result);
        if (result.status == '1') {
          this.userCount += 1;
          this.successmsg = result.message;
          setTimeout(() => this.successmsg = '', 5000);
        }
        else {
          this.errmsg = result.message;
        }
        this.dataSource.data = data;
      }
      this.router.navigateByUrl('/userslist');
    });
  }

  editDialog(element): void {
    const dialogRef = this.dialog.open(AdduserDialog, {
      width: '60%',
      data: element
    });

    dialogRef.afterClosed().subscribe(result => {
      const data = this.dataSource.data;
      console.log(result);
      this.noRecords = false;
      if (result) {
        result.usertype == (5 ? result.userrole = "Guest" : (4 ? result.userrole = "Student" : (3 ? result.userrole = "Teacher" : result.userrole = "Admin")));
        console.log(result);
        data.unshift(result);
        if (result.status == '1') {
          this.userCount += 1;
          this.successmsg = result.message;
          setTimeout(() => this.successmsg = '', 5000);
          this.getUserList();
        }
        else {
          this.errmsg = result.message;
        }
        //this.dataSource.data = data;
      }
      this.router.navigateByUrl('/userslist');
    });
  }

  /*Event to filter*/
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  /*Get project list*/
  getUserList() {
    // let userlistUrl = this.APIUrl + "/getusers";
    let userlistUrl = this.APIUrl + "/getusers";
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    this.http.post(userlistUrl, { userid: userid }).
      subscribe((data: any) => {
        let response = data;
        response = this.userData(data);
        this.userListData = response;
        console.log(this.userListData)
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.userListData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.userCount = response.length;
        if (response.length == 0) {
          this.noRecords = true;
          this.userListData = null;
        } else {
          this.noRecords = false;
        }
      })
  }

  userData(data) {
    let finalData = [];
    data.forEach(element => {
      if (finalData.length == 0) {
        finalData.push(this.mergeData(element));
      }
      else {
        let len = finalData.length;
        finalData.forEach((element2, index) => {
          if (element.id == element2.id) {
            let projectData = {
              "assign_id": element.assign_id,
              "project_id": element.assign_project_id,
              "isEditAccess": element.assigned_user_edit,
              "Assigner": element.assigner
            }
            element2['project'].push(projectData);
          }
          else if(len == index+1) {
            finalData.push(this.mergeData(element));
          }
        });
      }
    });
    return finalData;
  }

  mergeData(element) {
    let userData = {
      "id": element.id,
      "username": element.username,
      "email": element.email,
      "userrole": (element.role == 2 ? "Admin" : (element.role == 3 ? "Teacher" : (element.role == 4 ? "Student" : "Guest"))),
      "project": [
        {
          "assign_id": element.assign_id,
          "project_id": element.assign_project_id,
          "isEditAccess": element.assigned_user_edit,
          "Assigner": element.assigner
        }
      ]
    }
    return userData;
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ngOnInit() {
    this.getUserList();
    this.document.body.classList.add('wrapCont');
    this.document.body.classList.remove('open-toc');
  }
  /*Confirm action popup*/
  confirmAction(confirm, type, data) {
    let userid = data.id;
    if (type == 'delete') {
      this.confirmmsg = 'Are you sure to delete this record ?';
    } else if (type == 'mail') {
      this.confirmmsg = 'Are you sure to send mail ?';
    }
    this.modalService.open(confirm).result.then((result) => {
      if (result == 'ok') {
        if (type == 'delete') {
          let deleteuserurl = this.APIUrl + '/deleteuser';
          this.http.post(deleteuserurl, { userid: userid }).
            subscribe((data: any) => {
              let response = data;
              //if (response.status) {
              this.errmsg = response.msg;
              setTimeout(() => this.errmsg = '', 5000);
              this.getUserList();
              //} else {
              //this.errormsg = response.msg;
              // }
            })
        } else if (type == 'mail') {
          let sendmailrurl = this.APIUrl + '/sendmail';
          this.http.post(sendmailrurl, { uid: userid }).
            subscribe((data: any) => {
              let response = data;
              if (response.status) {
                this.successmsg = response.msg;
                setTimeout(() => this.successmsg = '', 5000);
              } else {
                this.errmsg = response.msg;
              }
            })
        }
      }
    }, (reason) => {
    });
  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'adduser-dialog',
  templateUrl: 'adduser-dialog.html',
  styleUrls: ['./user-list-page.component.scss']
})
export class AdduserDialog {
  // projectListDatas = [{project_name: "Alciator_5e", isEditAccess : true},{project_name: "School_mimetype",  isEditAccess : false},{project_name: "sdsdsdsdds", isEditAccess : true},{project_name: "Alciator", isEditAccess : true},{project_name: "School",  isEditAccess : false},{project_name: "education", isEditAccess : true}]
  selectedProjects = [];
  selectedItem;
  adduser;
  projectListData = [];
  errmsg;
  successmsg;
  loginuserrole;
  APIUrl;
  userid;
  isReadOnly = false;

  username;
  usertype;
  email;
  password;
  confpassword;
  userData_id;
  projects = [];
  isEdit = false;
  isAdmin = false;

  constructor(private route: Router, private http: HttpClient, public dialogRef: MatDialogRef<AdduserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public appConfig: AppConfig, private modalService: NgbModal) {
    this.APIUrl = appConfig.config.apiURL;
  }
  openSignuppage(){
    this.route.navigate(['/sign-up'])
  }
  /*Event for addUser*/
  addUser(data, isEdit) {
    if(isEdit){
      var edituserurl = this.APIUrl + "/editUserById";
      let inputreq = data.value;
      inputreq["id"] = this.userData_id;
      inputreq["project"] = this.selectedProjects;
      inputreq.userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
  
      this.http.post(edituserurl, inputreq).
        subscribe((data: any) => {
          var response = data;
          console.log(response);
          if (response.status == '1') {
            this.successmsg = response.message;
            setTimeout(() => this.successmsg = '', 5000);
            this.dialogRef.close(response);
          } else if (response.status == '0') {
            this.errmsg = response.message;
          }
        })
    }
    else{
      if (data.value.confpassword != data.value.password) {
        this.errmsg = 'Confirm password dose not match';
        return;
      }
  
      var adduserurl = this.APIUrl + "/adduser";
      var secretKey = 'princexml';
      let inputreq = data.value;
      inputreq.password = CryptoJS.AES.encrypt(data.value.password, secretKey).toString();
      inputreq["project"] = this.selectedProjects;
      inputreq.userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
  
      this.http.post(adduserurl, inputreq).
        subscribe((data: any) => {
          var response = data;
          console.log(response);
          if (response.status == '1') {
            response["project"] = this.selectedProjects;
            this.successmsg = response.message;
            setTimeout(() => this.successmsg = '', 5000);
            this.dialogRef.close(response);
          } else if (response.status == '0') {
            this.errmsg = response.message;
          }
        })
    }
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.data && this.data['id']) {
      this.isEdit = true;
      this.userData_id = this.data['id'];
      this.username = this.data['username'];
      this.usertype = this.data['userrole'];
      this.isAdmin = this.isReadOnly = this.usertype == "Admin" ? true : false;
      this.usertype = (this.usertype == "Guest" ? 5 : (this.usertype == "Student" ? 4 : (this.usertype == "Teacher" ? 3 : 2)))
      this.email = this.data['email'];
      this.projects = this.data['project'];
      this.password = "secretKey"; this.confpassword = this.password;
    }

    this.adduser = new FormGroup({
      username: new FormControl("", Validators.compose([
        Validators.required
      ])),
      password: new FormControl("", null),
      confpassword: new FormControl("", null),
      email: new FormControl("", Validators.compose([
        Validators.required
      ])),
      //  projectname: new FormControl("", Validators.compose([
      //     Validators.required
      //  ])),
      usertype: new FormControl("", Validators.compose([
        Validators.required
      ])),
      //  editval: new FormControl("", Validators.compose([
      //         Validators.required
      //      ]))
    });

    //this.loginuserrole=(JSON.parse(localStorage.getItem('currentUser'))).userrole;

    var projectlistUrl = this.APIUrl + "/projectslist";
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    this.http.post(projectlistUrl, { userid: userid }).
      subscribe((data: any) => {
        var response = data;
        if(response.length > 0){
          this.projectListData = response;

          if(this.isAdmin){
            this.projectListData.forEach(element => {
              element['isChecked'] = true;
              element['isEditAccess'] = true;
              this.assignProject(element);
            })
          }
          else{
            this.projectListData.forEach(element => {
              element['isChecked'] = false;
              element['isEditAccess'] = false;

              this.projects.forEach(element2 => {
                if (element.project_id == element2.project_id) {
                  element['isChecked'] = true;
                  element['isEditAccess'] = element2.isEditAccess;
                  let project = {
                    "project_id": element.project_id,
                    "isEditAccess": element2.isEditAccess
                  }
                  this.selectedProjects.push(project);
                }
              })
            });
          }
        }

        this.loginuserrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
      })
  }

  checkUserRole(){
    this.selectedProjects = [];
    this.isReadOnly = (this.usertype == 1 || this.usertype == 2) ? true : false;

    if(this.projectListData.length > 0){
      this.projectListData.forEach(element => {
        if(this.isReadOnly){
          element['isChecked'] = true;
          element['isEditAccess'] = true;
          this.assignProject(element);
        }
        else{
          element['isChecked'] = false;
          element['isEditAccess'] = false;
        }
      })
    }
  }

  assignProject(element){
    let project = {
      "project_id": element.project_id,
      "isEditAccess": true
    }
    this.selectedProjects.push(project);
  }

  getProjectList = (e) => {
    if (e.target.checked) {
      let project = {
        "project_id": e.target.value,
        "isEditAccess": false
      }
      this.selectedProjects.push(project)
    } else {
      this.projectListData.map((item) => {
        if (item.project_id == e.target.defaultValue) {
          item.isEditAccess = false;
        }
      });

      this.selectedProjects.map((item, index) => {
        if (item.project_id == e.target.value) {
          this.selectedProjects.splice(index, 1);
        }
      });
    }
  }

  editAccessHandler = (i) => {
    this.selectedProjects.map((item) => {
      if (item.project_id == i.project_id) {
        item.isEditAccess = i.isEditAccess = !i.isEditAccess;
      }
    })
  }
}