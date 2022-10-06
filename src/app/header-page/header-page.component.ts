import { Component, OnInit, EventEmitter, Output, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { Http} from '@angular/http';

@Component({
  selector: 'app-header-page',
  templateUrl: './header-page.component.html',
  styleUrls: ['./header-page.component.scss']
})
export class HeaderPageComponent implements OnInit {
  selectedMenu;
  activepage;
  /*Variable decalration*/ 
  
  //closeResult: string;
  constructor(private modalService: NgbModal, private route: Router, @Inject(DOCUMENT) private document: Document) { }

  ngOnInit() {
  }

  togglemenu: boolean = false;
  isActive: boolean = false;
  mainmenu(){
    this.togglemenu = !this.togglemenu;
    if(this.togglemenu){
      this.document.body.classList.add('cls-wrp');
    } else {
      this.document.body.classList.remove('cls-wrp');
    }
  }

  onMenuselect(arg) {
    this.selectedMenu = arg;
    this.activepage = arg;
  }
   

  toggle() {
    this.isActive = !this.isActive;
    
    if(this.isActive){
       this.document.body.classList.add('short-menu');
    }else{
       this.document.body.classList.remove('short-menu');
    }
 }
  
    //Modal close on escape & outside click
    /*private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }*/
 

}
