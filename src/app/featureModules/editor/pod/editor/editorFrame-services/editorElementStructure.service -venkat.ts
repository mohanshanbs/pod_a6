import { Injectable, Injector } from "@angular/core";
import * as _ from 'underscore';
import {Subject} from 'rxjs';
import {pdfEditorModel} from '../../pdfEditor.model';
import { AbstractClassComponent } from '../components-services/abstractClass.component'

@Injectable({providedIn:'root'})

export class EditorElementStruture extends AbstractClassComponent{
    public subjecElement = new Subject<pdfEditorModel>();
    constructor(injector:Injector){
        super(injector);
        this.subjecElement.asObservable();
    }
    public header_Array:any=[];
    public publish:any=[];
    public case_table:any=['table','tbody','tr','td'];
    public case_list:any=[''];

    /**resetting the object */
    public resetObj(Obj){
        Obj.startFromUniqID ='';
        Obj.elemType=''
        Obj.DOMelement=''
        Obj.paraStartFrom=''
        // Obj.LIstartValue=''
        Obj.resetId='',
        Obj.traverseCount=0;
        Obj.isSibling=false;
        Obj.objKey='';
        Obj.breakCondition=false;
        Obj.tableObj={
            firstThreeRows:'',
            lastThreeRows:'',
            inBetween:'',
            removeTill:'',
            objStartFrom:'',
            row_index:''
        }
        this.breakLoop = false;
        this.breakJSON = false;

        return Obj
    }
    
