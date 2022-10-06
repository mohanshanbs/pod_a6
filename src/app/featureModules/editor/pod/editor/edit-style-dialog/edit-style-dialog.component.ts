import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { editorJsonService } from './../editorFrame-services/editorJson.service';
import { editorDomService } from './../editorFrame-services/editorDom.service';
import { DialogData } from '../editor.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-style-dialog',
  templateUrl: './edit-style-dialog.component.html',
  styleUrls: ['./edit-style-dialog.component.scss']
})
export class EditStyleDialogComponent implements OnInit {

  current_element: any;
  curElem_str: any;
  fontFamilyOption: any;

  fontFamily: any;
  fontSize: any;
  fontColor: any;
  fontBgColor: any;
  fontBold: any;
  fontItalic: any;
  fontUnderline: any;
  fontLeftAlign: any;
  fontRightAlign: any;
  fontJustify: any;
  textAlign: any;

  constructor(private dialogRef: MatDialogRef<EditStyleDialogComponent>, private modalService: NgbModal,
    @Inject(MAT_DIALOG_DATA) private data: DialogData, private formBuilder: FormBuilder, private editorDomService: editorDomService,
    private cdr: ChangeDetectorRef, private _snackBar: MatSnackBar, private editorJsonService: editorJsonService) {
      this.current_element = data["element"];
      this.curElem_str = data["element"].outerHTML;
      dialogRef.disableClose = true;
    }

  ngOnInit() {
    document.body.setAttribute("class", "edit-sidebar");
    this.fontFamilyOption = this.editorDomService.styleConfig[0].option;
    this.fontFamily = window.getComputedStyle(this.current_element).fontFamily;
    
    this.getStyleData();
  }

  getStyleData(){
    if(this.current_element){
      // font style
      this.fontFamily = window.getComputedStyle(this.current_element).fontFamily;
      this.fontFamily = this.fontFamily.replaceAll('"','');
      
      // font size
      this.fontSize = window.getComputedStyle(this.current_element).fontSize;
      this.fontSize = parseInt(this.fontSize);

      // font color
      this.fontColor = window.getComputedStyle(this.current_element).color;
      let rgb = this.fontColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      this.fontColor = rgb.length > 3 ? this.rgbToHex(rgb[1], rgb[2], rgb[3], '') : '#000000';

      // font background color
      this.fontBgColor = window.getComputedStyle(this.current_element).backgroundColor;
      let rgb2 = this.fontBgColor.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)$/);
      this.fontBgColor = rgb2.length > 3 ? this.rgbToHex(rgb2[1], rgb2[2], rgb2[3], rgb2[4]) : '#000000';

      // font bold
      this.fontBold = window.getComputedStyle(this.current_element).fontWeight;
      // if(this.fontBold && (this.fontBold.includes('bolder') || this.fontBold.includes('bold'))){
      if(this.fontBold && parseInt(this.fontBold) > 400){
        this.fontBold = true;
        document.getElementById('font-bold').style.backgroundColor = 'darkgray';
      }
      else{
        this.fontBold = false;
      }

      // font Italic
      this.fontItalic = window.getComputedStyle(this.current_element).fontStyle;
      if(this.fontItalic && this.fontItalic.toLowerCase() == 'italic'){
        this.fontItalic = true;
        document.getElementById('font-italic').style.backgroundColor = 'darkgray';
      }
      else{
        this.fontItalic = false;
      }

      // font Underline
      this.fontUnderline = window.getComputedStyle(this.current_element).textDecoration;
      if(this.fontUnderline && this.fontUnderline.includes('underline')){
        this.fontUnderline = true;
        document.getElementById('font-underline').style.backgroundColor = 'darkgray';
      }
      else{
        this.fontUnderline = false;
      }

      // font Left align
      this.fontLeftAlign = window.getComputedStyle(this.current_element).textAlign;
      if(this.fontLeftAlign && this.fontLeftAlign.includes('left')){
        this.fontLeftAlign = true;
        document.getElementById('font-left').style.backgroundColor = 'darkgray';
      }
      else{
        this.fontLeftAlign = false;
      }

      // font right align
      this.fontRightAlign = window.getComputedStyle(this.current_element).textDecoration;
      if(this.fontRightAlign && this.fontRightAlign.includes('right')){
        this.fontRightAlign = true;
        document.getElementById('font-right').style.backgroundColor = 'darkgray';
      }
      else{
        this.fontRightAlign = false;
      }

