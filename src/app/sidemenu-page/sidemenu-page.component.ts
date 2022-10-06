import { Component, OnInit, EventEmitter, Output, Inject, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router, NavigationEnd, Event, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-sidemenu-page',
  templateUrl: './sidemenu-page.component.html',
  styleUrls: ['./sidemenu-page.component.scss']
})
export class SidemenuPageComponent implements OnInit {

  /*Varibale declation*/
  menuid;
  loginuserrole;
  userdetails;
  navigateURL: any;
  // login:boolean=false;
  @Output() checkMenu: EventEmitter<any> = new EventEmitter();
  @Output() checkLogin: EventEmitter<any> = new EventEmitter();
  @ViewChild('Projects') Projects: ElementRef;
  @ViewChild('userlist') userlist: ElementRef;

  /*set side menu active class*/
  sideIconClick(arg, e) {
    this.menuid = arg;
    localStorage.setItem('currentTab', arg);
    this.checkMenu.emit(e.srcElement.textContent);
  }

  constructor(private modalService: NgbModal, private router: Router, @Inject(DOCUMENT) private document: Document) {
    router.events.subscribe((event: Event) => {
      this.loginuserrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;      

      if (event instanceof NavigationEnd) {
        // console.log(event,"navigationstarted")
        this.navigateURL = event["url"].replace(/\//g, '');
        // console.log(this.navigateURL);
        if (this.navigateURL == 'projectslist' && this.loginuserrole == 2) {
          // this.Projects.nativeElement.click();
          this.userlist.nativeElement.removeAttribute("class", "activemenu");
          this.Projects.nativeElement.setAttribute("class", "activemenu");

        } else if (this.navigateURL == 'userslist') {
          this.Projects.nativeElement.removeAttribute("class", "activemenu");
          this.userlist.nativeElement.setAttribute("class", "activemenu");
        }
      }

    });



  }

  ngOnInit() {
    // console.log(window.location.hostname);
    let currentTab = localStorage.getItem('currentTab');
    //console.log("TEssadsa"+ localStorage.getItem('currentUser'));
    this.userdetails = (JSON.parse(localStorage.getItem('currentUser'))).username;
    // console.log(this.userdetails);
    if (this.userdetails) {
      // this.login=true;
      // console.log(this.login);
    }

    this.loginuserrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
    if ((JSON.parse(localStorage.getItem('currentUser'))).userrole == '1') {
      this.menuid = currentTab ? currentTab : 1;
    } else {
      this.menuid = currentTab ? currentTab : 2;
    }

  }

  /*Logout modal window*/
  open(content) {
    this.modalService.open(content).result.then((result) => {
      if (result == 'logout') {
        localStorage.removeItem('currentGame');
        localStorage.removeItem('currentUser');
        localStorage.clear();
        // this.router.navigate(['loginuser']);
        // console.log(window.location.hostname);
        window.location.href = '';
        this.checkLogin.emit(true);
      }
    }, (reason) => {
    });
  }

  isActive: boolean = false;
  opendropdown: boolean = false;
  togglemenu: boolean = false;
  showSubmenu: boolean = false;

  showsubmenu() {
    this.showSubmenu = !this.showSubmenu;
  }

  mainmenu() {

    this.togglemenu = !this.togglemenu;

    if (this.togglemenu) {
      this.document.body.classList.add('cls-wrp');
    } else {
      this.document.body.classList.remove('cls-wrp');
    }
  }


  toggle(arg) {
    this.isActive = !this.isActive;
    this.menuid = arg;

    if (this.isActive) {
      this.document.body.classList.add('short-menu');
    } else {
      this.document.body.classList.remove('short-menu');
    }
  }

  opendrop() {
    this.opendropdown = !this.opendropdown;
  }



}
