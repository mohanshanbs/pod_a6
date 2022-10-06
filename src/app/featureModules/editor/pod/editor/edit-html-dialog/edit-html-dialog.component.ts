import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { editorJsonService } from './../editorFrame-services/editorJson.service';
import { editorDomService } from './../editorFrame-services/editorDom.service';
import { DialogData } from '../editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-html-dialog',
  templateUrl: './edit-html-dialog.component.html',
  styleUrls: ['./edit-html-dialog.component.scss']
})

export class EditHtmlDialogComponent implements OnInit {
  myForm: FormGroup;
  fields: any = [];
  selectedJson: any = [];
  // html_body_json: any = [];
  // component_id: any;
  changedData: any = [];
  component_event: any;

  constructor(private dialogRef: MatDialogRef<EditHtmlDialogComponent>, private modalService: NgbModal,
    @Inject(MAT_DIALOG_DATA) private data: DialogData, private formBuilder: FormBuilder, private editorDomService: editorDomService,
    private cdr: ChangeDetectorRef, private _snackBar: MatSnackBar, private editorJsonService: editorJsonService) {
      dialogRef.disableClose = true;
      this.fields = data["fields"];
      this.component_event = data["event"];
      // this.html_body_json = data["html_body_json"];
      // this.component_id = data["id"];
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      inputField: [[], null],
      imageField: [[], null]
    });

    this.selectedJson = this.fields;
  }

  // get the data from eventEmiiter(sendItem) and stored into the formGroup.
  async getData(data, fieldName) {
    let field = 'status';
    let val = data ? data : '';
    // this.myForm.value[fieldName].push(val);

    let myForm = this.myForm.value[fieldName];
    let isExist = false;
    if (myForm.length > 0) {
      myForm.forEach(element => {
        if (element.id == val.id) {
          element.data = val.data;
          element.valid = val.valid;
          element.innerHtml = val.innerHtml;
          element.img_size = val.img_size != 0 ? val.img_size : element.img_size;
          element.img_position = val.img_position != 0 ? val.img_position : element.img_position;

          this.myForm[field] = element.valid ? 'VALID' : 'INVALID';
          isExist = true;
        }
      });
    }
    if (!isExist) {
      this.myForm.value[fieldName].push(val);
      if (!val.valid)
        this.myForm[field] = 'INVALID';
    }

  }

  checkInputHide(data) {
    let val: any;
    if(data[0].componentData[0]['type'] == 'img'){
      let isExist = data[0].componentData[0]['firstImage'];
      if(isExist == undefined || isExist == true)
        val = true;
      else
        val = false;
    }
    else{
      val = data[0].attributes[0].class != "hide" ? true : false;
    }

    return val;
  }

  // Save all updated content in the edit dialogbox (Temporarily)
  async saveChanges(jsonData) {
    let data: any;

    if (this.myForm.valid) {      //this.myForm.status == 'VALID'

      let mergeData = await this.merge_ChangedData(this.myForm);
      await this.changeHtmlData(this.component_event, mergeData);
      await this.updateListImage(this.component_event);

      data = await this.editorJsonService.createJSON(this.component_event, 'custom', ''); 
      data = JSON.parse(data);      
      this.changedData = data;

      let obj = Object.keys(this.changedData[0])[0];
      jsonData = this.changedData[0][obj];
      
      // await this.recursiveList(jsonData);
      this.dialogRef.close({ "changedJson": jsonData, "changedData": mergeData, "elementData": this.component_event });
    }
    else {
      this._snackBar.open('IMAGE DOES NOT EXIST', '', {
        duration: 3000,
        verticalPosition: 'top',
        // horizontalPosition: this.horizontalPosition = 'center',
        panelClass: ['mat-toolbar', 'mat-warn']
      })
    }

  }

  async merge_ChangedData(myForm){
    let mergeData = [];
    let type = ['inputField', 'imageField'];

    type.forEach(element1 => {
      myForm.value[element1] .forEach(element2 => {
        mergeData.push(element2);
      });
    });

    return mergeData;
  }

  async updateListImage(event){
    for (let i = 0; i < event.children.length; i++) {
      let elem = event.children[i].nodeName.toLowerCase();

      if(elem == 'ol' || elem == 'ul' || elem == 'table'){
        let imageList = (event.children[i]).getElementsByTagName('img');
        for (let j = 0; j < imageList.length; j++) {
          imageList[j].src = imageList[0].src;
        }
      }
      else{
        await this.updateListImage(event.children[i]);
      }
    }
  }

  async changeHtmlData(event, data){
    for (let i = 0; i < event.children.length; i++) {
      if (event.children[i].children.length > 0) {
        await this.changeHtmlData(event.children[i], data);
      }
      else{
        let dataSet = await this.findModelChange(event.children[i], data);
        if(dataSet && dataSet != undefined){
          if (event.children[i].nodeName.toLowerCase() == 'img') {
            event.children[i]['src'] = dataSet.data;
          }
          else if(dataSet.innerHtml){
            event.children[i].outerHTML = dataSet.innerHtml.outerHTML;
          }
        }
      }
    }

    let dataSet = await this.findModelChange(event, data);
    if(dataSet && dataSet != undefined){
      event.outerHTML = dataSet.innerHtml.outerHTML;
    }

  }

  async findModelChange(event, data){
    let dataSet: any = '';
    let element: any;
    let oldData: any = '';

    for(let i = 0; i < data.length; i++){
      element = data[i];

      if(element.innerHtml && element.oldData){
        oldData = $(element.oldData)[0] ? $(element.oldData)[0] : '';
      }

      if((element.innerHtml && element.innerHtml['id'] && (element.innerHtml['id'] == event['id'])) || (element.data_uuid == event['id']) 
        || (oldData != '' && oldData['id'] && (oldData['id'] == event['id']))  || (element.id == event['id'])){

        if(event.nodeName.toLowerCase() == 'img'){
          await this.addImageStyle(event, element, this.editorDomService.img_size, this.editorDomService.img_position);
          event.src = element.data;
          // dataSet = element;
        }
        else{
          if(event.nodeName.toLowerCase() == 'table'){
            if(event.tBodies[0] && event.tBodies[0].children.length > 0 && element.data.tBodies[0].children.length == event.tBodies[0].children.length){
              await this.eventRecursive(event, element.innerHtml);  
              dataSet = dataSet != '' ? dataSet : element;
              // dataSet = element;
            }
          }
          else{
            await this.eventRecursive(event, element.innerHtml);
            dataSet = dataSet != '' ? dataSet : element;
            // dataSet = element;
          }      
        }
      }
    }

    return dataSet;
  }

  // change image size and position style.
  async addImageStyle(event, data, sizeArray, postionArray){
    let standard = localStorage.getItem('projectstandard');
    let size = "";

    if(data.img_size == 0){
      if(data.img_position == 1){
        size += "position: relative; left: 30px;";
      }
      else if(data.img_position == 2){
        size += "position: relative; left: 80px;";
      }
      else if(data.img_position == 3){
        size += "position: relative; left: -60px;";
      }
    }
    if(data.img_size == 1){
      size = " width: " + sizeArray[data.img_size-1].size.width + " !important;" + " height: " + sizeArray[data.img_size-1].size.height + " !important;";
      if(data.img_position == 1){
        size += "position: relative; left: 220px;";
      }
      else if(data.img_position == 2){
        size += "position: relative; left: 500px;";
      }
      else if(data.img_position == 3){
        size += "position: relative; left: -60px;";
      }
    }
    else if(data.img_size == 2){
      size = " width: " + sizeArray[data.img_size-1].size.width + " !important;" + " height: " + sizeArray[data.img_size-1].size.height + " !important;";
      if(data.img_position == 1){
        size += "position: relative; left: 160px;";
      }
      else if(data.img_position == 2){
        size += "position: relative; left: 375px;";
      }
      else if(data.img_position == 3){
        size += "position: relative; left: -60px;";
      }
    }
    else if(data.img_size == 3){
      size = " width: " + sizeArray[data.img_size-1].size.width + " !important;" + " height: " + sizeArray[data.img_size-1].size.height + " !important;";
      if(data.img_position == 1){
        size += "position: relative; left: 60px;";
      }
      else if(data.img_position == 2){
        size += "position: relative; left: 163px;";
      }
      else if(data.img_position == 3){
        size += "position: relative; left: -60px;";
      }
    }
    else if(data.img_size == 4){
      size = " width: " + sizeArray[data.img_size-1].size.width + " !important;" + " height: " + sizeArray[data.img_size-1].size.height + " !important;";
      if(data.img_position == 1){
        size += "position: relative; left: 0px;";
      }
      else if(data.img_position == 2){
        size += "position: relative; left: 20px;";
      }
      else if(data.img_position == 3){
        size += "position: relative; left: -60px;";
      }
    }

    
    event.setAttribute('style', size);

    // set image width and height size
    // if(data.img_size != 0){
    //   for(let i = 0; i < sizeArray.length; i++){
    //     if(sizeArray[i].key == data.img_size){
    //       let size = " width: " + sizeArray[i].size.width + " !important;" + " height: " + sizeArray[i].size.height + " !important;";
    //       if(event.getAttribute('style') == null){
    //         event.setAttribute('style', size);
    //       }
    //       else{
    //         let styleList = event.getAttribute('style').split(';');
    //         let styles = "";

    //         styleList.forEach(element3 => {
    //           if(!(element3.includes('width') || element3.includes('height')) && element3 != ""){
    //             styles += element3 + ";";
    //           }
    //         });
            
    //         styles += size;
    //         event.setAttribute('style', styles);
    //       }
    //     }
    //   }
    // }

    // // set image position
    // if(data.img_position != 0){
    //   for(let i = 0; i < postionArray.length; i++){
    //     if(postionArray[i].key == data.img_position){
    //       let position = '';

    //       if(standard == "ETS"){
    //         if(postionArray[i].position == "center"){
    //           position = "position: relative; left: 50%; transform: translateX(-50%);"; 
    //         }
    //         else if(postionArray[i].position == "right"){
    //           position =  "position: relative; left: 100%; transform: translateX(-100%);";
    //         }
    //       }
    //       else{
    //         if(postionArray[i].position != "center"){
    //           position = " margin-"+postionArray[i].position+": " + '0px' + " !important;";
    //         }
    //       }

    //       if(event.getAttribute('style') == null){
    //         event.setAttribute('style', position);
    //       }
    //       else{
    //         let styleList = event.getAttribute('style').split(';');
    //         let styles = "";

    //         styleList.forEach(element3 => {
    //           if((element3.includes('width') || element3.includes('height')) && element3 != ""){
    //             styles += element3 + ";";
    //           }
    //         });

    //         if(postionArray[i].position != "center" || standard == "ETS"){
    //           styles += position;  
    //         }
            
    //         event.setAttribute('style', styles);
    //       }
    //     }
    //   }
    // }

  }

  async eventRecursive(event, data){
    if(event && data){
      // setCustomAttribute for parent node
      await this.setCustomAttribute(event, data);
      
      for (let i = 0; i < event.children.length; i++) {
        // setCustomAttribute for children node
        if(data.children[i]){
          await this.setCustomAttribute(event.children[i], data.children[i]);
          await this.eventRecursive(event.children[i], data.children[i]);
        }
      }
    }
  }

  async setCustomAttribute(event, data){
    if(event && data && event.nodeName.toLowerCase() != 'g' && event.nodeName.toLowerCase() != 'svg'){
      for(let i = 0; i < event.attributes.length; i++) {
        if(event.attributes[i].name != 'text'){
          if(event.attributes[i].name == 'offsetHeight'){
            await data.setAttribute(event.attributes[i].name, event.offsetHeight);
          }
          else{
            await data.setAttribute(event.attributes[i].name, event.attributes[i].value);
          }
        }
      }
    }
  }

  getObjectName(data) {
    let displayName = (Object.keys(data)[0]).toLowerCase();
    return displayName;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngAfterViewChecked(){
    //your code to update the model
    this.cdr.detectChanges();
  }
}
