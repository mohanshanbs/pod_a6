import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { _ } from 'underscore';
import { EditorElementStruture } from './editorElementStructure.service';
import { htmlEncode } from 'js-htmlencode';


@Injectable()
export class editorDomService {
    public editorBar: Subject<any> = new Subject<any>();

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
    public subject = new Subject<any>()
    page_model: any = '';
    sec_temp: any = '';
    condition_return: boolean = false;
    secheight: number = 0;
    startIndex: boolean = false;
    listCondition: boolean = false;
    public isRecursive: any = false;
    isDestroy:boolean=false;
     clipboardData: any;
     getCurrentElement:any;


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
            // console.log('published',Obj)
        })
    }
ngOnDestroy(){
    console.log("destroyed==");
   this.isDestroy=true;
}
    /** function to create iframe head wise elements */
    appendIframeHeadContent = async function (json, contentDoc) {
        this.pub_sub.minorColumn = [];
        try {
            contentDoc.head.innerHTML = '';
            if (json != "") {
                let data = json;
                let _this = this;
                for (let key in data) {
                    let elem_type = Object.keys(data[key])[0];
                    let elem = _this.renderer.createElement(elem_type);
                    let resdata = await this.createElementAttribute(elem, data[key][Object.keys(data[key])[0]][0]['attributes'][0]);
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
    appendIframePageWiseContent = async function (page_model, contentDoc, pageNo) {
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
        this.page_model = page_model;
        this.listCondition = false;
        this.minor_column = false;
        try {
            let _this = this;
            this.sec_temp = this.renderer.createElement('section')
            this.sec_temp.setAttribute('id', 'section_' + this.sectionCount)
            this.sec_temp.setAttribute('class', 'rm_mrgn_0 editor-frame dynamicSection');
           // this.renderer.setStyle(this.sec_temp, 'display', 'inline-block')
            this.iframeBody.appendChild(this.sec_temp)
            for (let keyx in page_model.json) {
                if (this.pub_sub.startFromUniqID == '' && this.compress_object) {
                    this.elementNotRemoveCondition(page_model.json, keyx)
                    break;
                }

                let elem_test = await this.createElement('', page_model.json[keyx], this.sec_temp);
                this.getCurrentElement = keyx;
                console.log(this.getCurrentElement);

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
    minorColumn = async function (array, contentDoc, checkMajorIdExist) {
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
    timeout = function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * image DOM rendering completion event trigger
     */
    imageRender = async function (event) {

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
    setStartValue = async function (element, data, key) {
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
    createElement = async function (parent, json, contentDocBody) {
        if(!this.isDestroy){
        // console.log(json);
        let elem_type: any = '';
        let element: any = '';
        let data: any = ''
        let c = 0;
        elem_type = Object.keys(json)[0];
        console.log(Object.keys(json));
        console.log(json);
        if (json[elem_type][0]['attributes'][0].hasOwnProperty('isbelongTo') && !this.startIndex && !this.noBreak) {
            if (json[elem_type][0]['attributes'][0].isbelongTo != '')
                return parent ? parent : contentDocBody;
        }
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

                    this.pub_sub.minorColumn.push(
                        {
                            'id': json[elem_type][0]['attributes'][0]['minor_id'],
                            'data': json,
                            'parentId': (parent != '' || parent != undefined) ? (parent.classList.contains('mhhe-pod--glos-par')) ? parent.parentNode.getAttribute('uniqid') : parent.getAttribute('uniqid') : 'body',
                            'afterElemId': parent.childNodes.length > 0 ? parent.lastElementChild.getAttribute('uniqid') : '',
                            'status': false
                        }
                    )
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
        element.addEventListener('keypress',this.onkeyPressEvent);
        // element.addEventListener('copy',this.copiedElement);
                element.addEventListener('paste',this.pasteElement);
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
                        // }
                          if(element.nodeName.toLowerCase()=="img"){
                      
                              var newheight=this.sec_temp.getBoundingClientRect().height+ element.offsetHeight;

                             if(Math.round(newheight)>910 && element.parentNode.classList.contains("mhhe-pod--image-75to50-wrap"))
                              {      // console.log("yeslarge",element);
                                this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                                this.breakLoop = true;

                                }

                             
                        }

                        // if (!this.noBreak && Math.round(this.sec_temp.getBoundingClientRect().height) > 910 && element.closest('aside')) {
                        //     this.getCurrentElement= element.closest('aside');
                        //     element.closest('aside').remove();

                        //     this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                        //     this.breakLoop = true;
                        // }else{
                        //     this.getCurrentElement="";
                        // }


                        if(element.nodeName.toLowerCase()=="aside" )
                            debugger;

                        if(element.parentNode.nodeName.toLowerCase()=="header"&& element.parentNode.parentNode.firstElementChild.nodeName.toLowerCase()=="header" &&(element.nodeName.toLowerCase()=="h4" || element.nodeName.toLowerCase()=="h5"))
                            debugger;
                    //     if(element.getAttribute("id")=="data-uuid-d50b75a9465140f7868d9511e1d35736")
                    //         debugger;
                    //      if(element.previousElementSibling != null)
                    //     {if(element.nodeName.toLowerCase()=="img" && element.previousElementSibling.nodeName.toLowerCase()=="figcaption"){
                    //         console.log(element)
                    //         debugger;

                    //           var newheight=this.sec_temp.getBoundingClientRect().height+ element.offsetHeight;
                    //         if(Math.round(newheight)>910)
                    //           {      // console.log("yeslarge",element);
                    //               console.log(element, data[key][Object.keys(data[key])[0]][0],data[JSON.parse(key)])
                    //             // this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                    //             // this.breakLoop = true;

                    //             }


                    //     }
                    // }

                        // if(element.nodeName.toLowerCase()=="header"){
                        //     console.log(element);
                        //     debugger;
                        // }

                        //   if(element.previousElementSibiling!=null || element.previousElementSibiling!=undefined){
                        //     console.log(element);
                        //     if(element.previousElementSibiling.nodeName.toLowerCase()=="header")
                                
                        //     debugger;
                        // }




                        if (!this.noBreak && Math.round(this.sec_temp.getBoundingClientRect().height) > 910) {
                            this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                            this.breakLoop = true;
                        }

                    } else if (Object.keys(data[key])[0].toLowerCase() == 'text') {
                        if (data[0]["attributes"][0].uniqid == this.pub_sub.startFromUniqID) {
                            // if(Object.keys(data[key])[0].toLowerCase() == 'text')
                            //     await this.appendTextNode(element,data[key][Object.keys(data[key])[0]], this.pub_sub.paraStartFrom);
                            // else
                            await this.setStartValue(element, data, key)
                        } else {
                            await this.appendTextNode(element, data[key][Object.keys(data[key])[0]], this.pub_sub.paraStartFrom);
                            //await this.timeout(50)
                        }


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


                        if (!this.noBreak && Math.round(this.sec_temp.getBoundingClientRect().height) > 910) {
                            this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                            this.breakLoop = true;
                        }


                    } else {
                        if (data[0]["attributes"][0].uniqid == this.pub_sub.startFromUniqID) {
                            // startInsert = true;
                            this.startIndex = true;
                        }
                        await this.timeout(25)
                        await this.createElement(element, data[key], '')
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
                                        if (this.pub_sub.DOMelement && data[JSON.parse(key)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toLowerCase())) {
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, data[JSON.parse(key)], this.sectionCount, '', '', false);
                                            this.condition_return = true;
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

                                                this.pdfEditorElementStruture.removeElement(this.pub_sub, this.pub_sub.DOMelement, data[JSON.parse(key)], this.sectionCount, '', '');
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
                                await this.pdfEditorElementStruture.paragraph_service.paragraphStructure(this.pub_sub, this.pub_sub.DOMelement, Math.round(this.sec_temp.getBoundingClientRect().height), data, this.sec_temp, this.sectionCount, '', '', false);                                this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                                if (this.pub_sub.paraStartFrom != 0) {
                                    this.pub_sub.elemType = '';
                                    this.condition_return = true;
                                }

                                break;
                            case 'figure':
                            case 'figurecaption':
                                this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement,this.pub_sub.elemType)
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
                                this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement,this.pub_sub.elemType)
                                this.pdfEditorElementStruture.checkPreviousElements_service.checkPreviousSibilings(this.pub_sub, this.pub_sub.DOMelement, this.sectionCount, true);
                                this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                                break;
                            case 'pagebreakInside':
                            case 'default':
                                this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement,this.pub_sub.elemType)
                                this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                                break;
                            default:
                                this.pub_sub.elemType = this.pdfEditorElementStruture.checkElementNotRemove(this.pub_sub.DOMelement,this.pub_sub.elemType)
                                this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove' ? this.pub_sub.elemType : 'pagebreakInside';
                                break;
                        }


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
                                } else if (this.pub_sub.DOMelement && (data[key][key_1[0]][0]['attributes'][0].uniqid == this.pub_sub.startFromUniqID) && (data[JSON.parse(key)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toLowerCase()))) {
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
    elementNotRemoveCondition = function (data, key) {
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
    appendTextNode = async function (element, text, startFromIndex) {
        let text_test: any = '';
        let val = !this.noBreak ? startFromIndex ? startFromIndex : 0 : 0;

        for (let i = val; i < text.length; i++) {
            text_test += text[i]
        }

        let textNode = this.renderer.createText(text_test);
        element.appendChild(textNode)
        if (startFromIndex != 0 )
         {   element.setAttribute('para', 'first_para')
     
 } // element.classList.add('first_para')

        //if(!this.isSave){
        element.setAttribute('text', text)
        //}
        return new Promise((resolve, reject) => {
            resolve(element)
        })
    }
    /** function to create element attributes and append text */
    createElementAttribute = async function (element, json) {
        try {
            let _this = this;
            for (let key in json) {
                if (key == 'computedStyles')
                    continue

                if (json[key] != '' && json[key]!=undefined)
                   json[key]=json[key].replace('margin-left: 1.77in !important','').replace('margin-left: auto !important','').replace('margin-right: 1.77in !important','').replace('margin-right: auto !important','').replace("border: 1px solid black");
                
                    element.setAttribute(key, json[key])

                if (json[key] == 'stylesheet')
                    element.setAttribute('type', 'text/css')


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
    public mouseEntereEvent = function (event) {
        //console.log('mouseEntereEvent')
        event.stopImmediatePropagation();
    }
    public mouseLeaveEvent = function (event) {
        //console.log('mouseLeaveEvent')
        event.stopImmediatePropagation();
        event.target.removeEventListener('mousedown', this.mouseDownEvent)
    }
    public mouseDownEvent = function () {
        //console.log('mouseDownEvent')
    }
    /**DOM listener for element removal */
    public OnNodeRemovedFromDocument = function (event) {
        var option = event.target;
        // console.log ("The option with label is removed" ,event.target);
    }

    onKeyDownEvent = (event)=>{
        //console.log('as')
    }

    test_subject:any = new Subject();
    list_subject: any = new Subject();

    mouseClickEvent = (event, listType) => {

        event.stopImmediatePropagation();

        const mathJaxClass = ['mjx-char', 'MathJax_Preview', 'mjx-chtml', 'mjx-mrow'];
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
        if(olElement || ulElement) {
            this.list_subject.next(false);
            
        } else {
            this.list_subject.next(true);
        }
        // if (eventTagName !== 'li' && listParent !== 'li' && ulElement === 'ul' && event.target.tagName !== 'IMG' && mathJaxClass.indexOf(event.target.classList[0]) === -1 && mathM.toUpperCase() !== 'M' && tabelTag.indexOf(event.target.tagName.toLowerCase()) === -1 ) {
        // if ( event.target.tagName !=='BODY' && olElementTagName !== 'ol' && ulElementTagName !=='ul' && tableElementTagName !== 'table' && event.target.tagName !== 'IMG' && mathJaxClass.indexOf(event.target.classList[0]) === -1 && mathM.toUpperCase() !== 'M') {
        if (event.target.tagName !== 'BODY' && tableElementTagName !== 'table'  && mathJaxClass.indexOf(event.target.classList[0]) === -1 && mathM.toUpperCase() !== 'M') {
            let editorSlide = document.getElementById("editor_newframe");

            if (editorSlide) {
                editorSlide.style.position = 'absolute';
                editorSlide.style.display = 'block';

            }
            this.eventArray.push(event);
            this.eventArray.length > 1 && this.eventArray.map((elem) => {
                elem.target.style.border = "";
                elem.target.style.boxShadow = "";
                elem.target.style.padding = ""
                elem.target.style.borderRadius = ""
                if (elem.target && elem.target.parentNode) {
                    elem.target.parentNode.style.border = "";
                    elem.target.parentNode.style.boxShadow = "";
                    elem.target.parentNode.style.padding = ""
                    elem.target.parentNode.style.borderRadius = ""
                }
                if (elem.target && elem.target.parentNode && elem.target.parentNode.parentNode) {
                    elem.target.parentNode.parentNode.style.border = "";
                    elem.target.parentNode.parentNode.style.boxShadow = "";
                    elem.target.parentNode.parentNode.style.padding = ""
                    elem.target.parentNode.parentNode.style.borderRadius = ""
                }
            })
            let child_elem = ['SPAN', 'STRONG', 'BOLD', 'FONT', 'TR', 'TD', 'I', 'B', 'U', 'SUP', 'SUB']
            if (child_elem.indexOf(event.target.tagName.toUpperCase()) > -1) {
                if (event.target.tagName.toUpperCase() === "SPAN" && event.target.parentNode.tagName.toUpperCase() === 'SPAN') {
                    event.target.parentNode.parentNode.style.border = "2px solid #1fcf14";
                    event.target.parentNode.parentNode.style.boxShadow = "0px 4px 5px lightgrey";
                    event.target.parentNode.parentNode.style.padding = "2px 5px"
                    event.target.parentNode.parentNode.style.borderRadius = "6px"
                    this.test_subject.next(event.target.parentNode.parentNode);
                    editorSlide.style.top = (event.target.parentNode.parentNode.offsetTop - 5) + 'px';
                    editorSlide.style.left = event.target.parentNode.parentNode.offsetLeft + 68.5 + 'px';
                } else {
                    event.target.parentNode.style.border = "2px solid #1fcf14";
                    event.target.parentNode.style.border = "2px solid #1fcf14";
                    event.target.parentNode.style.boxShadow = "0px 4px 5px lightgrey";
                    event.target.parentNode.style.padding = "2px 5px"
                    event.target.parentNode.style.borderRadius = "6px"
                    this.test_subject.next(event.target.parentNode);
                    editorSlide.style.top = (event.target.parentNode.offsetTop - 5) + 'px';
                    editorSlide.style.left = event.target.parentNode.offsetLeft + 68.5 + 'px';
                }
            }
            else {
                event.target.style.border = "2px solid #1fcf14";
                event.target.style.boxShadow = "0px 4px 5px lightgrey";
                event.target.style.padding = "2px 5px"
                event.target.style.borderRadius = "6px"
                editorSlide.style.top = (event.target.offsetTop - 5) + 'px';
                editorSlide.style.left = event.target.offsetLeft + 68.5 + 'px';
                this.test_subject.next(event.target);
            }
        }
        // }
    }

    onkeyPressEvent=(event)=>{
  // console.log(event);
    // if (event.keyCode == 13) {
    //     console.log(event.keyCode,event.key);
//var x=document.getElementById("editableFrame");
    // console.log(document.activeElement instanceof HTMLIFrameElement,document.activeElement,(document.getElementById("editableFrame")).hasPointerCapture,document.activeElement instanceof HTMLIFrameElement);
//if(document.activeElement instanceof HTMLIFrameElement)
//if(event.keyCode != 13){
let x=document.getElementById("editableFrame")
let u = (<HTMLIFrameElement> x).contentWindow;


let ret;

 if (u.window.getSelection) {
        var range = u.window.getSelection().getRangeAt(0);
        ret = range.commonAncestorContainer.parentNode || u.document;
       // console.log(ret);


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
         if(ret.previousSibling!=null){
              if(ret.previousSibling.getAttribute("uniqid")==ret.getAttribute("uniqid"))
                  ret.setAttribute("uniqid","");
         }
         if(ret.nextSibling!=null  ){
              if(ret.nextSibling.getAttribute("uniqid")==ret.getAttribute("uniqid"))
                  ret.setAttribute("uniqid","");
         }

}



    

    }
 
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

}
