import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { editorDomService } from './../editor/editorFrame-services/editorDom.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../../app-config';

@Component({
  selector: 'app-custom-input',
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss']
})
export class CustomInputComponent implements OnInit {

  @Input() name: any;
  @Input() type: any;
  @Input() id: any;
  @Input() group_id: any;
  @Input() style: any;
  @Input() data: any;
  @Input() elem: any;
  @Input() option: any;
  @Output() sendItem = new EventEmitter<any>();

  isImage = false;
  img_size: any = [];
  img_position: any = [];
  labelValue = '';

  constructor(private editorDomService: editorDomService) {
    this.img_size = this.editorDomService.img_size;
    this.img_position = this.editorDomService.img_position;
  }

  ngOnInit() {
    this.isImage = (this.elem.nodeName.toLowerCase() == 'img') ? true : false;
    this.setLabelValue();
    this.getStyleData();
  }

  /*  Get element default style */
  getStyleData(){
    if(this.elem){
      //  ------------- get font style -------------
      if(this.name == 'fontFamily'){
        this.data = window.getComputedStyle(this.elem)[this.style];
        this.data = this.data.replaceAll('"',''); 
      }
      // ------------- get font size -------------
      else if(this.name == 'fontSize'){
        this.data = window.getComputedStyle(this.elem)[this.style];
        this.data = parseInt(this.data);
      }
      // ------------- get font color & background color -------------
      else if(this.group_id == 103){
        if(this.name == 'color'){
          this.data = window.getComputedStyle(this.elem)[this.style];
          let rgb = this.data.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
          this.data = rgb.length > 3 ? this.rgbToHex(rgb[1], rgb[2], rgb[3], '') : '#000000';
        }
        else if(this.name == 'backgroundColor'){
          this.data = window.getComputedStyle(this.elem)[this.style];
          let rgb2 = this.data.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
          this.data = rgb2.length > 3 ? this.rgbToHex(rgb2[1], rgb2[2], rgb2[3], rgb2[4]) : '#000000';  
        }
      }
      // ------------- get font bold, italic & underline -------------
      else if(this.group_id == 104){
        this.data = window.getComputedStyle(this.elem)[this.style];
        if(this.data){
          this.data = ((this.name == 'bold') ? ((parseInt(this.data) > 400) ? true : false) : (this.data.includes(this.name) ? true : false))
        }
      }
      // ------------- get font Left align, right align and justify -------------
      else if(this.group_id == 105){
        this.data = window.getComputedStyle(this.elem)[this.style];
        this.data = (this.data && this.option.includes(this.data)) ?  this.data : 'left';
      }
      // ------------- get image size & position -------------
      else if(this.isImage && this.group_id == 106){
        if(this.name == 'Size'){
          if((this.elem.style.width && this.elem.style.width == this.elem.getAttribute('custom_width')) || (!this.elem.style.width && this.elem.getAttribute('width') == this.elem.getAttribute('custom_width'))){
            this.data = "Default";
          }
          else{
            this.data = window.getComputedStyle(this.elem).width;
            this.data = parseInt(this.data);

            for(let i = 0; i < this.option.length; i++){
              if(parseInt(this.option[i].size.width) >= this.data){
                this.data = this.option[i].name;
                i = this.option.length;
              }
            }
          }
        }
        else if(this.name == 'Position'){
          let size_elem = document.getElementById('Size');
          let size_type = (size_elem.getAttribute('ng-reflect-model') && size_elem.getAttribute('ng-reflect-model') != "Default") ? size_elem.getAttribute('ng-reflect-model') : 'Medium'; 
          this.img_position.forEach(element => {
            if(this.elem.style.left && element.size[size_type].includes('left: '+this.elem.style.left)){
              this.data = element.name;
            }
          });
          this.data = this.data ? this.data : 'Default';
        }
      }
      
    }
  }