    /**function to check what type of element under condition */
    public checkElementBreakCondition = function(elem){
        this.publish =[];
        let _This = this;
        let setFunction = function(type,element){
            if(element.previousElementSibling != null || element.previousElementSibling != undefined){
                // if(element.previousElementSibling.nodeName.toLocaleLowerCase() == 'header' || element.previousElementSibling.nodeName.toLocaleLowerCase() == 'h1' || element.previousElementSibling.nodeName.toLocaleLowerCase() == 'h2' || element.previousElementSibling.nodeName.toLocaleLowerCase() == 'h3' || element.previousElementSibling.nodeName.toLocaleLowerCase() == 'h4' || element.previousElementSibling.nodeName.toLocaleLowerCase() == 'h5' || element.previousElementSibling.nodeName.toLocaleLowerCase() == 'h6'){
                //     _This.publish.push(
                //         {
                //             startFromUniqID:element.getAttribute('uniqid'),
                //             elemType:type,
                //             siblingCounts:element.parentNode.children.length,
                //             DOMelement:element,
                //             breakCondition:false,
                //             headerArray:[{
                //                 startFromUniqID:element.previousElementSibling.getAttribute('uniqid'),
                //                 elemType:type,
                //                 siblingCounts:element.previousElementSibling.parentNode.children.length,
                //                 DOMelement:element.previousElementSibling,
                //                 breakCondition:false
                //             }]
                //         });
                        
                // }else{
                    _This.publish.push(
                        {
                            startFromUniqID:element.getAttribute('uniqid'),
                            elemType:type,
                            siblingCounts:element.parentNode.children.length,
                            DOMelement:element,
                            breakCondition:false,
                            headerArray:[]
                        });
                // }
            }else{
                _This.publish.push(
                    {
                        startFromUniqID:element.getAttribute('uniqid'),
                        elemType:type,
                        siblingCounts:element.parentNode.children.length,
                        DOMelement:element,
                        breakCondition:false,
                        headerArray:[]
                    });
            }
            
            return true
        }
        do{
            switch (elem.nodeName.toLowerCase()){
                case 'ol':
                case 'ul':
                case 'li':
                    if(elem.previousElementSibling && elem.previousElementSibling.nodeName.toLowerCase() == "p") {
                        var preText = elem.previousElementSibling.textContent.trim();
                        var textStatus = preText.endsWith(":");
                        if(textStatus){
                            elem = elem.previousElementSibling;
                        }
                    }
                    // if(elem.parentNode.previousElementSibling && elem.parentNode.previousElementSibling.nodeName.toLowerCase() == "p"){
                    //     var preText = elem.parentNode.previousElementSibling.textContent.trim();
                    //     var textStatus = preText.endsWith(":");
                    //     if(textStatus){
                    //         elem = elem.parentNode.previousElementSibling
                    //     }
                    // }
                    setFunction('list',elem)
                    break;
                case 'tr':
                setFunction('tr',elem)
                    break;
                case 'table':
                case 'tbody':
                setFunction('table',elem)
                    break;
                case 'p':
                    if(elem.classList.contains("source")) {
                        elem = elem.parentNode;
                    }
                setFunction('paragraph',elem)
                    break;
                case 'header':
                setFunction('header',elem)
                    break;
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                setFunction('header',elem)
                    break;
                case 'figure':
                setFunction('figure',elem)
                    break;
                case 'aside':
                setFunction('aside',elem)
                    break;
                case 'section':
                setFunction('section',elem)
                    break;
                case 'blockquote':
                setFunction('pagebreakInside',elem)
                    break;
                default:
                    setFunction('default',elem)
                    break;
            }
            
            
            elem = elem.parentNode;
            if(elem.previousElementSibling && elem.previousElementSibling.nodeName.toLowerCase() == "header"){
                    elem = elem.parentNode;
                 }
        }while(elem.parentNode.nodeName.toLowerCase() != 'body')

        this.publish.push({startFromUniqID:elem.getAttribute('uniqid'),elemType:'firstIndex',siblingCounts:Math.round(elem.parentNode.children.length - 1),breakCondition:false});
        this.subjecElement.next(this.checkElementCondition(this.publish,true))
    }
    public checkElementCondition = function(array,callback){
        let value:any='';
        _.each(array,(x,count)=>{
            if(value)
                return;

            switch(x.elemType){
                case 'table':
                    value = x;
                    break;
                case 'tr':
                case 'td':
                    value = x;
                break;
                case 'list':
                    value = x;
                break;
                case 'figure':
                    value = x;
                break;
                case 'header':
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    value = x;
                break;
                default:
                    if(value)
                        break;

                break;
            }
        })
        value = value == ''?array.find((x)=>{ return x.siblingCounts > 1 }):value;        
        if(value == undefined || value.elemType=='firstIndex')
            value = array[0]

        if(value.headerArray.length>0){
            value = value.headerArray[0]
            console.log(value.headerArray,"headerArray");
        }
            
        let copy_arr = [...array];
        let setDonRemove:any=false;
        copy_arr.splice(0,array.indexOf(value))
        setDonRemove = copy_arr.every((x)=>{
            return x.siblingCounts < 2
        })
        if(setDonRemove){
            let isHead =  array.filter((x)=>{ return x.elemType == 'header' || x.elemType == 'h1' || x.elemType == 'h2' || x.elemType == 'h3' || x.elemType == 'h4' || x.elemType == 'h5' || x.elemType == 'h6' || x.elemType == 'figure'})
            if(isHead.length>0){
                value = isHead[0]
            }else{
                let set = array[0].elemType+'_dontRemove';
                array[0].elemType ='';
                array[0].elemType = set;
                value = array[0]
            }
            
        }
        if(callback){
            if(value.elemType.split('_')[1] == 'dontRemove')
                return value ;
            else
            return value = value.siblingCounts > 1 ? this.checkPreviousElements_service.checkPreviousSibilings(value,value.DOMelement,true):this.checkPreviousElements_service.checkAncestors(value,value.DOMelement,);
        }
        //return value = value.siblingCounts > 1 ? this.CheckPreviousElements_service.checkPreviousSibilings(value,value.DOMelement,true):this.CheckPreviousElements_service.checkAncestors(value,value.DOMelement,);

        //return value = value.siblingCounts > 1 ? this.checkPreviousSibilings(value,value.DOMelement,true):this.checkAncestors(value,value.DOMelement,);
    }
    public checkElementNotRemove= function(elem,type){ 
      //  console.log(elem);
        let copy_arr = [...this.publish]
        let setDonRemove:any=false;
        if(Array.from(elem.parentNode.childNodes).indexOf(elem) == 0){
            elem = elem.parentNode;
        }
        copy_arr.splice(0,this.publish.indexOf(this.publish.filter((x,count)=>{ return x.startFromUniqID == elem.getAttribute('uniqid')})[0]))

        setDonRemove = copy_arr.every((x)=>{
            return x.siblingCounts < 2
        })
        if(setDonRemove)
        type = type+'_dontRemove';
        
        return type
    }
    
