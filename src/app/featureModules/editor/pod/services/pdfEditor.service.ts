import {Injectable, Renderer2, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import { ProjectDataService } from '../services/project-data.service';
import { AppConfig } from '../../../../app-config';
import {Subject} from 'rxjs';
import { first } from 'rxjs/operators';
import {pdfEditorElementStruture} from '../services/pdfEditorElementStructure.service'
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'underscore';
import {Subscription} from 'rxjs';


@Injectable({providedIn:'root'})

export class pdfEditorService implements OnInit{
    private subject = new Subject<any>();

    renderer : Renderer2;
    public callbackHeight:any=0;
    public startSection:any;
    public offheight:any;
    //public setheight:any;
    public sectionCount:any=0;
    public newSectionElements:any;
    public jsondata:any;
    public setCount:any;
    public saveSection:any;
    // public storeElements=[];
    public saveElement:any;
    public appendElement:any;
    public saveJson:any;
    public isRecursive:any=false;
    public call:any;
    public sectionArray=[];
    public parentCount=0;
    public startIndex:any;
    public oldoffheight:any;
    public secheight:any;
    public breakLoop:any=false;
    public json_data:any;
    // public storeIndex:any;
    public APIUrl:any;
    public uploadURL;
    public assetsURL;
    public charAtLen:any;
    public startFrom:any=false;
    public isTableDetected:any;
    public unidIdCount:number=0
    public iframe:any;
    public contentdocument:any;
    public currentSectionCount:any=0;
    public pageBreak:any=false;



    public publish_subscribe:Subscription;

    public pub_sub:any={
        startFromUniqID:'',
        elemType:'',
        DOMelement:'',
        paraStartFrom:'',
        LIstartValue:'',
        traverseCount:'',
        isSibling:false,
        tableObj:{
            firstThreeRows:'',
            lastThreeRows:'',
            inBetween:'',
            removeTill:'',
            objStartFrom:''
        },
        breakCondition:false,
        objKey:''
    }
    constructor(
        public http:Http,private spinner: NgxSpinnerService,
        private dataservice: ProjectDataService,
        public appConfig: AppConfig,
        public pdfEditorElementStruture:pdfEditorElementStruture,
    ){
        this.APIUrl=appConfig.config.apiURL;
        this.uploadURL = this.appConfig.config.uploadsURL;

        var uploads_path = this.uploadURL.replace(new RegExp("./pod_assets/uploads/", "g"), "/pod_assets/uploads/");
        this.assetsURL=this.appConfig.config.hostURL + uploads_path;

        this.publish_subscribe = this.pdfEditorElementStruture.Publish().subscribe(Obj=>{
            _.each(Obj,(x)=>{
                this.pub_sub.hasOwnProperty(Obj)
            })
            this.pub_sub.startFromUniqID = Obj.startFromUniqID;
            this.pub_sub.DOMelement = Obj.DOMelement;
            this.pub_sub.elemType = Obj.elemType;
            this.pub_sub.siblingCounts = Obj.siblingCounts;
            this.pub_sub.isSibling  = Obj.isSibling;
            console.log('published',Obj)
        })
    }
    
    ngOnInit(){
        
    }
    public Observables(){
       return this.subject.asObservable();
    }

    /**Init function for this library */
    public getHtmlFile(tocDetails:any,contentdocument:any,sectionCount:any){
        this.sectionCount = sectionCount;
        this.unidIdCount=0;
        this.http.get(this.uploadURL+tocDetails.folder+'/s9ml/'+tocDetails.chapter_name+'/'+tocDetails.chapter_name+'.html').toPromise()
            .then(data => {
                let content = data.text();
                //console.log(content);
                //content=content.replace(new RegExp("uploads/","g"),this.uploadURL+tocDetails.folder+"/assets/");
                content=content.replace(new RegExp("../../assets/","g"),this.assetsURL+tocDetails.folder+"/assets/")
                content=content.replace(new RegExp("../../img/","g"),this.assetsURL+tocDetails.folder+"/img/");
                console.log(this.assetsURL+tocDetails.folder+"/img/");
                //this.clean(contentdocument.body);
                this.createJson(contentdocument,content,tocDetails,'',false);
                // this.iframeCssLinks(contentdocument,tocDetails.folder);
        })
    }
    
    /**html to json structure */
    public createJson(contentdocument:any,content:any,tocDetails:any,onSave,cleanUp)
    {   
        // this.iframe = document.getElementById("editableFrame");
        // this.contentdocument = (<HTMLIFrameElement> this.iframe).contentDocument;
        if(!onSave){
            var headTags = content.match(/<head[^>]*>[\s\S]*<\/head>/gi);
            var bodyTags = content.match(/<body[^>]*>[\s\S]*<\/body>/gi);            
            var blinkTags = headTags[0].match(/href="(.*?)"/g);
            blinkTags.forEach(links => {                
                links = links.replace("href=\"","").replace('"','');
                if(links.indexOf("_HTML") == -1){
                    links = links.replace(".css","_HTML.css");
                }
                if(contentdocument.head.innerHTML.indexOf(links) == -1){
                    contentdocument.head.innerHTML += "<link rel='stylesheet' href='"+links+"'>";
                }                
            });            
            contentdocument.body.innerHTML=bodyTags[0];
            this.clean(contentdocument.head);
            contentdocument.body.innerHTML = contentdocument.body.innerHTML.replace(/(\r\n\t|\n|\r\t)/gm,"");            
        }

        //this.clean(contentdocument);
        

        let json="[";
        let cjson="";
        let body_childs=!onSave?contentdocument.body.childNodes:contentdocument.childNodes;
        for (var b=0;b<body_childs.length;b++) {
            if(body_childs[b].nodeName != 'META' && body_childs[b].nodeName != 'LINK' ) 
                cjson+=this.jsonBifurcation(body_childs[b],cleanUp);
        }
        json+=cjson;
        //On saving the content just added who is edited the chapter on JSON
        if(onSave)
            json+='{"SPAN":[\n\r{"offsetHeight":"0","computedStyles":"color:;font-family:;font-size:;line-height:;white-space:;padding:;display:;float:;border:;border-top:;border-right:;border-bottom:;border-left:;border-color:;border-width:;border-style:;padding-top:;padding-right:;padding-bottom:;padding-left:;width:;height:;font-weight:;margin-top:;margin-left:;margin-bottom:;margin-right:;text-decoration:;background-color:;background-image:;font-style:;position:;text-align:;vertical-align:;top:;left:;bottom:;right:;word-wrap:;"},{"#text":"This chapter has been edited by '+(JSON.parse(localStorage.getItem('currentUser'))).username+" at "+new Date()+"+\"}]\n\r},"
        
        
        json=json.replace(/,\s*$/, "").replace(/},]/g, "}]").replace(/},,/g, "},");
        json=json+"]";
     
        if(!onSave)
            this.createJsonFile(json,tocDetails,contentdocument)

        if(onSave)
            return JSON.parse(json);
            
        this.spinner.hide();    
    }
     /**json jsonBifurcation */
    public jsonBifurcation(element:any,cleanUp){        
        if(element.nodeName!="#text"){
            var childjson='{"'+element.nodeName+'":[\n\r{';
            var child_attributes=element.attributes;

            for (var key in child_attributes) {
                if (child_attributes.hasOwnProperty(key)) {
                    
                if(child_attributes[key].nodeName == 'media' || child_attributes[key].nodeName == 'isbelongto' || child_attributes[key].nodeName == 'uniqid' || child_attributes[key].nodeName == 'unidIdCount'){
                }else{
                    let attr=child_attributes[key].value.replace(/['"]+/g, '');
                    childjson+='"'+child_attributes[key].nodeName+'":"'+attr+'",';
                }
                
                  
                } 
            }; 
            var styles=this.dataservice.defaultStyles();
            var p_styles = '';
            
            for (var s=0; s < styles.length; s++) {
                var style_prop=this.dataservice.getPropValue(element, styles[s]);
                style_prop=style_prop.replace(/['"]+/g, '');
                p_styles += styles[s]+':'+style_prop+';';
            }
            childjson+='"offsetHeight":"'+element.offsetHeight+'"';
            /**newly added for figure element */ 
            if(element.nodeName.toLowerCase() == 'img'){ 
                for (var s=0; s < styles.length; s++) {
                    if(styles[s] == "height" || styles[s] == "width"){
                        var style_prop=this.dataservice.getPropValue(element, styles[s]);
                        style_prop=style_prop.replace(/[a-z]/g, '');
                        childjson+= ',"'+styles[s]+'":"'+style_prop+'"';
                    }                    
                 }
            }  
            
            childjson+=',"computedStyles":"'+p_styles+'"}';  
            var childofchilds=element.childNodes;       
            if(childofchilds.length > 0){
                for (var c=0;c<childofchilds.length;c++) { 
                    childjson+=",\n\r"+this.jsonBifurcation(childofchilds[c],cleanUp);
                }
            }
            childjson+="]\n\r},";
        }else{
            var textContent = element.textContent.replace(/\n/g, " ").replace(/"/g, '\\"');
            var childjson='{"'+element.nodeName+'":"'+textContent+'"},';
        }       
        
        return childjson; 
    }
    /**function to create JSON file */
    public createJsonFile(json:any,tocDetails:any,contentdocument:any){
        this.http.post(this.APIUrl+'/savehtmljson',{ jsondata: json,folder:tocDetails.folder,chapter:tocDetails.chapter_name})
            .subscribe(()=>{
                this.json_data=JSON.parse(json);
                this.sectionArray=[];
                this.liStartvalue=[];
                this.sectionCount=0;
                this.charAtLen=0;
                this.compress_object = false;
                let section = this.renderer.createElement('section');
                this.renderer.setAttribute(section,'id','section_'+this.sectionCount);
                this.renderer.addClass(section,'dynamicSection');
                if(this.sectionCount >1){
                    let lineTag = this.dynamicTagging('line');
                    this.renderer.appendChild(section,lineTag);
            }
                
                // $(section).on('DOMNodeInserted', function(e) {
                //     console.log(e.target, ' was inserted');
                // })
                this.sectionArray.push(section);
                this.startSectionFrameCreation(contentdocument,this.sectionCount,this.json_data,false,this.unidIdCount);
        })
    }
    /**function to create dynamic elements for html header and footer structures */
    public dynamicTagging(type){
        console.log('dynamicTagging');
        let new_elem:any='';

        function tag(addChild,node){
            let line  = document.createElement(node);
            line.setAttribute('class','head_line')

            function innerFunction(){
                let div = document.createElement('div');
                div.setAttribute('class','frameBorders')
                div.appendChild(line);

                if(addChild){
                    let child = document.createElement(addChild.type)
                    // let text = this.renderer.createText(addChild.text)
                    // this.renderer.appendChild(child,text)
                    div.appendChild(line);
                }
                return  div;
            }
            return innerFunction;
        };

        switch(type){
            case 'line':
                new_elem = tag('','div')
                break;
        }

        return new_elem('','')
    }

    /**function to create section contents */
    public startSectionFrameCreation(contentdocument,secCount,data,startFromValue,editorValue){
        this.isTableDetected=false;
        this.setTableColumns = false;
        this.sectionCount = secCount;
        this.unidIdCount = editorValue?editorValue:this.unidIdCount;
        
        this.sectionArray[this.sectionCount].attributes.isChildLoaded = 'true';
        this.startSection = this.sectionArray[this.sectionCount];
        contentdocument.body.innerHTML='';
        contentdocument.body.appendChild(this.sectionArray[this.sectionCount]);
        this.startFrom = startFromValue;
        this.elementType = '';
        this.req_count=0;
        this.start_increment = false;
        this.condition_return = false;
        this.figureHeight=[];
        // this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
        for (var tkey in data) {
            if(this.pub_sub.startFromUniqID == '' && this.compress_object){
                
                let key = Object.keys(data[tkey])
                // this.pub_sub = this.pdfEditorElementStruture.SetStartValue(data[tkey][key[0]],true,'','',this.unidIdCount);
                // this.compress_object = this.pub_sub.startFromUniqID?false:true;
                // break;

                if(key[0] != "#text" && key[0] != "SCRIPT"){
                    this.pub_sub = this.pdfEditorElementStruture.SetStartValue(this.pub_sub,data[tkey][key[0]],true,'','',this.unidIdCount,false);
                    
                }else if(key[0] == "#text"){
                    console.log(key[0]);
                        if(data[tkey][key[0]].trim() != ""){

                        this.unidIdCount++;
                        data[tkey][key[0]][0].isbelongto = '';
                        data[tkey][key[0]][0].unidIdCount = 'element_'+this.unidIdCount;

                        this.pub_sub.startFromUniqID = 'element_'+this.unidIdCount;
                        // this.pub_sub.elemType = key[0].toLowerCase();
                        this.condition_return = true;
                    }
                }
                this.compress_object = this.pub_sub.startFromUniqID?false:true;
                break;
            }

            if(this.breakLoop)
                break; 

            this.createSectionElements(data[tkey],this.startSection,this.startFrom,false,false,function(section,_This){
                //_This.callbackHeight = _This.setheight
                console.log(section);
                 console.log(_This);
                _This.startSection = section!=''?section:'';
                _This.breakLoop = _This.breakLoop;
            });

            // if(this.pub_sub.startFromUniqID == '' && this.compress_object){
                
            //     let key = Object.keys(data[tkey]);

            //     if(key[0] != "#text" && key[0] != "SCRIPT"){
            //         this.pub_sub = this.pdfEditorElementStruture.SetStartValue(this.pub_sub,data[tkey][key[0]],true,'','',this.unidIdCount,true);
                    
            //     }else if(key[0] == "#text"){
            //             if(data[tkey][key[0]].trim() != ""){

            //             this.pub_sub.startFromUniqID = data[tkey][key[0]][0].unidIdCount;
            //             // this.pub_sub.elemType = key[0].toLowerCase();
            //             this.condition_return = true;
            //         }
            //     }
            //     this.compress_object = this.pub_sub.startFromUniqID?false:true;
            //     if(this.pub_sub.DOMelement.nodeName.toLowerCase() == 'p')
            //         this.pub_sub = this.pdfEditorElementStruture.paragraphStructure(this.pub_sub,this.pub_sub.DOMelement,this.secheight,data[tkey][key[0]],'',this.sectionArray,(this.sectionCount-1),this.charAtLen,this.unidIdCount,this.saveSection.id,true);

            //     break;
            // }

            // if(this.breakLoop)
            //     break; 

        }
        // if(this.pub_sub.elemType.split('_')[1] == 'dontRemove')
        //     this.pub_sub.DOMelement.classList.add('forcefit')

        this.breakLoop=false;
        contentdocument.body.style.wordWrap = 'normal';
        let obj={
            sectionArray:this.sectionArray,
            sectionCount:this.sectionCount,
            jsonData:data,
            uniqId:this.unidIdCount
        }        
        this.subject.next(obj)
    }


    
    public setTableColumns:any=false;
    
    public save_jsonObjects:any=[];
    public isLiDetected:any=false; /**boolean for li or ul or ol  */
    public liStartvalue:any=[] /**Array value for ul or ol start value */

    public isElementType:any /**detects type of element */
    public tableObj:any /**table object from pdfeditorstructure.service */
    public row_index:any=''; /**index of row  in table */
    public pageBreakInside:any='' /**condtion to element aside,header,h1,h4 etx */
    public isFigureDetected:any='';
    public startFromUniqID:any='';
    public condition_return:boolean = false;

    
    public test:any=[]

    public req_count:number=0;
    public start_increment:any=false;
    public elementType:any='';
    public compress_object:boolean = false;
    public figureHeight:any=[];

    /**function to create section elements */
    public createSectionElements(childkey,sectionTag,startIndex,onSave,startInsert,callback){
        //this.setheight = height;
        this.appendElement = sectionTag;
        
        if(callback)
            this.saveSection = sectionTag;

        
        for (var kkey in childkey) {
            if (childkey.hasOwnProperty(kkey)) {
                if(this.isRecursive)
                    break;

                if(!onSave && childkey[kkey][0].hasOwnProperty('isbelongto')){
                    if(childkey[kkey][0].isbelongto != '')
                        break;
                }
                
                if(kkey!='#text'){
                    var element=document.createElement(kkey);
                    if(kkey == 'IMG'){
                        this.figureHeight[0] = this.figureHeight[0]?this.figureHeight[0]+ Math.round(JSON.parse(childkey[kkey][0].height)):Math.round(JSON.parse(childkey[kkey][0].height))
                        // this.figureHeight.push((Math.round(JSON.parse(childkey[kkey][0].height))))
                        // this.figureHeight =  _.each((x,count)=>{return x[0] += x})
                    }


                    //element.addEventListener('DOMNodeRemovedFromDocument', this.OnNodeRemovedFromDocument, false)
                    this.appendElement.appendChild(element);
                    // if((!onSave) && !startIndex){
                    if((!onSave) && !startIndex){
                        this.unidIdCount++;
                        childkey[kkey][0].isbelongto = this.saveSection.id;
                        childkey[kkey][0].unidIdCount = 'element_'+this.unidIdCount;
                        element.setAttribute('uniqId','element_'+this.unidIdCount);
                    }else{
                        childkey[kkey][0].isbelongto = this.saveSection.id;
                        element.setAttribute('uniqId',childkey[kkey][0].unidIdCount);
                    }
                    var childjson=childkey[kkey];
                    var idx=0;
                    for (var pkey in childjson) {
                        if (childjson.hasOwnProperty(pkey)) {
                            if(this.isRecursive && !onSave){
                                childjson[0].isbelongto = '';
                                break;
                            }
                            var childattributes=childjson[pkey];
                            for (var cakey in childattributes) {
                                if(this.isRecursive){
                                    break;
                                }       
                                if (childattributes.hasOwnProperty(cakey)) {
                                    if(idx==0){
                                        if(cakey!="offsetHeight" && cakey!="computedStyles"){                       
                                            if(startIndex && element.nodeName.toLowerCase() == 'img'){

                                            }else{
                                                element.setAttribute(cakey,childattributes[cakey]);
                                            }
                                                

                                            if(element.nodeName != 'SECTION' && element.nodeName != 'FIGURE' && element.nodeName != 'META' && element.nodeName != 'FIGCAPTION' && element.nodeName != 'IMG' && element.nodeName != 'LINK'){
                                                element.setAttribute('setfocus','setfocus_'+this.unidIdCount);
                                                element.setAttribute('id','setfocus_'+this.unidIdCount);
                                                }
                                            }
                                    }else{
                                        
                                        if(cakey=="#text"){
                                            if(startIndex){
                                                // if((childjson[0].unidIdCount == this.pub_sub.startFromUniqID) && (element.nodeName.toLowerCase() == this.pub_sub.elemType) ){
                                                if((childjson[0].unidIdCount == this.pub_sub.startFromUniqID) || startInsert){
                                                    switch(element.nodeName.toLowerCase()){
                                                        case 'p':
                                                        case 'span':
                                                            //if(pkey == this.pub_sub.objKey){
                                                                for(var i=this.pub_sub.paraStartFrom?this.pub_sub.paraStartFrom:0;i<=(childattributes[cakey].length-1);i++){
                                                                    if(Math.round(this.sectionArray[this.sectionCount].getBoundingClientRect().height) >982){
                                                                        
                                                                        this.pub_sub.paraStartFrom = i;
                                                                        break;
                                                                    }
                    
                                                                    element.innerHTML += childattributes[cakey][i]
                                                                }
                                                                startIndex = false;
                                                            //}

                                                            
                                                            
                                                            break;
                                                        case 'li':
                                                            element.innerHTML +=childattributes[cakey];
                                                            this.pdfEditorElementStruture.listStructure(this.pub_sub,element,false,this.sectionCount,'','')
                                                            startIndex = false;
                                                            break;
                                                        default:
                                                            element.innerHTML +=childattributes[cakey];
                                                            startIndex = false;
                                                            break;
                                                    }
                                                    this.charAtLen ='';
                                                    childjson[0].isStartAppend = false;
                                                    this.startFrom = false;
                                                }             
                                            }else{
                                                element.innerHTML += childattributes[cakey];
                                            }

                                            
                                            this.offheight=parseInt(childjson[0]['offsetHeight']);
                                            this.secheight=Math.round(this.sectionArray[this.sectionCount].getBoundingClientRect().height);
                                            // this.secheight=this.figureHeight[0]?Math.round(this.sectionArray[this.sectionCount].getBoundingClientRect().height)+this.figureHeight[0]:Math.round(this.sectionArray[this.sectionCount].getBoundingClientRect().height);
                                            if(!onSave && this.secheight >990){
                                                this.saveElement = '';
                                                this.saveElement = element;
                                                this.isElementType='';
                                                childjson[0].isStartAppend = false;
                                                childjson[0].isbelongto = '';
                                                this.isRecursive= true;
                                                this.secheight=0;
                                                this.pub_sub = this.pdfEditorElementStruture.resetObj(this.pub_sub);
                                                break;
                                            }
                                        }
                                        else{
                                            if((childjson[0].unidIdCount == this.pub_sub.startFromUniqID))
                                                startInsert = true;

                                            this.createSectionElements(childattributes,element,this.startFrom,onSave,startInsert,'');
                                        }
                                    }
                                }
                            }
                        }
                        if(this.isRecursive){
                            if(this.pub_sub.elemType == '' || this.pub_sub.elemType == null || this.pub_sub.elemType == undefined){
                                
                                // this.isElementType = this.pdfEditorElementStruture.checkElementBreakCondition(element,this.secheight,childjson[JSON.parse(pkey)],this.sectionArray,this.sectionCount);
                                this.pdfEditorElementStruture.checkElementBreakCondition(element,this.secheight,childjson[JSON.parse(pkey)],this.sectionArray,this.sectionCount);
                                this.pub_sub;
                                this.req_count =0;
                                this.condition_return = false;
                                
                               //childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.elemType.toUpperCase())
                                
                                // if(typeof(this.isElementType) == 'string'){
                                if(this.pub_sub.elemType.split('_')[1] != 'dontRemove'){
                                    switch(this.pub_sub.elemType.toLowerCase()){
                                        case 'ol':
                                        case 'ul':
                                        case 'li':
                                        case 'list':
                                            this.pub_sub.LIstartValue = this.pdfEditorElementStruture.checkListArray(this.pub_sub.DOMelement,this.sectionCount,this.pub_sub);
                                            this.pub_sub.DOMelement = '';
                                            this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove'? this.pub_sub.elemType:'list';
                                            break;
                                        // case 'table':
                                        // case 'tbody':
                                            // let obj:any={
                                            //     firstThreeRows:true,
                                            //     lastThreeRows:false,
                                            //     inBetween:false,
                                            //     removeTill:'',
                                            //     objStartFrom:''
                                            // }
                                            // this.pub_sub.tableObj = obj
                                            // this.pub_sub.elemType = 'table';
                                            // break;
                                        case 'table':
                                        case 'tbody':
                                        case 'tr':
                                            this.pub_sub.elemType = 'table';
                                            break;
                                        case 'p':
                                        case 'paragraph':
                                            this.pub_sub = this.pdfEditorElementStruture.paragraphStructure(this.pub_sub,this.pub_sub.DOMelement,this.secheight,childjson,JSON.parse(pkey),this.sectionArray,this.sectionCount,this.charAtLen,this.unidIdCount,this.saveSection.id,false);
                                            childjson[0].isStartAppend = true;
                                            this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove'? this.pub_sub.elemType:'pagebreakInside';
                                            break;
                                        case 'figure':
                                            // if(this.pub_sub.elemType.split('_')[1] != 'dontRemove'){
                                            //         this.pub_sub.startFromUniqID = this.isElementType.element.getAttribute('uniqid');
                                            //         this.pub_sub.elemType = this.isElementType.element.nodeName.toLowerCase();
                                            //         this.pub_sub.DOMelement = this.isElementType.element;
                                            //         this.pub_sub.elemType = 'pagebreakInside';
                                            // }
                                            this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove'? this.pub_sub.elemType:'pagebreakInside';

                                            

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
                                            this.pub_sub = this.pdfEditorElementStruture.checkPreviousSibilings(this.pub_sub,this.pub_sub.DOMelement,this.sectionCount,true);
                                            this.pub_sub.elemType = this.pub_sub.elemType.split('_')[1] == 'dontRemove'? this.pub_sub.elemType:'pagebreakInside';
                                            break;
                                        case 'pagebreakInside':
                                            //this.pub_sub = this.pdfEditorElementStruture.pageBreakInside(this.pub_sub,this.saveElement,childjson[JSON.parse(pkey)]);
                                            break;
                                        case 'default':
                                        // if(this.pub_sub.elemType.split('_')[1] != 'dontRemove'){
                                        //         this.pub_sub.startFromUniqID = this.isElementType.element.getAttribute('uniqid');
                                        //         this.pub_sub.elemType = this.isElementType.element.nodeName.toLowerCase();
                                        //         this.pub_sub.DOMelement = this.isElementType.element;
                                        //         this.pub_sub.elemType = 'default';
                                        // }
                                        // this.isFigureDetected = true;
                                        break;

                                    }
                                }else{
                                    this.pub_sub.startFromUniqID = '';
                                    this.compress_object = true   
                                }
                            }
                           
                            if(!this.condition_return){

                                if(this.compress_object && (this.pub_sub.elemType.split('_')[1] == 'dontRemove' && (childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toUpperCase())))){
                                    this.pub_sub.startFromUniqID = '';
                                    let indx:any= Math.round(JSON.parse(pkey))
                                    for(var i = indx; i< childjson.length; i++){
                                        if(this.pub_sub.startFromUniqID){
                                            break
                                        }

                                        let key = Object.keys(childjson[i]);
                                        if(key[0] != "#text" && key[0] != "SCRIPT"){
                                            this.pub_sub = this.pdfEditorElementStruture.SetStartValue(this.pub_sub,childjson[i][key[0]],true,'','',this.unidIdCount,false);
                                        }else if(key[0] == "#text"){
                                            if(childjson[Math.round(JSON.parse(pkey)+1)][key[0]].trim() != ""){

                                                this.unidIdCount++;
                                                childjson[i][key[0]][0].isbelongto = '';
                                                childjson[i][key[0]][0].unidIdCount = 'element_'+this.unidIdCount;
                                                this.pub_sub.startFromUniqID = 'element_'+this.unidIdCount;
                                                this.condition_return = true;
                                            }
                                        }
                                    }
                                    this.compress_object = this.pub_sub.startFromUniqID?false:true;
                                    // break;
                                }
                                if(this.pub_sub.elemType == 'table'){
                                    if(this.pub_sub.tableObj.firstThreeRows == '' && ((childjson[JSON.parse(pkey)].hasOwnProperty('TR')) || (childjson[JSON.parse(pkey)].hasOwnProperty('TABLE'))))
                                        this.pub_sub.tableObj = this.pdfEditorElementStruture.getElementInTable(this.pub_sub.tableObj,childjson,JSON.parse(pkey))

                                    if(this.pub_sub.tableObj.firstThreeRows){
                                        if(childjson[JSON.parse(pkey)].hasOwnProperty('TABLE')){
                                            this.pub_sub = this.pdfEditorElementStruture.formatTableStructure(this.pub_sub,element.childNodes[Math.round((JSON.parse(pkey))-1)],this.pub_sub.tableObj,'');
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,'','');
                                            childjson[0].isbelongto = '';
                                            this.condition_return = true;
                                            this.pub_sub.tableObj ='';
                                            this.row_index ='';
                                            //this.isTableDetected = false;
                                        }
                                    }else if(this.pub_sub.tableObj.lastThreeRows){
                                        if(childjson[JSON.parse(pkey)].hasOwnProperty('TR'))
                                            this.row_index = JSON.parse(pkey);
                                        

                                        if(childjson[JSON.parse(pkey)].hasOwnProperty('TBODY')){
                                            this.pub_sub = this.pdfEditorElementStruture.formatTableStructure(this.pub_sub,element.childNodes[Math.round((JSON.parse(pkey))-1)],this.pub_sub.tableObj,this.saveElement);
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub,'',childjson[JSON.parse(pkey)],this.sectionCount,this.pub_sub.tableObj.objStartFrom,'');
                                            childjson[0].isbelongto = '';
                                            this.condition_return = true;
                                            this.pub_sub.tableObj ='';
                                            this.row_index ='';
                                        }   
                                        //this.isTableDetected = false;
                                    }else if(this.pub_sub.tableObj.inBetween){
                                        if(childjson[JSON.parse(pkey)].hasOwnProperty('TR'))
                                            this.row_index = JSON.parse(pkey);

                                        if(childjson[JSON.parse(pkey)].hasOwnProperty('TBODY')){
                                            let arr:any=[];
                                            arr = Array.from(element.children).filter((x,count)=>{return x.nodeName.toLowerCase() == 'tbody'});

                                            this.pub_sub = this.pdfEditorElementStruture.formatTableStructure(this.pub_sub,element.childNodes[Math.round((JSON.parse(pkey))-1)],this.pub_sub.tableObj,arr[0].lastChild);
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,this.row_index,'');
                                            childjson[0].isbelongto = '';
                                            this.condition_return = true;
                                            this.pub_sub.tableObj ='';
                                            this.row_index ='';
                                        }
                                        
                                        //this.isTableDetected = false;
                                    }
                                }else if(this.pub_sub.elemType == 'list' && (childjson[JSON.parse(pkey)].hasOwnProperty('LI') || childjson[JSON.parse(pkey)].hasOwnProperty('OL') || childjson[JSON.parse(pkey)].hasOwnProperty('UL'))){

                                        if(this.pub_sub.DOMelement == ''){
                                            this.pub_sub = this.pdfEditorElementStruture.listStructure(this.pub_sub,this.saveElement,true,this.sectionCount,childjson,pkey);
                                        }
                                        if(this.pub_sub.DOMelement && childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toUpperCase())){
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,'','');
                                            childjson[0].isbelongto = '';
                                                this.condition_return = true;
                                        }
                                        // if(this.pub_sub.DOMelement == ''){
                                        //     this.pub_sub = this.pdfEditorElementStruture.listStructure(this.pub_sub,this.saveElement,true,this.sectionCount,childjson,pkey);
                                        // }
                                        // if(childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toUpperCase())){
                                        //     this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,'','');
                                        //     this.condition_return = true;
                                        // }

                                        // if(this.pub_sub.DOMelement == ''){
                                        //     this.pub_sub = this.pdfEditorElementStruture.listStructure(this.pub_sub,this.saveElement,true,this.liStartvalue,this.sectionCount,childjson,pkey);
                                        // }else if(childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toUpperCase())){
                                        //     this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,'','');
                                        //     this.condition_return = true;
                                        // }
                                    
                                }else if(this.pub_sub.elemType == 'pagebreakInside'){
                                    // if(this.start_increment>0)
                                    //     this.req_count++

                                    // if(this.pub_sub.DOMelement && (this.req_count == this.pub_sub.traverseCount) && (childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.elemType.toUpperCase()))){
                                    if(this.pub_sub.isSibling){
                                        let key = Object.keys(childjson[JSON.parse(pkey)])
                                        let value = this.pdfEditorElementStruture.resetLoop(this.pub_sub,childjson,false,'','',true)
                                        if(value){
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[(value-1)],this.sectionCount,'','');
                                            this.pub_sub.DOMelement = '';
                                            //this.pub_sub.objKey = '';
                                            // this.start_increment = false;
                                            childjson[0].isbelongto = '';
                                            this.condition_return = true;
                                            return
                                        }
                                    }else if(this.pub_sub.DOMelement && (childjson[JSON.parse(pkey)][cakey][0].unidIdCount == this.pub_sub.startFromUniqID ) && (childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toUpperCase()))){
                                        this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,'','');
                                        this.pub_sub.DOMelement = '';
                                        //this.pub_sub.objKey = '';
                                        // this.start_increment = false;
                                        childjson[0].isbelongto = '';
                                        this.condition_return = true;
                                    }

                                    
                                    // if(this.pub_sub.DOMelement && childjson[JSON.parse(pkey)].hasOwnProperty(this.saveElement.nodeName.toUpperCase()) && (this.pub_sub.traverseCount>0))
                                    //     this.start_increment = true;
                                
                                }else if(this.pub_sub.elemType == 'default'){
                                    // if(this.pub_sub.DOMelement && (this.req_count == this.pub_sub.traverseCount) && (childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.elemType.toUpperCase()))){

                                    if(this.pub_sub.isSibling){
                                        let key = Object.keys(childjson[JSON.parse(pkey)])
                                        let value = this.pdfEditorElementStruture.resetLoop(this.pub_sub,childjson,false,'','',true)
                                        if(value){
                                            this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[(value-1)],this.sectionCount,'','');
                                            this.pub_sub.DOMelement = '';
                                            //this.pub_sub.objKey = '';
                                            // this.start_increment = false;
                                            childjson[0].isbelongto = '';
                                            this.condition_return = true;
                                            return
                                        }
                                    }else if(this.pub_sub.DOMelement && (childjson[JSON.parse(pkey)][cakey][0].unidIdCount == this.pub_sub.startFromUniqID ) && (childjson[JSON.parse(pkey)].hasOwnProperty(this.pub_sub.DOMelement.nodeName.toUpperCase()))){
                                        this.pdfEditorElementStruture.removeElement(this.pub_sub,this.pub_sub.DOMelement,childjson[JSON.parse(pkey)],this.sectionCount,'','');
                                        this.pub_sub.DOMelement = '';
                                        //this.pub_sub.objKey = '';
                                        // this.start_increment = false;
                                        childjson[0].isbelongto = '';
                                        this.condition_return = true;
                                    }
                                
                                }
                                
                            }
                           
                            childjson[0].isbelongto = '';
                            break;
                        }
                        idx++;
                    }
                }else{
                    var textnode = document.createTextNode(childkey[kkey]);
                    this.appendElement.appendChild(textnode);
                }
            }
                
            
        }
        if(callback){
            if(this.isRecursive){
                this.saveJson = childkey;
                this.currentSectionCount = this.sectionCount;
                this.sectionCount++;
                
                let section = this.renderer.createElement('section');
                this.renderer.setAttribute(section,'id','section_'+this.sectionCount);
                this.renderer.addClass(section,'dynamicSection');
                this.renderer.setAttribute(section,'isChildLoaded','false');
                // if(this.sectionCount>1){
                let lineTag = this.dynamicTagging('line');
                this.renderer.appendChild(section,lineTag);
                // }
                this.breakLoop = true;
                this.isRecursive = false;
                this.sectionArray.push(section);
                callback('',this);
            }else{
                if(callback)
                    callback(this.saveSection,this);
            }
        }
    }
    /**DOM listener for element removal */
    public OnNodeRemovedFromDocument (event) {
        var option = event.target;
        console.log ("The option with label is removed" ,event.target);
    }

    public stringConcade(str){
        const re = /\b[\w']+(?:\s+[\w']+){0,0}/g;
        const wordList = str.match(re);
        return wordList;    
    }

    /**function to clean iframe document body */
    public clean(node)
    {
        for(var n = 0; n < node.childNodes.length; n ++){
            var child = node.childNodes[n];
            if(child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue)) || child.nodeName.toLowerCase() == '#comment'){
                node.removeChild(child);
                n --;
            }
            else if(child.nodeType === 1)
            {
                this.clean(child);
            }
        }
    } 
    /** function  to load css in iframe */
    public iframeCssLinks(contentdocument,folder,resolve,reject){
        const customCSS  = document.createElement('link');
        customCSS.rel = 'stylesheet';
        customCSS.href = './pod_assets/editorFiles/iframe.css';

        const temp_1 = document.createElement('script');
        temp_1.setAttribute('type','text/javascript');
        temp_1.setAttribute('src','https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=MML_HTMLorMML')

        const temp_2 = document.createElement('script');
        temp_2.text = 'window.MathJax = { MathML: { extensions: ["mml3.js", "content-mathml.js"]}};';
        temp_2.setAttribute('type','text/javascript');

        contentdocument.head.appendChild(temp_1);
        contentdocument.head.appendChild(temp_2);

        let appendFlag = 0;
        
        let headerLinks = contentdocument.head.getElementsByTagName('link');
        for(var ii=0;ii< headerLinks.length;ii++){
            var links = headerLinks[ii].href;
            if(links.indexOf("pod_assets/editorFiles/quill.snow.css") >0){
                appendFlag++;               
            }
            if(links.indexOf("pod_assets/uploads")> 0 && links.indexOf("_HTML") == -1){
                links = links.replace(".css","_HTML.css");                
                var relativeHeader = links.split("pod_assets/uploads/")[1];
                links = "./pod_assets/uploads/"+relativeHeader;
                headerLinks[ii].parentNode.removeChild(headerLinks[ii]);    ii--;
                const alteredCss  = document.createElement('link');
                alteredCss.rel = 'stylesheet';
                alteredCss.href = links;
                contentdocument.head.appendChild(alteredCss);
            }            
        }       
        if(appendFlag == 0){
            contentdocument.head.appendChild(customCSS);    
        }    
        resolve('completed') 
            
    }
}