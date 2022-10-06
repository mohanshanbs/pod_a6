import { Component, OnInit } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { pdfEditorService } from './featureModules/editor/pod/services/pdfEditor.service';
import { MenuService } from './menu.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  redirectotlogin;
  selectedMenu;
  addview;
  activepage;
  activebreadcrumb = true;
  name: string;
  menu: Array<any> = [];
  breadcrumbList: Array<any> = [];
  /*Listen on success login*/
  onCheckLogin(e) {
    console.log(e, "  <_");
    this.checkUserLogin();
  }

  /*Event to check session login*/
  checkUserLogin() {
    // console.log(localStorage.currentUser);
    if (localStorage.currentUser) {
      this.redirectotlogin = false;
      let curURL = localStorage.getItem('routerEndurl');
      curURL = (curURL) ? curURL.split('?')[0] : 'projectslist';
      if (curURL != '/') {
        console.log(curURL, "  curUrl");
        this.router.navigate([curURL]);
      } else {
        let userrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
        if (userrole == 1 || userrole == 2) {
          this.router.navigate(['projectslist']);
        } else {
          this.router.navigate(['myprojects']);
        }
      }
    } else {
      this.redirectotlogin = true;
    }

    // debugger;
  }

  /*Event to set breadcrumb*/
  onMenuselect(arg) {
    this.selectedMenu = arg;
    this.activepage = arg;
  }

  constructor(private router: Router, private location: Location, private activatedRoute: ActivatedRoute, private menuService: MenuService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // console.log("end url",event.url);
        localStorage.setItem('routerEndurl', event.url);
        let curURL = localStorage.getItem('routerEndurl');
        if (curURL && curURL.split('/')[1] !== 'editproject') {
          localStorage.setItem('viewer', 'false');
        }
      }
    });

    this.activatedRoute.url.subscribe(urlsegments => {

      urlsegments.forEach(segment => {

      });
    });
  }
  ngOnInit() {

    this.checkUserLogin();
    if (localStorage.getItem('currentTab') == '1' || !localStorage.getItem('currentTab')) {
      this.selectedMenu = 'Projects';
      this.activepage = 'Projects';
    }
    else if (localStorage.getItem('currentTab') == '2') {
      this.selectedMenu = 'MyProjects';
      this.activepage = 'MyProjects';
    }
    else {
      this.selectedMenu = 'Users';
      this.activepage = 'Users';
    }

    this.menu = this.menuService.getMenu();
    this.listenRouting();
  }

  listenRouting() {

    let routerUrl: string, routerList: Array<any>, target: any;
    this.router.events.subscribe((router: any) => {
      routerUrl = router.urlAfterRedirects;
      if (routerUrl && typeof routerUrl === 'string') {
        //breadcrumb
        target = this.menu;
        this.breadcrumbList.length = 0;
        // routing url, [0]=, [1] ...etc
        if (routerUrl.search('resetpassword') == -1 && routerUrl.search('passwordreset') == -1) {
          routerList = routerUrl.slice(1).split('/');
          routerList.forEach((router, index) => {

            if (router.search('editor') != -1) {
              router = "editor";
              index = index - 1;
            }

            if (isNaN(router)) {
              // menu routing
              if (target) {
                target = target.find(page => page.path.slice(2) === router);
                if (target) {
                  this.breadcrumbList.push({
                    name: target.name,
                    // routing
                    path: (index === 0) ? target.path : `${this.breadcrumbList[index - 1].path}/${target.path.slice(2)}`
                  });
                }
              }
              // breadcrumbList loop list
              if (index + 1 !== routerList.length) {
                target = target.children;
              }
            }
          });

          // console.log(this.breadcrumbList);
        }
      }
    });
  }

  changeroute() {
    let userrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
    if (userrole == 1 || userrole == 2) {
      localStorage.setItem('currentTab', '1');
      this.router.navigateByUrl('/projectslist');
      this.selectedMenu = 'Projects';
      this.activepage = 'Projects';
    } else {
      localStorage.setItem('currentTab', '2');
      this.router.navigateByUrl('/myprojects');
      this.selectedMenu = 'MyProjects';
      this.activepage = 'MyProjects';
    }
  }

}