      // font justify
      this.fontJustify = window.getComputedStyle(this.current_element).textDecoration;
      if(this.fontJustify && this.fontJustify.includes('center')){
        this.fontJustify = true;
        document.getElementById('font-justify').style.backgroundColor = 'darkgray';
      }
      else{
        this.fontJustify = false;
      }

    }
  }

  changeFontStyle(event){
    // this.fontFamily = event.target.value;
    this.current_element ? this.current_element.style.fontFamily = event.target.value : '';
  }

  changeFontSize(event){
    let size = event.target.value + "px";
    this.fontSize = event.target.value;
    this.current_element ? this.current_element.style.fontSize = size : '';
  }

  changeFontColor(event){
    this.fontColor = event.target.value;
    this.current_element ? this.current_element.style.color = event.target.value : '';
  }

  changeFontBgColor(event){
    this.fontBgColor = event.target.value;
    this.current_element ? this.current_element.style.backgroundColor = event.target.value : '';
  }

  changeFontBold(){
    this.fontBold = !this.fontBold;
    if(this.fontBold){
      document.getElementById('font-bold').style.backgroundColor = 'darkgray';
      this.current_element.style.fontWeight = 'bolder';
    }
    else{
      document.getElementById('font-bold').style.backgroundColor = '';
      this.current_element.style.fontWeight = '400';
    }
  }

  changeFontItalic(){
    this.fontItalic = !this.fontItalic;
    if(this.fontItalic){
      document.getElementById('font-italic').style.backgroundColor = 'darkgray';
      this.current_element.style.fontStyle = 'italic';
    }
    else{
      document.getElementById('font-italic').style.backgroundColor = '';
      this.current_element.style.fontStyle = '';
    }
    
  }

  changeFontUnderline(){
    this.fontUnderline = !this.fontUnderline;
    if(this.fontUnderline){
      document.getElementById('font-underline').style.backgroundColor = 'darkgray';
      this.current_element.style.textDecoration = 'underline';
    }
    else{
      document.getElementById('font-underline').style.backgroundColor = '';
      this.current_element.style.textDecoration = '';
    }
  }

  changeFontLeftAlign(){
    this.fontLeftAlign = !this.fontLeftAlign;
    if(this.fontLeftAlign){
      document.getElementById('font-left').style.backgroundColor = 'darkgray';
      document.getElementById('font-right').style.backgroundColor = '';
      document.getElementById('font-justify').style.backgroundColor = '';
      this.current_element.style.textAlign = 'left !important';
      this.fontRightAlign = this.fontJustify = false;
    }
    else{
      document.getElementById('font-left').style.backgroundColor = '';
      this.current_element.style.textAlign = '';
    }
  }

  changeFontRightAlign(){
    this.fontRightAlign = !this.fontRightAlign;
    if(this.fontRightAlign){
      document.getElementById('font-left').style.backgroundColor = '';
      document.getElementById('font-right').style.backgroundColor = 'darkgray';
      document.getElementById('font-justify').style.backgroundColor = '';
      this.current_element.style.textAlign = 'right !important';
      this.fontLeftAlign = this.fontJustify = false;
    }
    else{
      document.getElementById('font-left').style.backgroundColor = '';
      document.getElementById('font-right').style.backgroundColor = '';
      document.getElementById('font-justify').style.backgroundColor = '';
      this.current_element.style.textAlign = '';
    }
  }

  changeFontJustify(){
    this.fontJustify = !this.fontJustify;
    if(this.fontJustify){
      document.getElementById('font-left').style.backgroundColor = '';
      document.getElementById('font-right').style.backgroundColor = '';
      document.getElementById('font-justify').style.backgroundColor = 'darkgray';
      this.current_element.style.textAlign = 'center !important';
      this.fontLeftAlign = this.fontRightAlign = false;
    }
    else{
      document.getElementById('font-left').style.backgroundColor = '';
      document.getElementById('font-right').style.backgroundColor = '';
      document.getElementById('font-justify').style.backgroundColor = '';
      this.current_element.style.textAlign = '';
    }
  }

  rgbToHex(r, g, b, a) {
    let str = "";
    
    if(a != ''){
      str = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b) + this.componentToHex(a);
    }
    else{
      str = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    return str;
  }

  componentToHex(c) {
    let hex = (parseInt(c)).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  hexToRgb(hex, colorType) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result){
        let r= parseInt(result[1], 16);
        let g= parseInt(result[2], 16);
        let b= parseInt(result[3], 16);

        let type = (colorType == 'fontColor') ? "rgb" : "rgba";
        return type+"("+ r + "," + g + "," + b +")";//return 23,14,45 -> reformat if needed 
    } 
    return null;
  }

  saveChanges() {
    let id = this.current_element.getAttribute('id');
    let styleList = this.current_element.getAttribute('style');
    let data = {
      "id": id,
      "styleList": styleList
    }
    this.dialogRef.close(data);
  }

  closeDialog(): void {
    this.current_element.outerHTML = this.curElem_str;
    this.dialogRef.close();
  }

}