    public removeElement = function(Obj,element,childjson,sectionCount,fromIndex,tillIndex,state){

        while(element){
            if(element.parentNode && element.parentNode.childElementCount > 1 || element.parentNode && element.parentNode.id=='section_'+sectionCount)
                break;
            
                element = element.parentNode;
        }

        // if(element.previousElementSibling == '' || element.previousElementSibling == null)
        //     element.parentNode.setAttribute('break','break_condition')
        // else
        //     element.previousElementSibling.setAttribute('break','break_condition')    
        if(element){    
            if(element.previousElementSibling == '' || element.previousElementSibling == null) { 
                if(element.parentNode.parentNode && element.parentNode.parentNode.nodeName.toLowerCase() == "figcaption"){
                        element = element.parentNode.parentNode;
                    }      
                    element.parentNode.setAttribute('break','break_condition');    
                }     
                else {    
                    element.previousElementSibling.setAttribute('break','break_condition');     
                }    
        }    
        if(element && element.previousElementSibling && (element.previousElementSibling.getAttribute('text') == 'Required' || element.previousElementSibling.nodeName.toLowerCase() == 'caption')) {    
            element = element.parentNode;    
        }
        

        if(element)
            element.parentNode.removeChild(element);
        if(!state)
            return

        let key = Object.keys(childjson);
        this.breakLoop= false;
        this.checkElementExist(Obj,childjson[key[0]],false,fromIndex,tillIndex,false);
    }
    public breakLoop:boolean=false;
    /**function to reset object (isbelongTo,istartappend) */
    public checkElementExist = function (Obj,childjson,setStartAppend,fromIndex,tillIndex,checkExistOrNot){
        // childjson[0]['attributes'][0].isbelongTo = !checkExistOrNot?'':childjson[0]['attributes'][0].isbelongTo; 
        let len = tillIndex?tillIndex:childjson.length;

        // if(len<=1 && !checkExistOrNot)
            // childjson[0]['attributes'][0].isbelongTo = ''; 

        for(var i=fromIndex?fromIndex:1; i< len; i++){
            if(this.breakLoop)
                return i;

                
            let key1 = Object.keys(childjson);
            if(childjson[key1[i]].hasOwnProperty('text')){
                if(childjson[key1[0]]['attributes'][0].uniqid == Obj.startFromUniqID || setStartAppend){
                    if(checkExistOrNot){
                        this.breakLoop = true;
                    }else{
                        // childjson[key1[0]]['attributes'][0].isStartAppend = true;
                        setStartAppend = false;
                    }
                }
                // childjson[key1[0]]['attributes'][0].isbelongTo = !checkExistOrNot?'':childjson[key1[0]]['attributes'][0].isbelongTo; 
            }else{
                setStartAppend = childjson[key1[0]]['attributes'][0].uniqid == Obj.startFromUniqID?true:false;
                if(childjson[key1[0]]['attributes'][0].uniqid == Obj.startFromUniqID && checkExistOrNot)
                        this.breakLoop = true;

                let key2 = Object.keys(childjson[i]);
                this.checkElementExist(Obj,childjson[i][key2[0]],setStartAppend,'','',checkExistOrNot)
            }
        }
        if(checkExistOrNot && this.breakLoop)
            return i;
    }
    /** function to reset and set New object (isbelongTo,istartappend)*/
    public SetStartValue = function (Obj,childjson,setStartAppend,fromIndex,tillIndex,uniqid,currentExecution){
        let breakLoop:boolean=false;
        //childjson[0]['attributes'][0].isbelongTo = ''; 
        let len = tillIndex?tillIndex:childjson.length;
        // if(len<=1)
            //childjson[0]['attributes'][0].isbelongTo = ''; 

        for(var i=fromIndex?fromIndex:1; i< len; i++){
            if(breakLoop)
                break

            let key1 = Object.keys(childjson);
            if(childjson[key1[i]].hasOwnProperty('text')){
                if(childjson[key1[i]]['text'].trim() != ""){
                    // if(!currentExecution){
                    //     uniqid++;
                    // }
                    // childjson[key1[0]]['attributes'][0].uniqid = 'element_'+uniqid
                    //childjson[key1[0]]['attributes'][0].isbelongTo = ''; 
                    Obj.startFromUniqID = childjson[key1[0]]['attributes'][0].uniqid;
                    breakLoop = true;
                }
            }else{
                let key2 = Object.keys(childjson[i]);
                this.SetStartValue(Obj,childjson[i][key2[0]],setStartAppend,'','',uniqid,currentExecution)
            }
        } 
        return Obj
    }

    public SetStartValueNew = function (Obj,childjson,setStartAppend,fromIndex,tillIndex,uniqid,currentExecution){
        let breakLoop:boolean=false;
        let len = tillIndex?tillIndex:childjson.length;

        for(var i=fromIndex?fromIndex:1; i< len; i++){
            if(breakLoop)
                break

            let key1 = Object.keys(childjson);
            if(childjson[key1[i]].hasOwnProperty('text')){
                if(childjson[key1[i]]['text'].trim() != ""){
                    Obj.startFromUniqID = childjson[key1[0]]['attributes'][0].uniqid;
                    breakLoop = true;
                }
            }else{
                let key2 = Object.keys(childjson[i]);
                this.SetStartValue(Obj,childjson[i][key2[0]],setStartAppend,'','',uniqid,currentExecution)
            }
        } 
        return Obj
    }

