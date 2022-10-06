import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { editorDomService } from './../editor/editorFrame-services/editorDom.service';
// import { MathJax } from 'mathjax';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app-config';
import { createElement } from '@angular/core/src/view/element';

@Component({
  selector: 'app-text-field',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.css']
})

export class TextFieldComponent implements OnInit {

  config: AngularEditorConfig = {
    editable: true,
      spellcheck: true,
      height: 'auto',
      minHeight: '0',
      maxHeight: 'auto',
      width: 'auto',
      defaultFontName: 'Comic Sans MS',
      fonts: [
        {class: 'arial', name: 'Arial'},
        {class: 'times-new-roman', name: 'Times New Roman'},
        {class: 'calibri', name: 'Calibri'},
        {class: 'comic-sans-ms', name: 'Comic Sans MS'}
      ]
  };
  @Input() name: any;
  @Input() title: any;
  @Input() id: any;
  @Input() data_uuid: any;
  @Input() data: any;
  @Input() styleData: any;
  @Input() innerHtmlData: any;
  @Output() sendItem = new EventEmitter<any>();
  
  oldData: any;
  InValid_image: boolean = true;
  allElementsID: any = [];
  
  mjx_container = false;
  svgData: any;
  overlayContent = true;
  
  sizeArray: any;
  positionArray: any;
  selectedSize: any;
  selectedPosition: any;
  isEmpty = false;

  hideElements: any = [];
  index: any;
  label_array = [
    {
      "type": "h1",
      "label": "Heading 1"
    },
    {
      "type": "h2",
      "label": "Heading 2"
    },
    {
      "type": "h3",
      "label": "Heading 3"
    },
    {
      "type": "h4",
      "label": "Heading 4"
    },
    {
      "type": "h5",
      "label": "Heading 5"
    },
    {
      "type": "h6",
      "label": "Heading 6"
    },
    {
      "type": "img",
      "label": "Image URL"
    },
    {
      "type": "p",
      "label": "Paragraph"
    },
    {
      "type": "table",
      "label": "Table"
    },
    {
      "type": "ul",
      "label": "List"
    },
    {
      "type": "ol",
      "label": "List"
    },
    {
      "type": "mjx-container",
      "label": "Math-Container"
    }
  ]

  constructor(private http: HttpClient, private editorDomService: editorDomService, private appConfig: AppConfig) {
    this.sizeArray = this.editorDomService.img_size;
    this.positionArray = this.editorDomService.img_position;
  }

  ngOnInit(){
    let isLabel = false;
    let len = this.label_array.length;

    if((this.name == 'mjx-container' || this.name == 'table') && this.innerHtmlData){
      this.name = $(this.innerHtmlData)[0].nodeName.toLowerCase();
    }

    if(this.name != 'img'){
      if(this.name == 'mjx-container'){
        this.mjx_container = true;
      }
      this.data = this.innerHtmlData;
      this.oldData = this.innerHtmlData;
      this.isEmpty = $(this.data)[0].innerHTML == '' ? true : false;
    }
    else{
      this.oldData = this.data;
    }

    this.label_array.forEach((element, index = 0) => {
      if(element.type == this.name){
        // this.title = this.title +" : "+ element.label;
        this.title = element.label;
        isLabel = true;
      }
      if(len == index+1 && !isLabel){
        // this.title = this.title +" : Text";
        this.title = "Text";
      }
    });

    if(this.id.length < 3 && this.oldData){
      this.id = $(this.oldData)[0].id;
    }

    this.index = (document.getElementsByTagName('angular-editor-toolbar')).length;

  }

  // If current element is image then set isImage is true. Otherwise set false.
  checkImg(){
    let isImage = false;
    if(this.name == 'img')
      isImage = true;
    return isImage;
  }

