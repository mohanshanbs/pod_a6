import {Component,OnInit, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

export interface DialogData {
    page: string;
    createlink: string;	
    status:string;
}

@Component({
    selector:'app-model-dialog',
    templateUrl:'./model-dialog.component.html',
    styleUrls:[]
})


export class modelDialogComponent implements OnInit{
    constructor(
        public dialogRef: MatDialogRef<modelDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {    
    }

    ngOnInit(){

    }
    saveDialog(){
        this.data.status = "save";
        this.dialogRef.close(this.data);
    }
    closeDialog(){
        this.data.status = "close";
        this.dialogRef.close(this.data)
    }
}