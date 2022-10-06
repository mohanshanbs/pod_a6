import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as _ from 'underscore';
import { EditorElementStruture } from './editorElementStructure.service';
import { htmlEncode } from 'js-htmlencode';

interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts[] = [
  { name: 'MathJax', src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-svg.js' }
];

declare var document: any;

@Injectable()
export class editorDomService {
  public editorBar: Subject < any > = new Subject < any > ();
  private newLineObject = new Subject<any>();
  private scripts: any = {};
  public pub_sub: any = {
    startFromUniqID: '',
    elemType: '',
    DOMelement: '',
    paraStartFrom: '',
    LIstartValue: [],
    traverseCount: '',
    isSibling: false,
    resetId: '',
    tableObj: {
      firstThreeRows: '',
      lastThreeRows: '',
      inBetween: '',
      removeTill: '',
      objStartFrom: '',
      row_index: ''
    },
    minorColumn: [],
    breakCondition: false,
    objKey: ''
  }

  eventArray: any = [];
  sectionArray: any = [];
  iframeBody: any = '';
  sectionCount: number = 0;
  breakLoop: boolean = false;
  noBreak: boolean = false;
  isSave: boolean = false;
  public renderer: Renderer2;
  public subject = new Subject < any > ()
  page_model: any = '';
  sec_temp: any = '';
  condition_return: boolean = false;
  secheight: number = 0;
  startIndex: boolean = false;
  listCondition: boolean = false;
  public isRecursive: any = false;
  isDestroy: boolean = false;
  clipboardData: any;
  getasideElement: any;
  viewerheight: number = 0;
  iframejson: any;
  iframecontentDoc: any;
  watchsectionCount: number = 0;
  newLineElement: any = [];
  elementArray: any = [];
  parentSection: any = [];


  constructor(rendererFactory: RendererFactory2, public pdfEditorElementStruture: EditorElementStruture) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.subject.asObservable();
    this.pdfEditorElementStruture.subjecElement.subscribe((Obj) => {
      _.each(Obj, (x) => {
        this.pub_sub.hasOwnProperty(Obj)
      })
      this.pub_sub.startFromUniqID = Obj.startFromUniqID;
      this.pub_sub.DOMelement = Obj.DOMelement;
      this.pub_sub.elemType = Obj.elemType;
      this.pub_sub.siblingCounts = Obj.siblingCounts;
      this.pub_sub.isSibling = Obj.isSibling;
    })

    this.viewerheight = localStorage.getItem('pagesize') ? parseFloat((localStorage.getItem('pagesize')).split(',')[1]) * 96 - 60 : 910;
    this.watchsectionCount = 0;

    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }
  ngOnDestroy() {
    console.log("destroyed==");
    this.isDestroy = true;
  }
  /** function to create iframe head wise elements */
  appendIframeHeadContent = async function(json, contentDoc) {
    this.pub_sub.minorColumn = [];
    try {
      contentDoc.head.innerHTML = '';
      if (json != "") {
        this.iframejson = json
        this.iframecontentDoc = contentDoc
        let data = json;
        let _this = this;
        for (let key in data) {
          let elem_type = Object.keys(data[key])[0];
          let elem = _this.renderer.createElement(elem_type);
          if(elem_type == 'link' && (data[key][Object.keys(data[key])[0]][0]['attributes'][0].href).indexOf('iframe.css')> -1) {
            data[key][Object.keys(data[key])[0]][0]['attributes'][0].href = "../../../pod_assets/uploads/iframe.css";
          }
          //console.log(elem, data[key][Object.keys(data[key])[0]][0]['attributes'][0]);
          /* if(data[key][Object.keys(data[key])[0]].length>1) {
               let resdata = await this.createElementAttribute(elem, data[key][Object.keys(data[key])[0]][0]['attributes'][0], data[key][Object.keys(data[key])[0]][1]);
           }
           else{*/
          let resdata = await this.createElementAttribute(elem, data[key][Object.keys(data[key])[0]][0]['attributes'][0]);
          //}

          _this.renderer.appendChild(contentDoc.head, resdata)
        }
      }
      new Promise((resolve, reject) => {
        resolve('DOM appended')
      })
    } catch (error) {
      console.log(error)
    }
    this.isRecursive = true;
    this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
  }

  /** 
   * function to create iframe body page wise elements 
   * json : json of the html
   * contentDoc: iframe 
   * pageNo: page no for next and previous event
   * state : boolean to break html page wise or append full html to DOM
   * save :  boolean for conditional attributes for uniqId etc
   * */

  iframe_body: any = '';
  appendIframePageWiseContent = async function(page_model, contentDoc, pageNo) {
    // contentDoc.addEventListener('scroll',function(){
    //     alert('as')
    // })
    this.iframe_body = contentDoc;
    this.sectionCount = page_model.sectionArray.length;
    this.breakLoop = false;
    this.noBreak = false;
    this.compress_object = false;
    this.condition_return = false;
    this.secheight = 0;
    this.startIndex = false;
    // this.enterLoop =false;
    this.isSave = false;


    contentDoc.body.innerHTML = '';
    this.iframeBody = contentDoc.body;
    this.sec_temp = '';
    this.page_sec = '';
    this.page_model = page_model;
    this.listCondition = false;
    this.minor_column = false;
    let page_sec_size = localStorage.getItem('pagesize');
    if(page_sec_size) {
       var p_height = parseInt(page_sec_size.split(',')[1]);
       var r_height = (p_height - 0.5) + 'in';
    }
    try {
      /*let breakupJsonStatus = localStorage.getItem('breakuphtml');
      if(!breakupJsonStatus) {*/
        
      let _this = this;
      this.sec_temp = this.renderer.createElement('section')
      this.sec_temp.setAttribute('id', 'section_' + this.sectionCount)
      this.sec_temp.setAttribute('class', 'rm_mrgn_0 editor-frame dynamicSection');
      this.page_sec = this.renderer.createElement('section');
      this.page_sec.setAttribute('page_section', true);
      // this.renderer.setStyle(this.sec_temp, 'display', 'inline-block')
      this.sec_temp.appendChild(this.page_sec);
      this.iframeBody.appendChild(this.sec_temp);
      if(this.sectionCount > 0) {
       /* let iframe  = document.getElementById("editableFrame");
        let contentdocument = ( < HTMLIFrameElement > iframe).contentDocument;
        let tablelist = contentdocument.querySelectorAll('table');
        if(tablelist.length > 0) {
        for(let i=0; i< tablelist.length; i++){
            let curwidth:any = window.getComputedStyle(tablelist[i], null).getPropertyValue("width");
            curwidth = parseFloat(curwidth.split('px')[0]);
            if(curwidth > 710) {
                 var differencewidth = curwidth - 710;
                var scaleper = (differencewidth * 100) / curwidth;
                var scaleval = (1/100)*scaleper;
                scaleval = 1-scaleval;
                tablelist[i].style.transform = 'translate(-'+(scaleper/2)+'%,-'+(scaleper/2)+'%) scale('+scaleval+')';
            }
        }}*/
      }
      for (let keyx in page_model.json) { 
        if (this.pub_sub.startFromUniqID == '' && this.compress_object) {
          this.elementNotRemoveCondition(page_model.json, keyx)
          break;
        }
        let elem_test = await this.createElement('', page_model.json[keyx], this.page_sec);

        if (!this.condition_return && (this.pub_sub.elemType == 'pagebreakInside' || this.pub_sub.elemType == 'default')) {
          let key_1 = Object.keys(page_model.json[JSON.parse(keyx)])
          if (!page_model.json[keyx][key_1[0]][0].hasOwnProperty('attributes'))
            break;

          if (this.pub_sub.isSibling) {
            let value = this.pdfEditorElementStruture.checkElementExist(this.pub_sub, page_model.json, false, '', '', true)
            if (value) {
              this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, page_model.json[(value - 1)], this.sectionCount, '', '', false);
              page_model.json[0]['attributes'][0].isbelongto = '';
              this.condition_return = true;
              return
            }
          } else if (this.pub_sub.DOMelement && (page_model.json[keyx][key_1[0]][0]['attributes'][0].uniqid == this.pub_sub.startFromUniqID) && (page_model.json[JSON.parse(keyx)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toLowerCase()))) {
            this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, page_model.json[JSON.parse(keyx)], this.sectionCount, '', '', false);
            this.pub_sub.DOMelement = '';
            this.condition_return = true;
          }
        }

        if (this.breakLoop)
          break;

      }
      //if(!this.isSave){
      for (let keyx in page_model.json) {
        // this.pub_sub.resetId = this.pub_sub.resetId == ''?this.pub_sub.startFromUniqID:this.pub_sub.resetId;
        await this.pdfEditorElementStruture.resetJSON(page_model.json[keyx], this.isSave, this.sectionCount, this.pub_sub);
      }
      //}

      if (this.pub_sub.minorColumn.length >= 1)
        await this.minorColumn(this.pub_sub.minorColumn, contentDoc, true)

      // let copy = this.sec_temp.innerHTML;
      // this.iframeBody.innerHTML='';
      // this.iframeBody.innerHTML = copy;
      // let section_elements = this.iframeBody.querySelectorAll( 'body > *' );
      // Array.prototype.slice.call(section_elements).map((e)=> {
      //     e.addEventListener("click", this.mouseClickEvent);
      // })


      // if(state){
      //     this.sectionArray=[];
      //     this.sectionCount=0;
      //     new Promise((resolve,reject)=>{
      //         resolve(page_model)
      //     })
      // }else{
      // page_model.sectionCount = this.sectionCount;
      this.page_sec.style.height = r_height;
      page_model.iframeBody = this.iframeBody;
      page_model.isRecursive = this.isRecursive;
      page_model.sectionArray.push(this.sec_temp);
      
      // this.subject.next(page_model)
      return new Promise((resolve, reject) => {
        resolve(page_model)
      })
      // }

    } catch (error) {
      console.log(error)
    }
  }

  public minor_column: false;
  minorColumn = async function(array, contentDoc, checkMajorIdExist) {
    this.minor_column = true;
    if (checkMajorIdExist) {
      for (var i = 0; i < array.length; i++) {
        if ((contentDoc.body.getElementsByClassName(array[i].id).length == 0) && array[i].status == true) {
          let elem: any = contentDoc.body.querySelectorAll("[minor_id=" + array[i].id + "]");
          if (elem.length > 0) {
            elem.forEach((x) => {
              x.parentNode.removeChild(x)
              array[i].status = false;
            })
          } else {
            array[i].status = false;
          }

        }
      }
    } else {
      let rev_array = array;
      rev_array.reverse();
      for (var i = 0; i < rev_array.length; i++) {
        if (contentDoc.body.getElementsByClassName(rev_array[i].id).length > 0) {
          if (rev_array[i].status)
            return

          this.noBreak = true;
          this.breakLoop = false;
          let sec_temp = this.renderer.createElement('section')
          sec_temp.setAttribute('id', 'removable')
          await this.createElement(sec_temp, rev_array[i].data, '');
          let elem: any = rev_array[i].parentId == 'body' ? contentDoc.body : contentDoc.body.querySelectorAll("[uniqid='" + rev_array[i].parentId + "']")[0];
          let appendAtIndex: any = '';
          if (rev_array[i].afterElemId == '') {
            appendAtIndex = 0;
          } else {
            appendAtIndex = contentDoc.body.querySelectorAll("[uniqid='" + rev_array[i].parentId + "']")[0].childNodes ? Math.round(Array.from(contentDoc.body.querySelectorAll("[uniqid='" + rev_array[i].parentId + "']")[0].childNodes).indexOf(contentDoc.body.querySelectorAll("[uniqid='" + rev_array[i].afterElemId + "']")[0]) + 1) : 0;
          }


          elem.insertBefore(sec_temp.childNodes[0], elem.childNodes[appendAtIndex]);
          rev_array[i].status = true;
          //array.splice(i,1)
          //elem.appendChild(sec_temp.childNodes[0]);
          //this.renderer.appendChild(array[i].parentId,sec_temp.childNodes[0])
          console.log('created')
        }
      }
      new Promise((resolve, reject) => {
        resolve()
      })
      rev_array.reverse()
    }

  }

  /** 
   * timeout function for delay rendering
   */
  timeout = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * image DOM rendering completion event trigger
   */
  imageRender = async function(event) {

    // console.log(event.complete)
    if (!event.complete) {
      await this.timeout(100)
      this.imageRender(event)
    }

    if (event.complete == true) {
      return new Promise((resolve, reject) => {
        resolve('completed')
      })
    }
  }
  /** 
   * function to start next page where it left from previous page
   */
  setStartValue = async function(element, data, key) {
    switch (element.nodeName.toLowerCase()) {
      case 'p':
      case 'span':
        if (Object.keys(data[key])[0] == 'text') {
          await this.appendTextNode(element, data[key][Object.keys(data[key])[0]], this.pub_sub.paraStartFrom);
          this.pub_sub.paraStartFrom = 0;
        }
        this.pub_sub.LIstartValue = []
        break;
      case 'li':
        this.pdfEditorElementStruture.list_service.listStructure(this.pub_sub, element, false, this.sectionCount, '', '')
        this.pub_sub.paraStartFrom = 0;
        break;
      default:
        // this.pub_sub.LIstartValue=[];
        if (Object.keys(data[key])[0] == 'text') {
          await this.appendTextNode(element, data[key][Object.keys(data[key])[0]], this.pub_sub.paraStartFrom);
          this.pub_sub.paraStartFrom = 0;
        }
        this.pub_sub.LIstartValue = []
        // await this.appendTextNode(element,data[key][Object.keys(data[key])[0]],this.pub_sub.paraStartFrom);
        //break;
    }
    // this.startIndex= false
    new Promise((resolve, reject) => {
      resolve('created')
    })
  }

  /** function to create element */
  createElement = async function(parent, json, contentDocBody) {
    if (!this.isDestroy) {
      // console.log(json);
      let elem_type: any = '';
      let element: any = '';
      let data: any = ''
      let c = 0;
      let sectionHeight: any = '';
      elem_type = Object.keys(json)[0];
      //console.log(Object.keys(json));

      if (Object.keys(json)[0] == "table") {
        this.getasideElement = json;
        //console.log(this.getCurrentElement);
      }
      if (Object.keys(json)[0] == "aside") {
        this.getasideElement = json;
        //console.log(this.getCurrentElement);
      }
      // console.log(elem_type);
      // console.log(json);
      if (json[elem_type][0]['attributes'][0].hasOwnProperty('isbelongTo') && !this.startIndex && !this.noBreak) {
        if (json[elem_type][0]['attributes'][0].isbelongTo != '')
          return parent ? parent : contentDocBody;
      }
      /*  if (json[elem_type][0].attributes[0].hasOwnProperty('isbelongTo') && !this.startIndex && !this.noBreak) {
           if (json[elem_type][0]['attributes'][0].isbelongTo != '')
               return parent ? parent : contentDocBody;
       }*/

      if (json[elem_type][0]['attributes'][0]['class'] != undefined && !this.noBreak) {
        if (json[elem_type][0]['attributes'][0]['class'].includes('minor-column')) {
          if (!this.pub_sub.minorColumn.some((x) => { return x.id == json[elem_type][0]['attributes'][0]['minor_id'] })) {

            // if(parent!= '' || parent != undefined){
            //     if(parent.classList.contains('mhhe-pod--glos-par')){
            //         parent.parentNode.getAttribute('id')
            //     }else{
            //         parent.getAttribute('id')
            //     }
            // }else{
            //     'body'
            // }

            this.pub_sub.minorColumn.push({
              'id': json[elem_type][0]['attributes'][0]['minor_id'],
              'data': json,
              'parentId': (parent != '' || parent != undefined) ? (parent.classList.contains('mhhe-pod--glos-par')) ? parent.parentNode.getAttribute('uniqid') : parent.getAttribute('uniqid') : 'body',
              'afterElemId': parent.childNodes.length > 0 ? parent.lastElementChild.getAttribute('uniqid') : '',
              'status': false
            })
            // js   on[elem_type][0]['attributes'][0].isbelongTo = 'page_'+this.sectionCount;
          }
          return
        }
      }

      element = this.renderer.createElement(elem_type);
      //if(!this.isSave){
      element.setAttribute('isbelongTo', 'page_' + this.sectionCount);
      // element.setAttribute('editorListener','')
      json[elem_type][0]['attributes'][0].isbelongTo = 'page_' + this.sectionCount;
      //}
      // this.customFrame = document.getElementById("editableFrame");
      element.addEventListener('click', this.mouseClickEvent);
      element.addEventListener('keypress', this.onkeyPressEvent);
      // element.addEventListener('copy',this.copiedElement);
      element.addEventListener('paste', this.pasteElement);
     
      //element.addEventListener('mouseenter',this.mouseEntereEvent);
      //element.addEventListener('mouseleave',this.mouseLeaveEvent);
      //element.addEventListener('mousedown',this.mouseDownEvent);
      //element.addEventListener('DOMNodeRemovedFromDocument',this.OnNodeRemovedFromDocument);
      // console.log("element check li",element)
      if (parent)
        this.renderer.appendChild(parent, element)
      else if (contentDocBody)
        contentDocBody.appendChild(element);



      data = json[elem_type];
      try {
        for (let key in data) {

          if (!this.breakLoop) { 

            if (Object.keys(data[key])[0].toLowerCase() == 'attributes') {
              await this.createElementAttribute(element, data[key][Object.keys(data[key])[0]][0]);


              if (data[0]["attributes"][0].uniqid == this.pub_sub.startFromUniqID && !this.isSave) {
                await this.setStartValue(element, data, key)
                // this.startIndex = true;
              }

              // if(!element.classList.contains('mhhe-pod--minor-float') || !element.classList.contains('mhhe-pod--glos-entry')){
              if (element.nodeName.toLowerCase() == 'img') {
                // this.secheight += element.nodeName.toLowerCase() == 'img'?JSON.parse(data[0]["attributes"][0].offsetHeight):0;
                await this.imageRender(element);
              }


              if (element.nodeName.toLowerCase() == 'figure') { //figure max height issue eg: bohm chapter 5 refer
                if (element.classList.contains("mhhe-pod--image-100"))
                  element.setAttribute("style", "max-height:100% !important");
                // element.style.maxHeight="100% !important";


              }

              if (element.nodeName.toLowerCase() == "span") { // span  bg color and color issue
                if (element.style.color == "rgb(0, 0, 0)" && element.style.backgroundColor == "rgb(0, 0, 0)") {
                  console.log(element);
                  element.style.backgroundColor = "";
                }
              }
              // }
              if (element.nodeName.toLowerCase() == "img") {
                // if(element.parentElement.parentElement.getAttribute("class").indexOf("sbs")>-1 )
                //     var newheight=this.sec_temp.getBoundingClientRect().height;
                // else
                var newheight = this.sec_temp.getBoundingClientRect().height + element.offsetHeight;
                if (element.closest("figure") != null) {
                  if (Math.round(newheight) > this.viewerheight && element.closest("figure").classList.contains("mhhe-pod--image-75to50-wrap")) { // console.log("yeslarge",element);
                    this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                    this.breakLoop = true;

                  }
                }
                // else if(Math.round(newheight)>this.viewerheight && element.parentElement.nodeName.toLowerCase()=="figure"&&element.parentElement.parentElement.getAttribute("class").indexOf("sbstriple-one")>-1){
                //     this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                //     this.breakLoop = true;
                // }


              }


              // if(element.hasClass("card-summary"))
              //     debugger;

              let composedHeight = Math.round(this.viewerheight / 5);
              let viewerReducedFeight = this.viewerheight - composedHeight;
              var elementoffsetHeight = parseInt(element.getAttribute('offsetheight'));
              var difference = function (a, b) { return Math.abs(a - b); }

              if (element.nodeName.toLowerCase() == "aside") {
                
                sectionHeight = Math.round(this.sec_temp.offsetHeight) + element.offsetHeight;
                var tempSectionHight = sectionHeight + elementoffsetHeight;
                
                let remainingSpace = difference(this.viewerheight,tempSectionHight);
                let heightRatio = this.viewerheight > 1000 ? 2 : 8;
                let compareHeight = Math.round(this.viewerheight * heightRatio / 100);
                let diffSpace = difference(elementoffsetHeight,remainingSpace);
                //console.log(tempSectionHight, this.viewerheight, remainingSpace, compareHeight)
                //console.log(element, diffSpace)
                if(tempSectionHight > this.viewerheight || remainingSpace < compareHeight) {
                  
                  
                }
                

                if (!this.noBreak && tempSectionHight > this.viewerheight || remainingSpace < compareHeight) {
                  //console.log(element);
                  this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                  this.breakLoop = true;
                }
              } 

              else {
                  if (!this.noBreak && Math.round(this.sec_temp.getBoundingClientRect().height) > this.viewerheight ){
                  //console.log(element);
                  this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                  this.breakLoop = true;
               }
              }
             
              

            } else if (Object.keys(data[key])[0].toLowerCase() == 'text') { 

              if (data[0]["attributes"][0].uniqid == this.pub_sub.startFromUniqID) {
               
                await this.setStartValue(element, data, key)
              } else { 
                await this.appendTextNode(element, data[key][Object.keys(data[key])[0]], this.pub_sub.paraStartFrom);
                //await this.timeout(50)
              }

               if(element.classList.contains("step-info")) {
                 if(!element.parentNode.children[0].classList.contains("step-title")){
                   console.log(element)
                   var newItem = document.createElement("DIV");
                              newItem.classList.add("step-title");
                              var textnode = document.createElement("P");
                              textnode.classList.add("class-empty");
                              element.parentNode.insertBefore(newItem, element.parentNode.firstChild);
                              newItem.parentNode.insertBefore(textnode, newItem.nextSibling);
                        }            
               }
           

               // let composedHeight = Math.round(this.viewerheight / 8);
               // let viewerReducedFeight = this.viewerheight - composedHeight;

               // if(Math.round(this.sec_temp.getBoundingClientRect().height) + elementoffsetHeight > viewerReducedFeight && this.viewerheight > 1000) {

               //   if(element.previousSibling && element.nodeName.toLowerCase() == 'p' && element.previousElementSibling.nodeName.toLowerCase() == 'p') {
               //       //if(element.parentNode.childNodes.length) {
               //         //console.log(element.parentNode.childNodes,element)
               //          // if(element.parentNode.childNodes.length < 3) { 
               //          //    this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
               //          //    this.breakLoop = true;
               //          // }
                       
               //       //}
                     
               //   }

               // }



              if (this.pub_sub.minorColumn.length >= 1 && !this.minor_column) {
                for (var i = 0; i < this.pub_sub.minorColumn.length; i++) {
                  if ((this.iframe_body.body.getElementsByClassName(this.pub_sub.minorColumn[i].id).length > 0) && this.pub_sub.minorColumn[i].status != true) {
                    await this.minorColumn(this.pub_sub.minorColumn, this.iframe_body, false)
                    this.minor_column = false;
                    this.noBreak = false;
                    this.breakLoop = false;
                  }
                }


              }


              if(!this.noBreak && Math.round(this.sec_temp.getBoundingClientRect().height) > this.viewerheight) {  
                           //console.log(element)
                           this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                           this.breakLoop = true;
              }


            } else {
              if (data[0]["attributes"][0].uniqid == this.pub_sub.startFromUniqID) {
                // startInsert = true;
                this.startIndex = true;
              }
              await this.timeout(25)
              await this.createElement(element, data[key], '');

             
            }
          }
          if (this.breakLoop && !this.condition_return) { 
           
            if (this.pub_sub.elemType == '' || this.pub_sub.elemType == null || this.pub_sub.elemType == undefined) { 
 
              this.pdfEditorElementStruture.checkElementBreakCondition(element);
              this.condition_return = false;
              this.isRecursive = true;
            }
            if (this.pub_sub.elemType.split('_')[1] != 'dontRemove' && !this.condition_return) {
              switch (this.pub_sub.elemType.toLowerCase()) {
                case 'ol':
                case 'ul':
                case 'li':
                case 'list':
                
                  if (!this.listCondition) {   
                    await this.pdfEditorElementStruture.list_service.checkListArray(this.pub_sub.DOMelement, this.sectionCount, this.pub_sub);
                    this.pub_sub.DOMelement = this.pub_sub.DOMelement.nodeName.toLowerCase() == 'ul' || this.pub_sub.DOMelement.nodeName.toLowerCase() == 'ol' ? this.pub_sub.DOMelement : '';
                    this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'list';
                    this.listCondition = true;
                  }

                  if (this.pub_sub.elemType == 'list' && (data[JSON.parse(key)].hasOwnProperty('li') || data[JSON.parse(key)].hasOwnProperty('ol') || data[JSON.parse(key)].hasOwnProperty('ul'))) {
                    //      console.log(this.pub_sub.elemType,this.pub_sub.LIstartValue[0])

                    if (this.pub_sub.LIstartValue[0].value == '1' && (element.nodeName.toLowerCase() == 'ol' || element.nodeName.toLowerCase() == 'ul') && Array.from(element.parentNode.childNodes).indexOf(element) > 0 && (element.previousElementSibling.nodeName.toLowerCase() == 'figcaption' || element.previousElementSibling.nodeName.toLowerCase() == 'header')) {
                      this.pub_sub.startFromUniqID = element.previousElementSibling.getAttribute('uniqid');
                      this.pub_sub.elemType = element.previousElementSibling.nodeName.toLowerCase();
                      this.pub_sub.DOMelement = element.previousElementSibling;
                      this.pub_sub.isSibling = true;
                      this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                      this.pdfEditorElementStruture.removeElement(this.pub_sub, element, data[JSON.parse(key)], this.sectionCount, '', '', false);

                    } else {
                      if (this.pub_sub.DOMelement == '') {
                        this.pdfEditorElementStruture.list_service.listStructure(this.pub_sub, element, true, this.sectionCount, data);
                      }
                     if (this.pub_sub.DOMelement && data[JSON.parse(key)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toLowerCase()) || this.pub_sub.DOMelement.nodeName.toLowerCase() == 'tr') {  
           
                        if(this.pub_sub.DOMelement.nodeName.toLowerCase() == 'tr') {  
                           this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);  
                           this.breakLoop = true;  
                        } else {  
                          this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, data[JSON.parse(key)], this.sectionCount, '', '', false);  
                          this.condition_return = true;  
                        }
                      }
                    }



                  }

                  break;
                case 'table':
                case 'tbody':
                case 'tr':
                  this.pub_sub.elemType = 'table';
                  if (this.pub_sub.elemType == 'table') {
                    if (this.pub_sub.tableObj.firstThreeRows == '' && ((data[JSON.parse(key)].hasOwnProperty('tr')) || (data[JSON.parse(key)].hasOwnProperty('table'))))
                      this.pub_sub.tableObj = this.pdfEditorElementStruture.table_service.getElementInTable(this.pub_sub, data, JSON.parse(key))
                      
                    if (this.pub_sub.tableObj.firstThreeRows) {
                      //console.log(this.pub_sub.DOMelement)

                      if (data[JSON.parse(key)].hasOwnProperty('table')) {

                        let temp_table = element.childNodes[Math.round((JSON.parse(key)) - 1)]; 
                        if (temp_table.nodeName.toLowerCase() == 'table' && Array.from(temp_table.parentNode.childNodes).indexOf(temp_table) > 0 && temp_table.previousElementSibling.nodeName.toLowerCase() == 'figcaption') {
                          this.pub_sub.startFromUniqID = temp_table.previousElementSibling.getAttribute('uniqid');
                          this.pub_sub.elemType = temp_table.previousElementSibling.nodeName.toLowerCase();
                          this.pub_sub.DOMelement = temp_table.previousElementSibling;
                          this.pub_sub.isSibling = true;
                          this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                          this.pdfEditorElementStruture.removeElement(this.pub_sub, temp_table, data[JSON.parse(key)], this.sectionCount, '', '', false);

                        } else {
                          this.pdfEditorElementStruture.table_service.formatTableStructure(this.pub_sub, element.childNodes[Math.round((JSON.parse(key)) - 1)], this.pub_sub.tableObj, '');
                          //console.log(this.pub_sub);
                          if (data[JSON.parse(key)].hasOwnProperty('table') && element.previousElementSibling && element.previousElementSibling.nodeName.toLowerCase() == "header" && element.parentNode && element.parentNode.nodeName.toLowerCase() == "aside" && Math.round(this.sec_temp.getBoundingClientRect().height) > 900) {
                            temp_table = element.parentNode;
                            //console.log(temp_table);

                            this.pub_sub.startFromUniqID = temp_table.getAttribute('uniqid');
                            this.pub_sub.elemType = temp_table.nodeName.toLowerCase();
                            this.pub_sub.DOMelement = temp_table;
                            this.pub_sub.isSibling = false;
                            this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                          }
                          // data[JSON.parse(key)] =this.getCurrentElement

                          this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, this.getasideElement, this.sectionCount, '', '', false);
                          this.condition_return = true;
                        }



                      }
                    } else if (this.pub_sub.tableObj.lastThreeRows) {
                      if (data[JSON.parse(key)].hasOwnProperty('tr') && this.pub_sub.tableObj.row_index == '')
                        this.pub_sub.tableObj.row_index = JSON.parse(key);


                      if (data[JSON.parse(key)].hasOwnProperty('tbody')) {
                        this.pub_sub = this.pdfEditorElementStruture.table_service.formatTableStructure(this.pub_sub, element.childNodes[Math.round((JSON.parse(key)) - 1)], this.pub_sub.tableObj, this.saveElement);
                        // this.pdfEditorElementStruture.removeElement(this.pub_sub,'',data[JSON.parse(key)],this.sectionCount,this.pub_sub.tableObj.objStartFrom,'');
                        this.condition_return = true;
                      }
                    } else if (this.pub_sub.tableObj.inBetween) {
                      if (data[JSON.parse(key)].hasOwnProperty('tr') && this.pub_sub.tableObj.row_index == '')
                        this.pub_sub.tableObj.row_index = JSON.parse(key);

                      if (data[JSON.parse(key)].hasOwnProperty('tbody')) {
                        let arr: any = [];
                        let temp_arr: any = [];
                        temp_arr = Array.from(element.childNodes);
                        arr = temp_arr.filter((x, count) => { return x.nodeName.toLowerCase() == 'tbody' });

                        if (this.pub_sub.startFromUniqID == '' && this.pub_sub.DOMelement == '')
                          this.pdfEditorElementStruture.table_service.formatTableStructure(this.pub_sub, element.childNodes[Math.round((JSON.parse(key)) - 1)], this.pub_sub.tableObj, arr[0].lastElementChild);


                        this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, data[JSON.parse(key)], this.sectionCount, this.pub_sub.tableObj.row_index, '');
                        this.pub_sub.tableObj.objStartFrom = this.pub_sub.tableObj.row_index
                        this.condition_return = true;
                      }
                    }
                  }

                  break;
                case 'p':
  
                case 'paragraph':
                  await this.pdfEditorElementStruture.paragraph_service.paragraphStructure(this.pub_sub, this.pub_sub.DOMelement, Math.round(this.sec_temp.getBoundingClientRect().height), data, this.sec_temp, this.sectionCount, '', '', false);
                  this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                  if (this.pub_sub.paraStartFrom != 0) {
                    this.pub_sub.elemType = '';
                    this.condition_return = true;
                  }

                  break;
                case 'figure':
                case 'figurecaption':
                  this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement, this.pub_sub.elemType)
                  this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                  break;
                case 'aside':
                case 'section':
                case 'header':
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                  this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement, this.pub_sub.elemType)
                  this.pdfEditorElementStruture.checkPreviousElements_service.checkPreviousSibilings(this.pub_sub, this.pub_sub.DOMelement, this.sectionCount, true);
                  this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                  break;
                case 'pagebreakInside':
                case 'default':
                  this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement, this.pub_sub.elemType)
                  this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                  break;
                default:
                  if (this.pub_sub.DOMelement.parentNode != null) {
                    this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement, this.pub_sub.elemType)
                    this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                  }
                  break;
              }
             // console.log(element);

              if (this.pub_sub.elemType.split('_')[1] == 'dontRemove') {
                this.pub_sub.DOMelement.classList.add('dont_remove')
                this.elementNotRemoveCondition(data, key)
              } else {           
                if (this.pub_sub.elemType == 'pagebreakInside' || this.pub_sub.elemType == 'default') { 
                  let key_1 = Object.keys(data[JSON.parse(key)])
                  if (!data[key][key_1[0]][0].hasOwnProperty('attributes'))
                    break;

                  if (this.pub_sub.isSibling) {
                    let value = this.pdfEditorElementStruture.checkElementExist(this.pub_sub, data, false, '', '', true)
                    if (value) {
                      this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, data[(value - 1)], this.sectionCount, '', '', false);
                      data[0]['attributes'][0].isbelongto = '';
                      this.pub_sub.elemType = '';
                      this.condition_return = true;
                      return
                    }
                  } else if (this.pub_sub.DOMelement && (data[key][key_1[0]][0]['attributes'][0].uniqid == this.pub_sub.startFromUniqID) && (data[JSON.parse(key)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toLowerCase())) && this.pub_sub.DOMelement.parentElement != null) {
                    // console.log( this.pub_sub.DOMelement);
                    this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, data[JSON.parse(key)], this.sectionCount, '', '', false);
                    this.pub_sub.DOMelement = '';
                    this.pub_sub.elemType = '';
                    this.condition_return = true;
                  }
                }
              }
            } else if (this.pub_sub.elemType.split('_')[1] == 'dontRemove' && !this.condition_return) {
              this.pub_sub.DOMelement.classList.add('dont_remove')
              this.elementNotRemoveCondition(data, key)
            }
            // if(!this.condition_return){
            //     // let isBreak = this.resettingJson(data,key,element)
            //     // if(isBreak)
            //         break
            // } 



            element.setAttribute('isbelongTo', "");
            
            break;
          }
          if (!this.breakLoop && !this.noBreak)
            this.isRecursive = false;

        }
        return new Promise((resolve, reject) => {
          resolve(element)
        })
      } catch (error) {
        console.log(error)
      }
    }
  }
  /**
   * function not to remove the element from current page.
   */
  elementNotRemoveCondition = function(data, key) {
    this.pub_sub.startFromUniqID = '';
    this.compress_object = true;
    if ((this.compress_object && (this.pub_sub.elemType.split('_')[1] == 'dontRemove' && (data[JSON.parse(key)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toLowerCase()))) || (data.length - 1) > key)) {
      this.pub_sub.startFromUniqID = '';
      let indx: any = Math.round(JSON.parse(key) + 1);
      for (var i = indx; i < data.length; i++) {
        if (this.pub_sub.startFromUniqID) {
          break
        }

        let key_1 = Object.keys(data[i]);
        if (key_1[0] != "#text" && key_1[0] != "SCRIPT") {
          this.pub_sub = this.pdfEditorElementStruture.SetStartValue(this.pub_sub, data[i][key_1[0]], true, '', '', this.uniqid, false);
          if (this.pub_sub.startFromUniqID)
            break;
        } else if (key_1[0] == "#text") {
          if (data[Math.round(JSON.parse(key) + 1)][key_1[0]].trim() != "") {

            this.uniqid++;
            data[i][key_1[0]][0].isbelongto = '';
            data[i][key_1[0]][0].uniqid = 'element_' + this.uniqid;
            this.pub_sub.startFromUniqID = 'element_' + this.uniqid;
            this.condition_return = true;
          }
        }
      }
      this.compress_object = this.pub_sub.startFromUniqID ? false : true;
      this.condition_return = this.pub_sub.startFromUniqID ? true : false;
      // return this.pub_sub.startFromUniqID?true:false;
    }
  }


  /** function to append textnode */
  appendTextNode = async function(element, text, startFromIndex) { 
    let text_test: any = '';
    let val = !this.noBreak ? startFromIndex ? startFromIndex : 0 : 0;

    for (let i = val; i < text.length; i++) {
      text_test += text[i]
    }

    let textNode = this.renderer.createText(text_test);
    element.appendChild(textNode)
    if (startFromIndex != 0) {
      element.setAttribute('para', 'first_para')

    } // element.classList.add('first_para')

    //if(!this.isSave){
    element.setAttribute('text', text)
    //}
    return new Promise((resolve, reject) => {
      resolve(element)
    })
  }
  /** function to create element attributes and append text */
  createElementAttribute = async function(element, json, innerHtml) {
    try {
      let _this = this;
      //[0]['attributes'][0]
      for (let key in json) {
        if (key == 'computedStyles')
          continue

        if (json[key] != '' && json[key] != undefined)
          json[key] = json[key].replace('margin-left: 1.77in !important', '').replace('margin-left: auto !important', '').replace('margin-right: 1.77in !important', '').replace('margin-right: auto !important', '').replace("border: 1px solid black");

        element.setAttribute(key, json[key])

        if (json[key] == 'stylesheet')
          element.setAttribute('type', 'text/css')

        if (innerHtml)
          element.innerHTML = innerHtml.text;
      }
      if (this.iframeBody) {
        if (this.iframeBody.classList.contains('pagebreak_spi_even')) {
          if ((element.nodeName.toLowerCase() != 'img' || element.nodeName.toLowerCase() != 'span') && element.style.hasOwnProperty('float')) {
            if (document.defaultView.getComputedStyle(element, null).getPropertyValue('float') == 'right') {
              element.style.float = 'left';
              element.style.marginRight = '1em';
            }
          }
        }
      }


      return new Promise((resolve, reject) => {
        resolve(element)
      })
    } catch (error) {
      console.log(error)
    }
  }
  /** DOM listener for element edit */
  public mouseEntereEvent = function(event) {
    //console.log('mouseEntereEvent')
    event.stopImmediatePropagation();
  }
  public mouseLeaveEvent = function(event) {
    //console.log('mouseLeaveEvent')
    event.stopImmediatePropagation();
    event.target.removeEventListener('mousedown', this.mouseDownEvent)
  }
  public mouseDownEvent = function() {
    //onsole.log('mouseDownEvent')
  }
  /**DOM listener for element removal */
  public OnNodeRemovedFromDocument = function(event) {
    var option = event.target;
    // console.log ("The option with label is removed" ,event.target);
  }

  onKeyDownEvent = (event) => {
    //console.log('as')
  }

  test_subject: any = new Subject();
  list_subject: any = new Subject();
  checkcellwidth: any = new Subject();
  checkimagestyle: any = new Subject();
  checklineheight: any = new Subject();
  matheditorinput: any = new Subject();

  mouseClickEvent = (event, listType) => {
    let editorSlide, tableWidth, cellWidth, cell, matheditor;
    event.stopImmediatePropagation();

    const mathJaxClass = ['mjx-char', 'MathJax_Preview', 'mjx-chtml', 'mjx-mrow', 'mrow', 'mstyle', 'math', 'equation', 'MathJax', 'mfrac', 'mn', 'svg'];
    // const tabelTag = ['tr', 'td', ` 'tbody', 'thead', 'th', 'table'];
    const mathM = event.target.tagName.split('')[0];
    // const eventTagName = event.target.tagName.toLowerCase();
    // const listParent =   event.target ? event.target.parentNode.tagName.toLowerCase() : '';
    const olElement = event.target.closest('OL');
    const olElementTagName = olElement ? olElement.tagName.toLowerCase() : '';
    const ulElement = event.target.closest('UL');
    const ulElementTagName = ulElement ? ulElement.tagName.toLowerCase() : '';
    const tableElement = event.target.closest('TABLE');
    const tableElementTagName = tableElement ? tableElement.tagName.toLowerCase() : '';
    const imageElement = event.target.closest('IMG');
       
    document.getElementById("editor_newframe").style.display = 'none';
    document.getElementById("editor_newframe_table").style.display = 'none';
    document.getElementById("editor_newframe_image").style.display = 'none';
    if (olElement || ulElement) {
      this.list_subject.next(false);

    } else {
      this.list_subject.next(true);
    }
   //let computedLineHeight = ([event.target][0].style.lineHeight) ? [event.target][0].style.lineHeight : '1.2';
    let lineHeightCur = window.getComputedStyle(event.target, null).getPropertyValue("line-height"); 
    let fontSizeCur = window.getComputedStyle(event.target, null).getPropertyValue("font-size");
    let computedLineHeight = (lineHeightCur) ?  lineHeightCur : '19.2px';
    this.checklineheight.next({ 'checklineheight': computedLineHeight, 'element': event.target, 'fontsize': fontSizeCur});
    // if (eventTagName !== 'li' && listParent !== 'li' && ulElement === 'ul' && event.target.tagName !== 'IMG' && mathJaxClass.indexOf(event.target.classList[0]) === -1 && mathM.toUpperCase() !== 'M' && tabelTag.indexOf(event.target.tagName.toLowerCase()) === -1 ) {
    // if ( event.target.tagName !=='BODY' && olElementTagName !== 'ol' && ulElementTagName !=='ul' && tableElementTagName !== 'table' && event.target.tagName !== 'IMG' && mathJaxClass.indexOf(event.target.classList[0]) === -1 && mathM.toUpperCase() !== 'M') {
    if (event.target.tagName !== 'BODY' && tableElementTagName !== 'table' && mathJaxClass.indexOf(event.target.classList[0]) === -1 && mathM.toUpperCase() !== 'M') {
      editorSlide = document.getElementById("editor_newframe");
    }
    if (tableElementTagName == 'table') {
      editorSlide = document.getElementById("editor_newframe_table");
      tableWidth = tableElement.offsetWidth;
    }

    if (event.target.tagName === 'IMG') {
      editorSlide = document.getElementById("editor_newframe_image");
    }

    
    if (editorSlide && event.target.tagName != 'svg' && event.target.parentNode.tagName != "MJX-CONTAINER") {
      editorSlide.style.position = 'absolute';
      editorSlide.style.display = 'block';
    }

    this.eventArray.push(event);
      this.eventArray.length > 1 && this.eventArray.map((elem) => {
        if (elem && elem.target.style) {
          elem.target.style.border = "";
          elem.target.style.boxShadow = "";
          elem.target.style.padding = "";
          elem.target.style.borderRadius = "";
          elem.target.style.borderRadius = "";
         
        }
        if (elem.target && elem.target.parentNode && elem.target.parentNode.style) {
          elem.target.parentNode.style.border = "";
          elem.target.parentNode.style.boxShadow = "";
          elem.target.parentNode.style.padding = "";
          elem.target.parentNode.style.borderRadius = "";
          elem.target.parentNode.style.borderRadius = "";
         
        }
        if (elem.target && elem.target.parentNode && elem.target.parentNode.parentNode && elem.target.parentNode.parentNode.style) {
          elem.target.parentNode.parentNode.style.border = "";
          elem.target.parentNode.parentNode.style.boxShadow = "";
          elem.target.parentNode.parentNode.style.padding = "";
          elem.target.parentNode.parentNode.style.borderRadius = "";
          elem.target.parentNode.parentNode.style.borderRadius = "";
         
        }
      })
      if(this.newLineElement.length > 1 ) {
        for (var newElem of this.newLineElement) { 
          newElem.style.border = "";
          newElem.style.boxShadow = "";
          newElem.style.padding = "";
          newElem.style.borderRadius = "";
        } 
      }
    let child_elem = ['SPAN', 'STRONG', 'BOLD', 'FONT', 'TR', 'TD', 'TH', 'I', 'B', 'U', 'SUP', 'SUB', 'OL', 'UL', 'LI']
    if (mathJaxClass.indexOf(event.target.classList[0]) === -1) {
      if (child_elem.indexOf(event.target.tagName.toUpperCase()) > -1) {
        if (event.target.tagName.toUpperCase() === "SPAN" && event.target.parentNode.tagName.toUpperCase() === 'SPAN') {
          this.test_subject.next(event.target.parentNode.parentNode);
        } else if (event.target.tagName.toUpperCase() === "TD" || event.target.tagName.toUpperCase() === "TH") {
          if(event.target.style.cssText.indexOf('width') > -1 && event.target.style.width.indexOf('%') > -1) {
            cellWidth = event.target.style.width;
          } else {
            cellWidth = event.target.offsetWidth;
          }
          cell = event.target;
        } else if (event.target.closest('TD') || event.target.closest('TH')) {
          //cellWidth = (event.target.closest('TD')) ? event.target.closest('TD').offsetWidth : event.target.closest('TH').offsetWidth;
          let cellele = (event.target.closest('TD')) ? event.target.closest('TD') : event.target.closest('TH');
          if(cellele.style.cssText.indexOf('width') > -1 && cellele.style.width.indexOf('%') > -1) {
            cellWidth = cellele.style.width;
          } else {
            cellWidth = cellele.offsetWidth;
          }
          cell = cellele;
        } else {
          this.test_subject.next(event.target.parentNode);
        }
      } else {
        this.test_subject.next(event.target);
      }
       if( event.target.tagName == 'IMG') {
        event.target.style.border = "2px solid #1fcf14";
        event.target.style.boxShadow = "0px 4px 5px lightgrey";
        event.target.style.borderRadius = "6px";
       } else {
         if(!event.target.getAttribute("style")) { 
             event.target.style.cssText =  'font-size:'+ fontSizeCur + ' !important'; 
             //event.target.style['line-height'] =  lineHeightCur;
             event.target.style.border = "2px solid #1fcf14";
             event.target.style.boxShadow = "0px 4px 5px lightgrey";
             event.target.style.padding = "2px 5px";
             event.target.style.borderRadius = "6px";
         } else {
             event.target.style.setProperty('border','2px solid #1fcf14');
             event.target.style.setProperty('border-radius','6px');
             event.target.style.setProperty('box-shadow','0px 4px 5px lightgrey');
             event.target.style.setProperty('padding','2px 5px');
             //event.target.style.setProperty('line-height',lineHeightCur);
         }
        
       }

       if(editorSlide) { 
             editorSlide.style.top = event.target.getBoundingClientRect().top - 50 + 'px';
      if( event.target.getBoundingClientRect().left + 50 > 165) {
        editorSlide.style.left = '23%';
      } else {
         editorSlide.style.left = event.target.getBoundingClientRect().left + 50 + 'px';
      }
    }
      
      

      if(event.target.tagName === 'IMG'){
        let current_imagewidth = window.getComputedStyle(event.target, null).getPropertyValue("width");
        let current_imagepadding = window.getComputedStyle(event.target, null).getPropertyValue("padding");        
        let curr_imagepadding = (current_imagepadding).split(' ')[0];
        let current_image_margin = window.getComputedStyle(event.target, null).getPropertyValue("margin");
        let curr_image_margin = (current_image_margin).split(' ')[0];
        event.target.style.border = "2px solid #1fcf14";
        event.target.style.boxShadow = "0px 4px 5px lightgrey";
        editorSlide.style.top = event.target.getBoundingClientRect().top - 14 + 'px';
        editorSlide.style.left = '10%';
        this.checkimagestyle.next({ 'imagesize': current_imagewidth, 'imagepadding': curr_imagepadding,
         'image_margin': curr_image_margin, 'element': event.target});
     }
    }

         

    if (parseInt(document.getElementById("editor_newframe").getBoundingClientRect().height) > 70) {
      document.getElementById("editor_newframe").style.left = '23%';
      document.getElementById("editor_newframe").style.transform = 'translateX(-11%)';
    }
    if (parseInt(document.getElementById("editor_newframe_table").getBoundingClientRect().height) > 60) {
      document.getElementById("editor_newframe_table").style.left = '50%';
    }

     if (parseInt(document.getElementById("editor_newframe_image").getBoundingClientRect().height) > 60) {
      document.getElementById("editor_newframe_image").style.left = '66%';
    }

    if (event.target.childNodes.length > 0 && event.target.childNodes[0].tagName == 'svg' && event.target.tagName == "MJX-CONTAINER") {
      matheditor = document.getElementById("matheditor_container");
      matheditor.style.position = 'absolute';
      matheditor.style.display = 'block';
      let matheditor_input = document.getElementById("matheditor_input");
      let inputStr = event.target.childNodes[1].innerHTML;
      inputStr = inputStr.substring(inputStr.indexOf("<math"));
      inputStr = inputStr.substring(0, inputStr.indexOf("</math>") + 7);
      this.eventArray = [];
       this.matheditorinput.next({ 'matheditorinput': inputStr, 'targetnode': event.target,
      'padding': window.getComputedStyle(event.target, null).getPropertyValue("margin")
       });
    }
    if (tableWidth) {
      let cellWidthPercentage;
      cellWidth = cellWidth.toString();
      if(cellWidth.indexOf('%') > -1){
        cellWidthPercentage = cellWidth.split('%')[0];
      }else {
        cellWidthPercentage = (cellWidth / tableWidth) * 100;
      }
      this.checkcellwidth.next({ 'cellwidth': cellWidthPercentage, 'cell': cell });
    }
 
     let Eframe = document.getElementById("editableFrame")
     let frameWindow = (<HTMLIFrameElement> Eframe).contentWindow;
     this.parentSection = frameWindow.document.getElementsByTagName("br");
    
      if(this.parentSection.length > 0) {
        for(var i = 0; i < this.parentSection.length; i++){
          this.elementArray.push(this.parentSection[i]);
        }
      }
    
    this.elementArray.forEach(function(x){
      if(x.parentNode != null) {
        if(x.parentNode.textContent == null || x.parentNode.textContent == "") {
          x.parentNode.remove();
      }
      }
      
      
    });

    if(event.target.nodeName.toLowerCase() == 'section' && event.target.hasAttribute("page_section")){

        event.target.style.border = "";
        event.target.style.boxShadow = "";
        event.target.style.padding = "";
        event.target.style.borderRadius = "";
        
           var newNode = document.createElement("p");
           newNode.setAttribute('new_node',true);
           var brNode = document.createElement("br");
           newNode.appendChild(brNode);
           newNode.style['line-height'] =  lineHeightCur +" !important";
           newNode.style.border = "2px solid #1fcf14";
           newNode.style.boxShadow = "0px 4px 5px lightgrey";
           newNode.style.padding = "2px 5px";
           newNode.style.borderRadius = "6px";
           var gc = event.target.querySelectorAll("*");
           var lastNode = gc[gc.length-1];
     
           var testNode = lastNode;
          
            var parents = [];
            while(testNode.parentNode && lastNode.parentNode.nodeName.toLowerCase() != 'body') {
                  testNode = testNode.parentNode;
                if(testNode.nodeName.toLowerCase() == 'section' && getComputedStyle(testNode,null).getPropertyValue('border') != "0px none rgb(0, 0, 0)"){
                    parents.push(testNode);
                  }
    
             }

              
              var isBox = false;
              if(parents.length > 0){
                  isBox = true;
              }

              let prev_elem = ['SPAN', 'STRONG', 'BOLD', 'FONT', 'TR', 'TD', 'TH', 'I', 'B', 'U', 'SUP', 'SUB', 'OL', 'UL', 'LI','EM'];
               if (prev_elem.indexOf(lastNode.tagName) === -1 && prev_elem.indexOf(lastNode.parentNode.tagName) === -1 && !isBox) {
                          console.log("usual text")
                          lastNode.parentNode.insertBefore(newNode, lastNode.nextSibling);
                      } else {

                          if (lastNode.tagName.toLowerCase() == 'span' && !isBox) {
                              console.log("span text")
                              while (lastNode.parentNode && lastNode.parentNode.nodeName.toLowerCase() != 'body') {
                                  lastNode = lastNode.parentNode;
                                  if (lastNode.nodeName.toLowerCase() == 'section') {
                                      lastNode.appendChild(newNode);
                                      break;
                                  }

                              }

                          } else if (lastNode.tagName.toLowerCase() == 'em' && !isBox) {
                              console.log("em text");
                              while (lastNode.parentNode && lastNode.parentNode.nodeName.toLowerCase() != 'body') {
                                  lastNode = lastNode.parentNode;
                                  if (lastNode.nodeName.toLowerCase() == 'p') {
                                      lastNode.appendChild(newNode);
                                      break;
                                  }
                              }
                          } else if (lastNode.parentNode.tagName.toLowerCase() == 'li' && !isBox) {
                              console.log("li text");
                              while (lastNode.parentNode && lastNode.parentNode.nodeName.toLowerCase() != 'body') {
                                  lastNode = lastNode.parentNode;
                                  if (lastNode.nodeName.toLowerCase() == 'ul') {
                                      lastNode.parentNode.insertBefore(newNode, lastNode.nextSibling);
                                      break;
                                  }
                              }

                          } else if (isBox) {
                              console.log("box text")
                              parents[0].parentNode.insertBefore(newNode, parents[0].nextSibling);
                          } else {
                              console.log("cannot created");
                          }

                      }        

                     if(newNode.previousElementSibling) 
                       {
                         if(!newNode.previousElementSibling.textContent){
                           newNode.previousElementSibling.remove();
                         }
                         
                     }
          
           var rng = frameWindow.document.createRange();
                rng.setStart(newNode, 0);
                rng.setEnd(newNode, 0);
                var sel = frameWindow.window.getSelection();
                sel.removeAllRanges();
                sel.addRange(rng);
                this.newLineElement.push(newNode);

  

    }


  }

  /*selectionchange = (event) => {
    console.log(document.getSelection());
  }*/
  findComments = function(el) {
    var arr = [];
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      if (node.nodeType == 8 || node.nodeName.toLowerCase == '#comment') {
        node.remove();
      } else {
        arr.push.apply(arr, this.findComments(node));
      }
    }
    return arr;
  }
  onkeyPressEvent = (event) => {
      let x = document.getElementById("editableFrame")
      let u = (<HTMLIFrameElement> x).contentWindow;
      let ret;
 if (u.window.getSelection) {
        var range = u.window.getSelection().getRangeAt(0);
        ret = range.commonAncestorContainer.parentNode || u.document;
        if (event.keyCode == 13) { 
            this.newLineElement = ret.parentNode.children;
        }
        if(ret.tagName.toLowerCase()=="p" && ret.parentNode.tagName.toLowerCase()=="li"){
           
            //    console.log("yes last child ",ret.parentNode);
            
            // console.log(ret.previousSibling.childNode.getAttribute("uniqid"),ret.parentNode.previousSibling.childNode)
                if(ret.previousSibling!=null){
                    if(ret.previousSibling.childNode!=undefined)
                       { if(ret.previousSibling.childNode.getAttribute("uniqid")==ret.getAttribute("uniqid"))
                        ret.setAttribute("uniqid","");
                    }
                    else if(ret.previousSibling.tagName.toLowerCase()=="p")
                        {if(ret.previousSibling.getAttribute("uniqid")==ret.getAttribute("uniqid") && ret.previousSibling.parentNode.getAttribute("uniqid")==ret.parentNode.getAttribute("uniqid") )
                            {
                            ret.setAttribute("uniqid","");
                            ret.parentNode.setAttribute("uniqid","");
                            }

                        }
                }
           else if(ret.parentNode.previousSibling!=null){
               if(ret.parentNode.previousSibling.childNodes[0].getAttribute("uniqid")==ret.getAttribute("uniqid"))
                   ret.setAttribute("uniqid","");
                }

                 if(ret.nextSibling!=null){
                    if(ret.nextSibling.childNode.getAttribute("uniqid")==ret.getAttribute("uniqid"))
                        ret.setAttribute("uniqid","");
                }
           else  if(ret.parentNode.nextSibling!=null){
                if(ret.parentNode.nextSibling.childNodes[0].getAttribute("uniqid")==ret.getAttribute("uniqid"))
                   ret.setAttribute("uniqid","");
                }
 
        }
        //console.log(event);
        if(event.type == 'paste') {
            if(event.path[0].tagName !== 'BR') { //paste in same paragraph
                var attrObj = event.path[0].attributes;
                for (const variable in attrObj) {
                    if(attrObj[variable].name == 'uniqid') {
                         console.log(attrObj[variable].value);
                    }
                }
            }
            if(event.path[0].tagName == 'BR') { //enter paste in new paragraph
                ret.setAttribute("uniqid","");
                console.log('enter paste in new paragraph');
            }

            let iframe = document.getElementById("editableFrame");
            let contentdocument = (<HTMLIFrameElement> iframe).contentDocument;
            var all =  contentdocument.getElementsByTagName('body');
            var fragmentLength = 2;
            for(var i = 1; i<=fragmentLength; i++){
                this.findComments(all[0]);
            }
        }
         if(ret.previousSibling) { 
            if(ret.previousSibling.getAttribute){
                  if(ret.previousSibling.getAttribute("uniqid")==ret.getAttribute("uniqid")) {
                    ret.setAttribute("uniqid","");
                  }
              }
         } 
         /*//paste event
         if(ret.previousSibling && ret.getAttribute("uniqid")) {
            console.log('paste')
         }
         //type event
         if(ret.previousSibling && ret.previousSibling.getAttribute) {
            console.log('type')
         }*/

         if(ret.nextSibling!=null  ){
            if(ret.nextSibling.getAttribute){
              if(ret.nextSibling.getAttribute("uniqid")==ret.getAttribute("uniqid"))
                  ret.setAttribute("uniqid","");
           }
         }  else if(ret.nextSibling == null){
            return;
         }

}}
 
    pasteElement =(event)=>{
        //console.log(event);
         var clipboarddata =  event.clipboardData.getData('text/html');    
       //console.log(clipboarddata);

         event.preventDefault();
            let x=document.getElementById("editableFrame")
                          let u = (<HTMLIFrameElement> x).contentWindow;
                    var text;
                    var clp = (event.originalEvent || event).clipboardData;
                    if (clp === undefined || clp === null) {
                        text = event.originalEvent["clipboardData"].getData('text');
                        if (text !== "") {
                            text = text.replace(/<[^>]*>/g, "");
                            if (window.getSelection) {
                                var newNode = document.createElement("span");
                                newNode.innerHTML = text;
                                u.window.getSelection().getRangeAt(0).insertNode(newNode);
                            }
                        }
                    } else {
                       
                        text = clp.getData('text/html');
                        text=text.replace("^\"+|\"+$", "")
                        if (text !== "") {
                       //     console.log(typeof(text));

                            text = text.replace(/<[^/].*?>/g, i => i.split(/[ >]/g)[0] + '>').trim();
                            u.document.execCommand('insertHTML', false, text);
                        
                            this.onkeyPressEvent(event);
                        }
                    }
    }
load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      if (!this.scripts[name].loaded) {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  //IE
            script.onreadystatechange = () => {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    this.scripts[name].loaded = true;
                    resolve({script: name, loaded: true, status: 'Loaded'});
                }
            };
        } else {  //Others
            script.onload = () => {
                this.scripts[name].loaded = true;
                resolve({script: name, loaded: true, status: 'Loaded'});
            };
        }
        script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
       let editableFrame  = document.getElementById("editableFrame");
       let contentdocument = (<HTMLIFrameElement> editableFrame).contentDocument;
       contentdocument.getElementsByTagName('head')[0].append(script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }
}