  // EventEmitter(sendItem) to emit the data (from text-field component to edit-html-dialog component) 
  async sendData(event) {
    if(this.name == 'img'){
      let val = this.UrlExists(this.data);
      if(val)
        this.InValid_image = true;
      else
        this.InValid_image = false;
    }

    let htmlData: any;
    if(this.name != 'img'){
      if(this.name == 'mjx-container' && event.target && event.target.parentElement){
        let currentElem = (event.target.parentElement).getElementsByTagName('mjx-container')[0];
        await this.changeMTextData(currentElem);
        
        htmlData = currentElem; //event.target.children[0];
        this.data = htmlData.outerHTML;
      }
      else{
        
        htmlData = $(this.data)[0];
        if(htmlData && this.name != 'table' && this.name != 'mjx-container'){
    
          let wrapper = document.createElement('p');   //$('p');
          for(let i = 0; i < $(this.data).length; i++){
            wrapper.append($(this.data)[i]);
          }
          this.addElementID(wrapper);
          htmlData = wrapper;
          htmlData.setAttribute('text', htmlData.innerText);
        }
      }
    }

    let dataSet: any = {
      "id": this.id,
      "data_uuid": this.data_uuid,
      "data": (this.name == 'img') ? this.data : htmlData,
      "innerHtml": htmlData,
      "valid": this.InValid_image,
      "oldData": this.oldData,
      "img_size": 0,//parseInt(this.selectedSize),
      "img_position": 0,//parseInt(this.selectedPosition)
    } 

    if(this.name == 'img' && event.target && event.target.name){
      if(event.target.name == 'img_size'){
        dataSet.img_size = parseInt(event.target.value);
        // this.selectedSize = dataSet.img_size;
        // event.target.selectedIndex = this.selectedSize;
        // // this.selectedSize = ((dataSet.img_size == 4) ? "Large" : ((dataSet.img_size == 3) ? "Medium" : ((dataSet.img_size == 2) ? "Small" : ((dataSet.img_size == 1) ? "Icon" : "none"))));
      }
      else if(event.target.name == 'img_position'){
        dataSet.img_position = parseInt(event.target.value);
        // this.selectedPosition = dataSet.img_position;
        // event.target.selectedIndex = this.selectedPosition;
        // // this.selectedPosition = ((dataSet.img_position == 3) ? "Left" : ((dataSet.img_position == 2) ? "Right" : ((dataSet.img_position == 1) ? "Center" : "none")));
      }
    }

    this.sendItem.emit(dataSet);
  }

  // Add id for all elements(Recursive)
  async addElementID(event){
    if(!event.getAttribute('id')){
      event.setAttribute('id', this.createUUID());
    }

    for(let i = 0; i < event.children.length; i++){
      await this.addElementID(event.children[i]);
    }
  }

  // generate uuid
  createUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      dt = Math.floor(dt / 16);
      var r = (dt + Math.random() * 16) % 16 | 0;
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
  
  async eventRecursive(event){
    if(event.getAttribute('id')){
      this.allElementsID.push(event);
    }

    for(let i = 0; i < event.children.length; i++){
      await this.eventRecursive(event.children[i]);
    }
  }

  async changeMTextData(event){
    let mjx_type = ['mtext', 'mn'];
    let mathMMLElem: any;
    for(let i = 0; i < mjx_type.length; i++){
      let data = event.getElementsByTagName(mjx_type[i]);
      if(data){
        for(let j = 0; j < data.length; j++){
          if(data[j].attributes.text.value != data[j].innerHTML){
            // data[j].attributes.text.value = data[j].innerHTML;
            data[j].setAttribute('text', data[j].innerHTML);

            // convert MathML to svg 
            mathMMLElem = event.getElementsByTagName("math")[0].outerHTML;
            let responseData = await this.http.get(this.appConfig.config.apiURL + "/mmlToSvg", { params: { 'math': mathMMLElem} }).toPromise();
            if(responseData){
              event.getElementsByTagName("svg")[0].outerHTML = responseData;
            }
          }
        }
      }
    }
  }

