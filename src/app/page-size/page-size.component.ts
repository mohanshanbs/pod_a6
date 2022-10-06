import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, NavigationEnd,Event,NavigationStart} from '@angular/router';
interface pageSize {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-page-size',
  templateUrl: './page-size.component.html',
  styleUrls: ['./page-size.component.scss']
})
export class PageSizeComponent implements OnInit { 
  sizes: pageSize[] = [
    // {value: '8.5,10', viewValue: '8.5 x 10'},
    {value: '8.5,11', viewValue: '8.5 x 11'},
	// {value: '8.5,10.875', viewValue: '8.5 x 10.875'},
	// {value: '8,10', viewValue: '8 x 10'},
	// {value: '7.375,9.125', viewValue: '7.375 x 9.125'},
	// {value: '7.9375,10', viewValue: '7.9375 x 10'},
	// {value: '9,10.875', viewValue: '9 x 10.875'},
	// {value: '5.5,8.5', viewValue: '5.5 x 8.5'},
	// {value: '6,9', viewValue: '6 x 9'},
	// {value: '6.375,9.125', viewValue: '6.375 x 9.125'}
  ];
  selectepagesize;
  constructor(public activeModal: NgbActiveModal, 
		private cd: ChangeDetectorRef) { }

  ngOnInit() {
  	this.selectepagesize = 0;
  }

	@ViewChild('myElement') firstItem: any;

	ngAfterViewInit() {
	   this.firstItem.focus();
	   this.cd.detectChanges();
	}
	pageValue(value) {
		this.selectepagesize = value;
	}
	public getDismissReason(reason: any): string {
	    return "getdismissedreason";
	}
	ok() {
  		this.activeModal.close(this.selectepagesize);
	}
  }
