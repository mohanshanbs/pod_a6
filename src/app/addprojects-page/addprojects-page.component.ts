import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-addprojects-page',
  templateUrl: './addprojects-page.component.html',
  styleUrls: ['./addprojects-page.component.scss']
})
export class AddprojectsPageComponent implements OnInit {
filename;
uploaderrmsg;

/*To extract file name*/
fileEvent(fileInput){
    this.uploaderrmsg = '';
    this.filename = fileInput.target.files[0].name;
}
uploadFile(){
    if(!this.filename){
        this.uploaderrmsg = 'Please upload file!';
    }
}    
    
  constructor() { }

  ngOnInit() {
      this.uploaderrmsg = '';
  }

}