  // check if the imageUrl is exist or not 
  UrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    if(http.status == 400 || http.status == 404)
      return false;
    else
      return true;
  }

  // ngAfterViewChecked(){
  //   let formTag: any = document.getElementsByTagName('form')[0];
  //   let inputTag: any = formTag.getElementsByClassName('angular-editor-wrapper');

  //   for(let i = 0; i < inputTag.length; i++){
  //     this.eventRecursive(inputTag[i]);
  //   }
  // }

  ngAfterViewInit(){
    this.removeEditor();
    // this.initialHideButton();
  }

  showEditor(event){
    this.removeEditor();
    let editor: any = this.findParentElement(event.target, false, '');
    // editor.children[0].children[0].style.display='inline-block';
    if(editor && editor.length > 0){
      editor[0].style.display='inline-flex';
      if(this.mjx_container && editor[0].parentElement.parentElement.previousElementSibling.nodeName.toLowerCase() == 'button'){
        // show preview button in mjx-container
        editor[0].parentElement.parentElement.previousElementSibling.style.display = '';
        // hide overlay content in mjx-container textbox
        editor[0].parentElement.parentElement.nextElementSibling.style.display = 'none';
      }
      else if(this.name == 'img'){
        // show dropdown button for Image input field
        editor[0].parentElement.parentElement.previousElementSibling.style.display = '';
      }
      this.hideButtons(editor[0].children[0]);
      // this.setDropDownValue(editor[0].parentElement.parentElement.previousElementSibling);
    }
  }

  findParentElement(event, found, data){
    if(!found && event && event['tagName'] && event.tagName.toLowerCase() != 'form'){
      if(event.tagName.toLowerCase() == 'angular-editor-toolbar'){
        // if(event.children[0].className == 'angular-editor-toolbar ng-star-inserted'){
          found = true;
          data = (data != '') ? data : this.hideElements.push(event);  
        // }
      }
      else if(event.className == 'angular-editor'){
        found = true;
        data = (data != '') ? data : this.hideElements.push(event.children[0]);
      }
      else{
        this.findParentElement(event.parentElement, found, data);
      }
    }

    return this.hideElements;
  }

  // hide unwanted style editor properties.
  removeEditor(){
    let editor: any = document.getElementsByTagName('angular-editor-toolbar');
    if(editor && editor.length > 0){
      for(let i = 0; i < editor.length; i++){
        editor[i].style.display = 'none';
      }
    }
    this.hidePreviewButton();
  }

  // Set selected dropdown value for image size & position.
  setDropDownValue(event){
    this.selectedSize = (this.styleData && this.styleData.style) ? (this.styleData.style.split(';')[0]).split(' ')[2] : 0;
    this.selectedPosition = (this.styleData && this.styleData.style) ? this.styleData.style.split(';')[2] : 0;
    
    if(this.selectedSize && this.selectedSize.length > 0){
      this.sizeArray.forEach(element => {
        if(element.size.width == this.selectedSize){
          event.children[0].selectedIndex = element.key;
          this.selectedSize = element.key;
          // // this.selectedSize = ((element.key == 4) ? "Large" : ((element.key == 3) ? "Medium" : ((element.key == 2) ? "Small" : ((element.key == 1) ? "Icon" : "none"))));
        }
      });
    }

    if(this.selectedPosition && this.selectedPosition.length > 0){
      this.positionArray.forEach(element => {
        if(this.selectedPosition.includes(element.position)){
          event.children[1].selectedIndex = element.key;
          this.selectedPosition = element.key;
          // // this.selectedPosition = ((element.key == 3) ? "Left" : ((element.key == 2) ? "Right" : ((element.key == 1) ? "Center" : "none")));
        }
      });
    }
  }

  hideButtons(event){
    //document.getElementsByClassName("angular-editor-textarea")[0].removeAttribute("contenteditable");
    for(let i = 0; i < event.children.length; i++){
      if(i == 2 || i == 3 || i == 4 || i == 5 || i == 9 || i == 10 || i == 11){
        if(!(i == 4 && (this.name == 'ol' || this.name == 'ul'))){
          event.children[i].style.display = 'none';
        }
      }
    }
  }

  hidePreviewButton(){
    // hide preview button in mjx-container
    let preview_btn: any = document.getElementsByClassName('btn-preview');
    for(let i = 0; i < preview_btn.length; i++){
      preview_btn[i].style.display = 'none';
    }

    // show overlay content in mjx-container textbox
    let overlay: any = document.getElementsByClassName('math_overlay');
    for(let i = 0; i < overlay.length; i++){
      overlay[i].style.display = '';
    }

    // hide image size & position drop down button in image input field
    let img_dropDown: any = document.getElementsByClassName('img_setup');
    for(let i = 0; i < img_dropDown.length; i++){
      img_dropDown[i].style.display = 'none';
    }
  }

}