    breakJSON:boolean=false;
    public resetJSON = async function(json,isSave,sectionCount,pub_sub){
        let elem_type:any='';
        let data:any=''

        elem_type = Object.keys(json)[0];
        if(!isSave && json[elem_type][0]['attributes'][0].hasOwnProperty('isbelongTo')){
            if(json[elem_type][0]['attributes'][0].isbelongTo != 'page_'+sectionCount)
                return
        }

        data = json[elem_type];
        try{
            for(let key in data){
                
                if(!this.breakJSON){
                    if(Object.keys(data[key])[0].toLowerCase() == 'attributes'){
                        // console.log('id',data[key][Object.keys(data[key])[0]][0].uniqid)
                        if(data[key][Object.keys(data[key])[0]][0].uniqid == pub_sub.startFromUniqID){
                            data[key][Object.keys(data[key])[0]][0].isbelongTo = '';
                            this.breakJSON = true;
                            break;
                        }
                    }else if(Object.keys(data[key])[0].toLowerCase() != 'text'){
                        await this.resetJSON(data[key],isSave,sectionCount,pub_sub)
                    }
                }
                if(this.breakJSON){
                    json[elem_type][0]['attributes'][0].isbelongTo = "";
                    break;
                }
            }
            return new Promise((resolve,reject)=>{
                resolve('structured')
            })
        } catch (error){
            console.log(error)
        }
    }

    public resetJSONNew = async function(json,isSave,sectionCount,pub_sub){
        let elem_type:any='';
        let data:any=''

        elem_type = json.name;
        if(!isSave && json["attributes"][0].hasOwnProperty('isbelongTo')){
            if(json['attributes'][0].isbelongTo != 'page_'+sectionCount)
                return
        }

        data = json;
        try{
            // for(let key in data){
                if(!this.breakJSON){
                    if(Object.keys(json).includes('attributes')){
                        // console.log('id',data[key][Object.keys(data[key])[0]][0].uniqid)
                        if(data["attributes"][0].uniqid == pub_sub.startFromUniqID){
                            json['attributes'][0].isbelongTo = '';
                            this.breakJSON = true;
                        }
                    }else if(Object.keys(json).includes('text')){
                        await this.resetJSON(data, isSave,sectionCount, pub_sub)
                    }
                }
                if(this.breakJSON){
                    json['attributes'][0].isbelongTo  = "";
                }
            // }
            return new Promise((resolve,reject)=>{
                resolve('structured')
            })
        } catch (error){
            console.log(error)
        }
    }


    // /** function to check ancestor */
    // public checkAncestors(Obj,element){
    //     let elem = element;
    //     let default_value:any= false;
    //     //Obj.traverseCount=0;
    //     while(elem){
    //         switch (elem.parentNode.nodeName.toLowerCase()){
    //             case 'p':
    //                 if(elem.innerHTML.length > 206){
    //                     Obj.startFromUniqID = elem.getAttribute('uniqid');
    //                     Obj.elemType = elem.nodeName.toLowerCase();
    //                     Obj.isSibling = false;
    //                 }else{
    //                     Obj.startFromUniqID = elem.getAttribute('uniqid')
    //                     Obj.elemType = elem.nodeName.toLowerCase();
    //                     Obj.DOMelement = elem;
    //                     Obj.breakCondition = true;
    //                 }
    //                 break;
    //             case 'h1':
    //             case 'header':
    //                 Obj.traverseCount++;
    //                 Obj.isSibling = false;
    //                 Obj = this.checkPreviousSibilings(Obj,elem.parentNode,true);
    //                 break;
    //             case 'section':
    //             case 'aside':
    //                 Obj.traverseCount++;
    //                 Obj.isSibling = false;
    //                 Obj = this.checkPreviousSibilings(Obj,elem.parentNode,true);
    //                 break;
    //             case 'blockquote':
    //                 Obj.startFromUniqID = elem.getAttribute('uniqid')
    //                 Obj.elemType = elem.nodeName.toLowerCase();
    //                 Obj.DOMelement = elem;
    //                 Obj.isSibling = false;
    //                 break;
    //             case 'table':
    //             case 'thead':
    //             case 'tbody':
    //             case 'tr':
    //                 Obj.startFromUniqID = elem.getAttribute('uniqid')
    //                 Obj.elemType = elem.nodeName.toLowerCase();
    //                 Obj.DOMelement = elem;
    //                 Obj.isSibling = false;
    //                 Obj.breakCondition = true;
    //                 break;
    //             case 'td':
    //                 Obj.startFromUniqID = elem.getAttribute('uniqid')
    //                 Obj.elemType = elem.nodeName.toLowerCase();
    //                 Obj.DOMelement = elem;
    //                 Obj.breakCondition = false;
    //                 Obj.isSibling = false;
    //                 break;
    //             case 'li':
    //                 Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
    //                 Obj.elemType = elem.parentNode.nodeName.toLowerCase();
    //                 Obj.DOMelement = elem.parentNode;
    //                 Obj.breakCondition = true;
    //                 Obj.isSibling = false;
    //                 break;
    //             default:
    //                 if(elem.nodeName.toLowerCase() == 'header'){
    //                     Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
    //                     Obj.elemType = 'default';
    //                     Obj.DOMelement = elem.parentNode;
    //                     Obj.breakCondition = true;
    //                     Obj.isSibling = false;
    //                 break;   
    //                 }else{
    //                     Obj.startFromUniqID = elem.getAttribute('uniqid')
    //                     Obj.elemType = elem.nodeName.toLowerCase();
    //                     Obj.DOMelement = elem;
    //                     Obj.breakCondition = true;
    //                     break;
    //                 }
    //         }
    //         if((Obj.elemType) && (Obj.breakCondition))
    //             break;

