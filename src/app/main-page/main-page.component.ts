import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(private route: Router) { }

  ngOnInit() {
      let initRoute;
      let prevUrl = localStorage.getItem('prevUrl');
      if(prevUrl != 'projectslist' && prevUrl != 'userslist' && prevUrl != 'mainpage'){
            initRoute =  prevUrl;
        } else {
      if(localStorage.getItem('currentTab') == '1' || !localStorage.getItem('currentTab')){
		if((JSON.parse(localStorage.getItem('currentUser'))).userrole!='4'){
         initRoute = 'projectslist';
		 }else{
		 initRoute = 'myprojects';
		 }
         } else {
         initRoute = 'userslist'
         }
        }
       this.route.navigate([initRoute]);
  }

}
