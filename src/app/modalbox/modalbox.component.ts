import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, NavigationEnd,Event,NavigationStart} from '@angular/router';
// import {ModalboxService} from 
@Component({
  selector: 'app-modalbox',
  templateUrl: './modalbox.component.html',
  styleUrls: ['./modalbox.component.scss'],
  // providers:[ModalboxService]
})
export class ModalboxComponent {
  pop_tips; two_column; page_number;
  static activeModal: any;
   navigateURL:any;
  // @Input() name;
  constructor(public activeModal: NgbActiveModal,private router: Router) { 
     router.events.subscribe( (event: Event) => {
       console.log(event);

            if (event instanceof NavigationEnd) {
               // console.log(event,"navigationstarted")
               this.navigateURL=event["url"].replace(/\//g,'');
               // console.log(this.navigateURL);
               if(this.navigateURL=='projectslist'){
                         this.activeModal.close("pageSwitched");
              
               }
  }
});
}


  // ngOnInit() {

  // }

  public getDismissReason(reason: any): string {
   
    return "getdismissedreason";
  }
  ok() {
    this.page_number = (document.getElementById('s_page_number') as HTMLInputElement).value;
    this.pop_tips = (document.getElementById('s_poptips') as HTMLInputElement).checked;
    this.two_column = (document.getElementById('s_twocolumn') as HTMLInputElement).checked;
    // console.log(this.pop_tips, this.two_column, this.page_number);
    if (this.page_number > 0) {
      console.log(this.pop_tips,this.two_column);
      this.activeModal.close({ "page_number": this.page_number, "poptip_c": this.pop_tips, "two_column": this.two_column });

    }
    else {
      alert("Page Number Should starts from 1");
      (document.getElementById('s_page_number') as HTMLInputElement).focus();
      return false;

    }
  }
}
//  this.activeModal.close({"poptip_c":this.pop_tips})
//this.activeModal.close(Promise.resolve({"poptip_c":this.pop_tips}))


//this.activeModal.close( new Promise(resolve=>{

//  setTimeout(() => resolve({"poptip_c":this.pop_tips}));
//}))