    //         if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='aside' ))
    //             break;

    //         if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='section') && (Obj.DOMelement.parentNode.nodeName.toLowerCase() == 'aside')){
    //             if(Obj.DOMelement.previousElementSibling == null){
    //                 Obj.traverseCount++;
    //                 Obj.startFromUniqID = Obj.DOMelement.parentNode.getAttribute('uniqid');
    //                 Obj.elemType = Obj.DOMelement.parentNode.nodeName.toLowerCase();
    //                 Obj.DOMelement = Obj.DOMelement.parentNode;
    //                 break;
    //             }else{
    //                 break;
    //             }
    //         }else if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='section') && (Obj.DOMelement.parentNode.nodeName.toLowerCase() != 'aside')){
    //             break;
    //         }

    //         elem = elem.parentNode;
    //     }

    //     return Obj;
    // }
    // public checkDescendants(obj,element){
    //     let elem = element
    //     // var _This = this;
    //     // let ret:boolean=false;
    //     // let type = function(elem){
    //     //     let curr_elem = elem.children.length>0?Array.from(elem.children):'';
    //     //     if(!curr_elem)
    //     //         return;

            
    //     //     _.each(curr_elem,(x,count_1)=>{
    //     //         if(x.nodeName.toLowerCase() == 'h1' || x.nodeName.toLowerCase() == 'h2' || x.nodeName.toLowerCase() == 'h3' || x.nodeName.toLowerCase() == 'h4' || x.nodeName.toLowerCase() == 'h5' || x.nodeName.toLowerCase() == 'h6'){

    //     //             _This.header_Array = x.nodeName;
    //     //             ret = true;
    //     //             console.log(elem)
    //     //             obj = _This.checkAncestors(obj,element,sectionCount);
    //     //             return obj
    //     //         }
                    
                
    //     //         if(!ret && x.children.length>0)
    //     //             type(x)
    //     //     })  
    //     // };

    //     // return type(elem);

    //     return this.checkAncestors(obj,element);
    // }
    // public checkPreviousSibilings(Obj,elem,callback){
    //     if(elem.previousElementSibling != null || Array.from(elem.parentNode.children).indexOf(elem) != 0){
    //         let indexFrom = Array.from(elem.parentNode.children).indexOf(elem.previousElementSibling);
    //         for(var i=indexFrom; i>=0;i--){
    //             if(elem.parentNode.children[i].nodeName.toLowerCase() == 'header' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h1' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h2' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h3' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h4' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h5' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h6'){
    //                 if(i == 0){
    //                     Obj.isSibling = true;
    //                     let value = this.checkDescendants(Obj,elem.parentNode.children[i]);
    //                 }else{
    //                     Obj.startFromUniqID = elem.parentNode.children[i].getAttribute('uniqid');
    //                     Obj.elemType = elem.parentNode.children[i].nodeName.toLowerCase();
    //                     Obj.DOMelement = elem.parentNode.children[i];
    //                     Obj.isSibling = true;
    //                 }
    //             }else if(elem.parentNode.children[i].nodeName.toLowerCase() == 'p'){
    //                 if(elem.parentNode.children[i].innerHTML.length > 206){
    //                     Obj.startFromUniqID = elem.getAttribute('uniqid');
    //                     Obj.elemType = elem.nodeName.toLowerCase();
    //                     Obj.DOMelement = elem;
    //                 }else{
    //                     if(i == 0){
    //                         Obj.isSibling = true;
    //                         this.checkAncestors(Obj,elem.parentNode.children[i]);
    //                     }else{
    //                         if(elem.parentNode.children[i].previousElementSibling.nodeName.toLowerCase() == 'header'){
    //                             Obj.isSibling = true;
    //                             this.checkDescendants(Obj,elem.parentNode.children[i].previousElementSibling);
    //                         }else{
    //                             Obj.startFromUniqID = elem.getAttribute('uniqid');
    //                             Obj.elemType = elem.nodeName.toLowerCase();
    //                             Obj.DOMelement = elem;
    //                         }
    //                     }
    //                 }
    //             }else{
    //                 Obj.startFromUniqID = elem.getAttribute('uniqid');
    //                 Obj.elemType = elem.nodeName.toLowerCase();
    //                 Obj.DOMelement = elem;
    //             }

                
    //             if(Obj.startFromUniqID && Obj.elemType)
    //                 break;
    //         }
    //     }else{
    //         this.checkAncestors(Obj,elem)
    //     }

