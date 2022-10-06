import { Component, OnInit } from '@angular/core';
import { SidemenuPageComponent } from '../sidemenu-page/sidemenu-page.component';
import { HeaderPageComponent } from '../header-page/header-page.component';
import { MainPageComponent } from '../main-page/main-page.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
