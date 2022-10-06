import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogData } from '../editor.component';

@Component({
  selector: 'app-style-dropdown-dialog',
  templateUrl: './style-dropdown-dialog.component.html',
  styleUrls: ['./style-dropdown-dialog.component.scss']
})
export class StyleDropdownDialogComponent implements OnInit {

  styleList = ["Template-1", "Template-2"];

  constructor(private dialogRef: MatDialogRef<StyleDropdownDialogComponent>, private modalService: NgbModal, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
  }

  pageValue(value) {
    debugger
    let selectedIFrame = '';
    if(value == "Template-1"){
      selectedIFrame = "iframe1"
    }
    else{
      selectedIFrame = "iframe2"
    }
    localStorage.setItem('selectedIFrame', selectedIFrame);

    this.dialogRef.close();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}