    //     if(callback)
    //         return Obj

    // }
    // /**paragraph structure */
    // public paragraphStructure(Obj,element,secheight,json,section,sectionCount,uniqid,saveSection_Id,returnLen){
    //     if(Math.round(secheight - element.offsetHeight) < 982){
    //         let page1_charaLen:any='';
    //         let page2_characLen:any='';
    //         secheight =  Math.round(secheight - element.offsetHeight);
    //         element.innerHTML = element.innerHTML.substring(0,0);
    //         let breakLoop:any= false;
    //         var _This = this;
    //         page1_charaLen=0;
    //         page2_characLen=0;
    //         let parent_json = json;
    //         let appendCharacter = function(json,element,newElement){
                
    //             if(newElement){
    //                 uniqid++;
    //                 json[0].isbelongTo = saveSection_Id;
    //                 json[0].uniqid = 'element_'+uniqid;
    //                 element.setAttribute('uniqId','element_'+uniqid);
    //                 for(var cakey in json[0]){
    //                     if(cakey!="offsetHeight" && cakey!="computedStyles"){                    
    //                         element.setAttribute(cakey,json[cakey]);
    //                         if(element.nodeName != 'SECTION' && element.nodeName != 'FIGURE' && element.nodeName != 'META' && element.nodeName != 'FIGCAPTION' && element.nodeName != 'IMG' && element.nodeName != 'LINK'){
    //                             // element.setAttribute('setfocus','setfocus_'+uniqid);
    //                             // element.setAttribute('id','setfocus_'+uniqid);
    //                         }
    //                     }
    //                 }
    //             }
    //             for(var k=1; k< json.length; k++){
    //                 let key = Object.keys(json[k]);

    //                 if(key[0] != "text"){
    //                     let elem_new  = document.createElement(key[0]);
    //                     element.appendChild(elem_new)
    //                     appendCharacter(json[k][key[0]],elem_new,true);
    //                 }else{
    //                     for(var i=0;i<json[k][key[0]].length;i++){
    //                         if(Math.round(section.getBoundingClientRect().height) >982) {

    //                             if(!newElement){
    //                                 let str = element.innerHTML;
    //                                 let lastIndex = str.lastIndexOf(" ") <0?0:str.lastIndexOf(" ");
    //                                 element.innerHTML ='';
    //                                 element.innerHTML = str.substring(0,lastIndex);
    //                             }

    //                             let cropped_objLength='';
    //                             cropped_objLength = json[k][key[0]].substring(0,i);
    //                             Obj.startFromUniqID  = element.getAttribute('uniqid');  /**setting  return obj value*/
    //                             Obj.paraStartFrom = cropped_objLength.lastIndexOf(" ")<0?0:cropped_objLength.lastIndexOf(" ");
    //                             if(returnLen)
    //                                 return;


    //                             Obj.elemType = element.nodeName.toLowerCase();
    //                             page2_characLen = _This.checkParaRemainingLength(parent_json,Obj.startFromUniqID,Obj.paraStartFrom,section,k)
    //                             if(((page1_charaLen < 309) || (page2_characLen < 206))){
    //                                 Obj.paraStartFrom = 0;
    //                                 while(element){
    //                                     if(element.nodeName.toLowerCase() == 'p')
    //                                         break;
                                        