  /* Every onChange event call to Update style changes in html  */
  async sendData(){
    //  ------------- Change fontFamily, color & backgroundColor -------------
    if(this.name == 'fontFamily' || this.name == 'color' || this.name == 'backgroundColor'){
      this.elem ? this.elem.style[this.style] = this.data : '';
    }
    //  ------------- Change fontSize -------------
    else if(this.name == 'fontSize'){
      this.elem ? this.elem.style[this.style] = this.data + "px" : '';
    }
    //  ------------- Change font bold, italic & underline -------------
    else if(this.name == 'bold' || this.name == 'italic' || this.name == 'underline'){
      this.data = !this.data;
      if(this.data){
        if(this.name == 'bold')
          this.elem.style[this.style] = 'bolder';
        else
          this.elem.style[this.style] = this.name;
      }
      else{
        if(this.name == 'bold')
          this.elem.style[this.style] = '400';
        else
          this.elem.style[this.style] = '';
      }
    }
    //  ------------- Change text alignment -------------
    else if(this.group_id == 105){
      this.elem.style[this.style] = this.data;
    }
    //  ------------- Change Image size & position -------------
    else if(this.isImage && this.group_id == 106){
      let size = '';
      let imgStyle = '';

      if(this.name == "Position"){
        imgStyle = this.data;
        this.data = document.getElementById('Size')['selectedOptions'][0] ? document.getElementById('Size')['selectedOptions'][0].value : 'Default';
      }
      else if(this.name == "Size"){
        imgStyle = document.getElementById('Position')['selectedOptions'][0] ? document.getElementById('Position')['selectedOptions'][0].value : 'Default';
      }

      if(this.data == "Default"){
        size = " width: " + this.elem.getAttribute('custom_width') + " !important;" + " height: " + this.elem.getAttribute('custom_height') + " !important;";
  
        if(imgStyle != "Default"){
          this.img_position.forEach(element => {
            if(imgStyle == element.name){
              size += (this.data == "Default") ? element.size['Medium'] : element.size[this.data];
            }
          });
        }
      }
      else{
        this.img_size.forEach(element1 => {
          if(element1.name == this.data){
            size = " width: " + element1.size.width + " !important;" + " height: " + element1.size.height + " !important;";
            // let pos = (imgStyle == "Default") ? "Left" : imgStyle;
            let pos = (imgStyle == "Default") ? "Default" : imgStyle;
            this.img_position.forEach(element2 => {
              if(pos == element2.name){
                size += element2.size[this.data];
              }
            });
          }
        });
      }

      this.data = (this.name == "Position") ? imgStyle : this.data;
      this.elem.setAttribute('style', size);
  
    }

    let dataSet: any = {
      "id": this.id,
      "group_id": this.group_id,
      "name": this.name,
      "type": this.type,
      "data": this.data
    } 

    this.sendItem.emit(dataSet);
  }

  /*  Set label name   */
  setLabelValue(){
    if(this.name == 'fontFamily')
      this.labelValue = 'Font family';
    else if(this.name == 'fontSize')
      this.labelValue = 'Font size';
    else if(this.name == 'color')
      this.labelValue = 'Color';
    else if(this.name == 'backgroundColor')
      this.labelValue = 'Background';
    else if(this.name == 'bold')
      this.labelValue = 'B';
    else if(this.name == 'italic')
      this.labelValue = 'I';
    else if(this.name == 'underline')
      this.labelValue = 'U';
    else if(this.name == 'Text-Align')
      this.labelValue = 'Text align';
    else 
      this.labelValue = this.name;
  }

  /*  Convert rgb color value to hex value (Ex: rgb(0,0,0) to #000000) */
  rgbToHex(r, g, b, a) {
    let str = "";  
    if(a != '')
      str = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b) + this.componentToHex(a);
    else
      str = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);

    return str;
  }

  /*  Convert number to hex  */
  componentToHex(c) {
    let hex = (parseInt(c)).toString(16);
    return ((hex.length == 1) ? ("0" + hex) : hex);
  }
}