    //                                         element = element.parentNode;
    //                                 }
    //                                 let copy_elem = element;
    //                                 _This.checkPreviousSibilings(Obj,copy_elem,false);
    //                             }else{
    //                                 Obj.DOMelement='';
    //                                 element.setAttribute('class','para_decorator')
    //                             }
    //                             breakLoop = true
    //                             break;
    //                         }else if(((i == Math.round(json[k][key[0]].length-1)) &&  Math.round(section.getBoundingClientRect().height) <=982)){
    //                             Obj.elemType = element.nodeName.toLowerCase()+'_dontRemove';
    //                             Obj.DOMelement = element;
    //                         }
    //                         page1_charaLen++;
    //                         element.innerHTML += json[k][key[0]][i]
    //                     }
    //                 }
                        
    //                 if(breakLoop){
    //                     break;  
    //                 }
                    
    //             }
    //         }
            
    //         appendCharacter(json,element,false)
            
    //     }else{
    //         while(element){
    //             if(element.parentNode.childElementCount > 1 || element.parentNode.id=='section_'+sectionCount)
    //                 break;
                
    //                 element = element.parentNode;
    //         }
    //         Obj.startFromUniqID  = element.getAttribute('uniqid');  /**setting  return obj value*/
    //         Obj.paraStartFrom = 0;
    //         Obj.elemType = element.nodeName.toLowerCase();
    //         element.parentNode.removeChild(element);
    //     }
    //     return Obj
    // }
    // /**function to check next page paragraph line height */
    // public checkParaRemainingLength(json,startFromId,startFromLength,section,Kvalue){
    //     let len:number=0;
    //     let _This = this;
    //     let dummy_Element= document.createElement('div')
    //     dummy_Element.setAttribute('class','dummyElement')
    //     section.appendChild(dummy_Element);
    //     let Boolean_created:boolean=false;
    //     let createElement = function(dummy_Element,json,startFromId,startFromLength,Boolean_created,kValue,createNew){
    //         let elem_new:any='';
    //         if(createNew){
    //             elem_new  = document.createElement(createNew);
    //             dummy_Element.appendChild(elem_new)
    //         }
    //         let K:number = kValue !=''? kValue:1;
    //         for(var k=K; k< json.length; k++){
    //             let key = Object.keys(json[k]);
    //             if(key[0] != "text"){
    //                 elem_new = elem_new == ''?dummy_Element:elem_new;
    //                 if(json[k][key[0]][0].uniqid == startFromId || Boolean_created){
    //                     createElement(elem_new,json[k][key[0]],startFromId,startFromLength,true,'',key[0]);
    //                 }else{
    //                     createElement(elem_new,json[k][key[0]],startFromId,startFromLength,Boolean_created,'','');
    //                 }
    //             }else{
    //                 if(Boolean_created){
    //                     for(var i=startFromLength;i<json[k][key[0]].length;i++){
    //                         if(elem_new == ''){
    //                             len++;
    //                             dummy_Element.innerHTML += json[k][key[0]][i]
    //                         }else{
    //                             len = elem_new.nodeName.toLowerCase() == 'img'?elem_new.offsetheight():len++;
    //                             elem_new.innerHTML += json[k][key[0]][i]
    //                         }
    //                     }
    //                     startFromLength = len > 1?0:startFromLength;
    //                 }
    //             }
    //         }
    //     }
    //     Boolean_created = json[0]['attributes'][0].uniqid == startFromId?true:Boolean_created;
    //     Kvalue = Boolean_created?Kvalue:'';
    //     createElement(dummy_Element,json,startFromId,startFromLength,Boolean_created,Kvalue,'');
    //     section.removeChild(dummy_Element);
    //     return len;
    // }
    // /**function to restructure page elements */
    // public pageBreakInside(Obj,element,childjson){
    //     while(element){
    //         if(element.nodeName.toLowerCase() == 'aside' || element.nodeName.toLowerCase() == 'section')
    //             break;

    //         element = element.parentNode;

    //     }
    //     Obj.startFromUniqID = element.getAttribute('uniqid');
    //     //Obj.traverseCount = 0;
    // }
    // /**function to get index of li*/
    // public checkListArray(elem,sectionCount,obj){
    //     let Arr:any=[];

    //     while(elem){
    //         if(elem.nodeName.toLowerCase() == 'li'){
    //             Arr.push(Math.round((Array.from(elem.parentNode.children).indexOf(elem))+1))
    //         }else if(elem.parentNode.id=='section_'+sectionCount){
    //             break;
    //         }

    //         elem = elem.parentNode
    //     }
    //     return Arr;
    // }
    // /** ul/ol li structure function*/
    // public listStructure(Obj,elem,isCheck,sectionCount,childjson){
        

    //     if(isCheck){
    //         let lisArrCount:any=[];
    //         _.each(childjson,(x)=>{
    //             if(x.hasOwnProperty('li'))
    //                 lisArrCount.push(x.hasOwnProperty('li'))
    //         })
    //         if(lisArrCount.length > 2){
    //             // while(elem){
    //             //     if(elem.nodeName.toLowerCase() == 'li' || elem.nodeName.toLowerCase() == 'ol' || elem.nodeName.toLowerCase() == 'ul')
    //             //         break;
                    
    //             //     elem = elem.parentNode
    //             // }
                
    //             Obj.startFromUniqID = elem.lastElementChild.getAttribute('uniqid');
    //         }else{

    //             while(elem){
    //                 if(elem.nodeName.toLowerCase() == 'ul' || elem.nodeName.toLowerCase() == 'ol')
    //                     break;

    //                 Obj.traverseCount++;
    //                 elem = elem.parentNode;
    //             }
    //             Obj.startFromUniqID = elem.children.length>0?elem.children[0].getAttribute('uniqid'):elem.getAttribute('uniqid');
    //         }   
    //         Obj.DOMelement = elem.lastElementChild;      
    //     }else{
    //         let count=0;
    //         while(elem){
    //             if(elem.nodeName.toLowerCase() == 'ul' || elem.nodeName.toLowerCase() == 'ol'){
    //                 elem.setAttribute('start',Obj.LIstartValue[count])
    //                 count++
    //             }else if(elem.parentNode.id=='section_'+sectionCount){
    //                 Obj.LIstartValue=[];
    //                 break;
    //             }
    //             elem = elem.parentNode
    //         }
    //     }
    //     if(isCheck)
    //         return Obj;

    // }
    // /**function to check position of element in table */
    // public getElementInTable(obj,childjson,currentIndex){
    //     let ArrayOfObject:any=[];
    //     let tableTrIndex:any=[];
    //     _.each(childjson,(x,count_1)=>{
    //         if(x.hasOwnProperty('TR') && count_1 != currentIndex){
    //             tableTrIndex.push(count_1)   
    //             ArrayOfObject.push({'state':false ,'obj':x})
    //         }else if(x.hasOwnProperty('TR') && count_1 == currentIndex){
    //             ArrayOfObject.push({'state':true ,'obj':x})
    //             tableTrIndex.push(count_1)   
    //         } 
    //     })
    //     if(ArrayOfObject.length<=0){
    //         obj.firstThreeRows =true;
    //         obj.lastThreeRows =false;
    //         obj.inBetween =false;
    //         obj.removeTill ='';
    //     }
    //     else{
    //         _.each(ArrayOfObject,(x,count)=>{
    //         if(x.state == true) {

    //             if(ArrayOfObject.length > 6){
    //                 switch(count){
    //                         case 0:
    //                         case 1:
    //                         case 2:
    //                             obj.firstThreeRows =true;
    //                             obj.lastThreeRows =false;
    //                             obj.inBetween =false;
    //                             obj.removeTill ='';
    //                         break;
    //                         case (Math.round(ArrayOfObject.length-1)):
    //                         case (Math.round(ArrayOfObject.length-2)):
    //                         case (Math.round(ArrayOfObject.length-3)):
    //                             obj.firstThreeRows =false;
    //                             obj.lastThreeRows =true;
    //                             obj.inBetween = false;
    //                             obj.removeTill = Math.round(ArrayOfObject.length-3);
    //                             obj.objStartFrom = tableTrIndex[Math.round(tableTrIndex.length-3)]
    //                         break;
    //                         default:
    //                             obj.firstThreeRows =false;
    //                             obj.lastThreeRows =false;
    //                             obj.inBetween =true;
    //                             obj.removeTill ='';
    //                             break;
    //                     }
    //                 }else{
    //                     obj.firstThreeRows =true;
    //                     obj.lastThreeRows =false;
    //                     obj.inBetween = false;
    //                 }
    //         }
    //         })
    //     }
    //     return obj;
    // }
    // /** function to restructure table */
    // public formatTableStructure(Obj,element,table_rowCondition,rowElement){
    //     if(table_rowCondition.firstThreeRows){
    //         Obj.startFromUniqID = element.getAttribute('uniqid');
    //         Obj.DOMelement = element;
    //     }else if(table_rowCondition.lastThreeRows){
            
    //         while(element){
    //             if(element.children.length == table_rowCondition.removeTill)
    //                 break;
                
    //             Obj.startFromUniqID = element.lastElementChild.getAttribute('uniqid');
    //             Obj.DOMelement = element.lastElementChild;
    //             element.lastElementChild.remove()
    //         }
    //     }else if(table_rowCondition.inBetween){
    //         Obj.startFromUniqID = rowElement.getAttribute('uniqid');
    //         Obj.DOMelement = rowElement;
    //     }

    //     return Obj;
    // }
}