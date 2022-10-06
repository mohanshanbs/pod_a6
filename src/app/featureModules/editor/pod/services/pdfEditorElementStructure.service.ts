import { Injectable } from "@angular/core";
import { _ } from 'underscore';
import { analyzeAndValidateNgModules } from "@angular/compiler";
// import { element } from "@angular/core/src/render3/instructions";
import { resolve } from "url";
import { asTextData } from "@angular/core/src/view";
import {Subject} from 'rxjs';
import {pdfEditorModel} from '../pdfEditor.model';

@Injectable({providedIn:'root'})

export class pdfEditorElementStruture{
    public subjecElement = new Subject<pdfEditorModel>();
    public Publish(){
      return this.subjecElement.asObservable();
    }
    
    public publish:any=[];

    public case_table:any=['table','tbody','tr','td'];
    public case_list:any=['']

    // var elem_array:pdfEditorModel={
    //     startFromUniqID:any,
    //     elemType:any,
    //     DOMelement:any,
    //     paraStartFrom:any,
    //     LIstartValue:any,
    //     table:{
    //         firstThreeRows:boolean,
    //         lastThreeRows:boolean,
    //         inBetween:boolean,
    //         removeTill:any,
    //         objStartFrom:any
    //     },
    //     siblingCounts:any
    // }

    public elem_obj:any={
        startFromUniqID:'',
        elemType:'',
        DOMelement:'',
        paraStartFrom:'',
        LIstartValue:'',
        traverseCount:'',
        isSibling:false,
        objKey:'',
    }
    /**resetting the object */
    public resetObj(Obj){
        Obj.startFromUniqID ='';
        Obj.elemType=''
        Obj.DOMelement=''
        Obj.paraStartFrom=''
        Obj.LIstartValue=''
        Obj.traverseCount=0;
        Obj.isSibling=false;
        Obj.objKey='';
        Obj.breakCondition=false;
        Obj.tableObj={
            firstThreeRows:'',
            lastThreeRows:'',
            inBetween:'',
            removeTill:'',
            objStartFrom:''
        }
        this.breakLoop = false;

        return Obj
    }
    public header_Array:any=[];
    /**function to check what type of element under condition */
    public checkElementBreakCondition(elem,secheight,json,sectionArray,sectionCount){
        // let elem_value:any=[];
        // let returnVal:any='';
        // let value:any='';
        this.publish =[];
        let _This = this;
        let test:any= '';
        let setFunction = function(type,element){
            _This.publish.push({startFromUniqID:element.getAttribute('uniqid'),elemType:type,siblingCounts:element.parentNode.children.length,DOMelement:element,breakCondition:false});
            
            return true
        }
        do{
            switch (elem.nodeName.toLowerCase()){
                case 'ol':
                case 'ul':
                case 'li':
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
        }while(elem.parentNode.id!='section_'+sectionCount)

        this.publish.push({startFromUniqID:elem.getAttribute('uniqid'),elemType:'firstIndex',siblingCounts:Math.round(elem.parentNode.children.length - 1),breakCondition:false});
        this.subjecElement.next(this.checkElementCondition(this.publish,sectionCount,true))

        // while(elem){
        //     if(elem.parentNode.id=='section_'+sectionCount){
        //         this.publish.push({startFromUniqID:elem.getAttribute('uniqid'),elemType:'firstIndex',siblingCounts:Math.round(elem.parentNode.children.length - 1),breakCondition:false});
        //         // this.publish.elemType='firstIndex';
        //         // this.publish.siblingCounts=Math.round(elem.parentNode.children.length - 1);
        //         // this.publish.DOMelement = elem;
        //         break;
        //     }
            
            
            
        //     switch (elem.nodeName.toLowerCase()){
        //         case 'ol':
        //         case 'ul':
        //         case 'li':
        //             setFunction('list',elem)
        //             // elem_value.push({type:'list',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             // elem_value.push({type:'list',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'list'
        //             break;
        //         case 'tr':
        //         setFunction('tr',elem)
        //             // elem_value.push({type:'tr',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'tr'
        //             // break;
        //         // case 'tbody':
        //         // setFunction('list',elem)
        //             // elem_value.push({type:'tbody',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'tbody'
        //             break;
        //         case 'table':
        //         case 'tbody':
        //         setFunction('table',elem)
        //             // elem_value.push({type:'table',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'table'
        //             break;
        //         case 'p':
        //         setFunction('paragraph',elem)
        //             // elem_value.push({type:'paragraph',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value ='paragraph';
        //             break;
        //         case 'header':
        //         setFunction('header',elem)
        //             // elem_value.push({type:'header',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'header';
        //             break;
        //         case 'h1':
        //         case 'h2':
        //         case 'h3':
        //         case 'h4':
        //         case 'h5':
        //         case 'h6':
        //         setFunction('header',elem)
        //             // elem_value.push({type:'header',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'headingElement';
        //             break;
        //         case 'figure':
        //         setFunction('figure',elem)
        //             // elem_value.push({type:'figure',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'figure'
        //             break;
        //         case 'aside':
        //         setFunction('aside',elem)
        //             // elem_value.push({type:'aside',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'aside'
        //             break;
        //         case 'section':
        //         setFunction('section',elem)
        //             // elem_value.push({type:'section',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'section'
        //             break;
        //         case 'blockquote':
        //         setFunction('pagebreakInside',elem)
        //             // elem_value.push({type:'pagebreakInside',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'pagebreakInside'
        //             break;
        //         default:
        //             setFunction('default',elem)
        //             // elem_value.push({type:'default',siblingCount:elem.parentNode.children.length,nodeName:elem.nodeName,element:elem});
        //             //value = 'pagebreakInside'
        //             break;
        //     }
        //     // if(value.length>0 && value != 'headingElement')
        //     //      break;
            
            
        //     elem = elem.parentNode;
        // }
        //return  value
        
        // this.subjecElement.next(this.checkElementCondition(this.publish,sectionCount,true))
        // return  returnVal = this.checkElementCondition(elem_value,true)
    }
    public checkElementCondition(array,sectionCount,callback){
        let value:any='';
        _.each(array,(x,count)=>{
            if(value)
                return;

            switch(x.elemType){
                case 'table':
                    this.elem_obj.traverseCount++;
                    value = x;
                    break;
                case 'tr':
                case 'td':
                    this.elem_obj.traverseCount++;
                    value = x;
                break;
                case 'list':
                    this.elem_obj.traverseCount++;
                    value = x;
                break;
                case 'figure':
                    this.elem_obj.traverseCount++;
                    value = x;
                break;
                default:
                    if(value)
                        break;
                            // if(x.siblingCount > 1){
                            //     this.elem_obj.traverseCount++;
                            //     value = x;
                            //     break;
                            // }


                this.elem_obj.traverseCount++;
                break;
            }
        })
        this.elem_obj.traverseCount = value == ''?0:this.elem_obj.traverseCount;
        // value = value == ''?array.find((x)=>{ return x.elemType != 'default'}):value;
        value = value == ''?array.find((x)=>{ return x.siblingCounts > 1 }):value;

        
        if(value == undefined || value.elemType=='firstIndex')
            value = array[0]
            
        let copy_arr = [...array]
        let setDonRemove:any=false;
        copy_arr.splice(0,array.indexOf(value))
        setDonRemove = copy_arr.every((x)=>{
            return x.siblingCounts < 2
        })
        if(setDonRemove){
            let set = array[0].elemType+'_dontRemove';
            array[0].elemType ='';
            array[0].elemType = set;
            value = array[0]
        }
        
        
        if(callback){
            if(value.elemType.split('_')[1] == 'dontRemove')
                return value ;
            else
                return value = value.siblingCounts > 1 ? this.checkPreviousSibilings(value,value.DOMelement,sectionCount,true):this.checkAncestors(value,value.DOMelement,sectionCount);
        }
    }


    
    /** function to check ancestor */
    public checkAncestors(Obj,element,sectionCount){
        let elem = element;
        let default_value:any= false;
        //Obj.traverseCount=0;
        while(elem){
            switch (elem.parentNode.nodeName.toLowerCase()){
                case 'p':
                    if(elem.innerHTML.length > 206){
                        Obj.startFromUniqID = elem.getAttribute('uniqid');
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.isSibling = false;
                    }else{
                        Obj.startFromUniqID = elem.getAttribute('uniqid')
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.DOMelement = elem;
                        Obj.breakCondition = true;
                    }
                    break;
                case 'h1':
                case 'header':
                    Obj.traverseCount++;
                    Obj.isSibling = false;
                    Obj = this.checkPreviousSibilings(Obj,elem.parentNode,sectionCount,true);
                    // Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid');
                    // Obj.elemType = elem.parentNode.nodeName.toLowerCase();
                    // Obj.DOMelement = elem.parentNode;
                    break;
                case 'section':
                case 'aside':
                    Obj.traverseCount++;
                    Obj.isSibling = false;
                    Obj = this.checkPreviousSibilings(Obj,elem.parentNode,sectionCount,true);
                    // Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid');
                    // Obj.elemType = elem.parentNode.nodeName.toLowerCase();
                    // Obj.DOMelement = elem.parentNode;
                    break;
                case 'blockquote':
                    Obj.startFromUniqID = elem.getAttribute('uniqid')
                    Obj.elemType = elem.nodeName.toLowerCase();
                    Obj.DOMelement = elem;
                    Obj.isSibling = false;
                    break;
                case 'table':
                case 'thead':
                case 'tbody':
                case 'tr':
                    Obj.startFromUniqID = elem.getAttribute('uniqid')
                    Obj.elemType = elem.nodeName.toLowerCase();
                    Obj.DOMelement = elem;
                    Obj.isSibling = false;
                    Obj.breakCondition = true;
                    break;
                case 'td':
                    Obj.startFromUniqID = elem.getAttribute('uniqid')
                    Obj.elemType = elem.nodeName.toLowerCase();
                    Obj.DOMelement = elem;
                    Obj.breakCondition = false;
                    Obj.isSibling = false;
                    break;
                case 'li':
                    Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
                    Obj.elemType = elem.parentNode.nodeName.toLowerCase();
                    Obj.DOMelement = elem.parentNode;
                    Obj.breakCondition = true;
                    Obj.isSibling = false;
                    break;
                default:
                    if(elem.nodeName.toLowerCase() == 'header'){
                        Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
                        Obj.elemType = 'default';
                        Obj.DOMelement = elem.parentNode;
                        Obj.breakCondition = true;
                        Obj.isSibling = false;
                    break;   
                    }else{
                        Obj.startFromUniqID = elem.getAttribute('uniqid')
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.DOMelement = elem;
                        Obj.breakCondition = true;
                        break;
                    }
                    
            }
            if((Obj.elemType) && (Obj.breakCondition))
                break;

            if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='aside' ))
                break;

            if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='section') && (Obj.DOMelement.parentNode.nodeName.toLowerCase() == 'aside')){
                if(Obj.DOMelement.previousElementSibling == null){
                    Obj.traverseCount++;
                    Obj.startFromUniqID = Obj.DOMelement.parentNode.getAttribute('uniqid');
                    Obj.elemType = Obj.DOMelement.parentNode.nodeName.toLowerCase();
                    Obj.DOMelement = Obj.DOMelement.parentNode;
                    break;
                }else{
                    break;
                }
            }else if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='section') && (Obj.DOMelement.parentNode.nodeName.toLowerCase() != 'aside')){
                break;
            }

            elem = elem.parentNode;
        }

        return Obj;
    }
    public checkDescendants(obj,element,sectionCount){
        let elem = element
        // var _This = this;
        // let ret:boolean=false;
        // let type = function(elem){
        //     let curr_elem = elem.children.length>0?Array.from(elem.children):'';
        //     if(!curr_elem)
        //         return;

            
        //     _.each(curr_elem,(x,count_1)=>{
        //         if(x.nodeName.toLowerCase() == 'h1' || x.nodeName.toLowerCase() == 'h2' || x.nodeName.toLowerCase() == 'h3' || x.nodeName.toLowerCase() == 'h4' || x.nodeName.toLowerCase() == 'h5' || x.nodeName.toLowerCase() == 'h6'){

        //             _This.header_Array = x.nodeName;
        //             ret = true;
        //             console.log(elem)
        //             obj = _This.checkAncestors(obj,element,sectionCount);
        //             return obj
        //         }
                    
                
        //         if(!ret && x.children.length>0)
        //             type(x)
        //     })  
        // };

        // return type(elem);

        return this.checkAncestors(obj,element,sectionCount);
    }
    public checkPreviousSibilings(Obj,elem,sectionCount,callback){
        if(elem.previousElementSibling != null || Array.from(elem.parentNode.children).indexOf(elem) != 0){
            let indexFrom = Array.from(elem.parentNode.children).indexOf(elem.previousElementSibling);
            for(var i=indexFrom; i>=0;i--){
                //console.log(elem.parentNode.children[i].nodeName);
                if(elem.parentNode.children[i].nodeName.toLowerCase() == 'header' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h1' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h2' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h3' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h4' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h5' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h6'){
                    if(i == 0){
                        Obj.isSibling = true;
                        let value = this.checkDescendants(Obj,elem.parentNode.children[i],sectionCount);
                    }else{
                        Obj.startFromUniqID = elem.parentNode.children[i].getAttribute('uniqid');
                        Obj.elemType = elem.parentNode.children[i].nodeName.toLowerCase();
                        Obj.DOMelement = elem.parentNode.children[i];
                        Obj.isSibling = true;
                    }
                //}else if((i == indexFrom) && elem.parentNode.children[i].nodeName.toLowerCase() == 'p'){
                }else if(elem.parentNode.children[i].nodeName.toLowerCase() == 'p'){
                    if(elem.parentNode.children[i].innerHTML.length > 206){
                        Obj.startFromUniqID = elem.getAttribute('uniqid');
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.DOMelement = elem;
                        //Obj.traverseCount = 0;
                    }else{
                        if(i == 0){
                            Obj.isSibling = true;
                            this.checkAncestors(Obj,elem.parentNode.children[i],sectionCount);
                        }else{
                            if(elem.parentNode.children[i].previousElementSibling.nodeName.toLowerCase() == 'header'){
                                Obj.isSibling = true;
                                this.checkDescendants(Obj,elem.parentNode.children[i].previousElementSibling,sectionCount);
                            }else{
                                Obj.startFromUniqID = elem.getAttribute('uniqid');
                                Obj.elemType = elem.nodeName.toLowerCase();
                                Obj.DOMelement = elem;
                                // Obj.isSibling = true;
                            }

                            // Obj.startFromUniqID = elem.parentNode.children[i].getAttribute('uniqid');
                            // Obj.elemType = elem.parentNode.children[i].nodeName.toLowerCase();
                            // Obj.DOMelement = elem.parentNode.children[i];
                            // Obj.objKey = Math.round(Array.from(elem.parentNode.childNodes).indexOf(elem.parentNode.children[i])+1)
                        }
                    }
                }else{
                    Obj.startFromUniqID = elem.getAttribute('uniqid');
                    Obj.elemType = elem.nodeName.toLowerCase();
                    Obj.DOMelement = elem;
                    //Obj.traverseCount = 0;
                }

                
                if(Obj.startFromUniqID && Obj.elemType)
                    break;
            }
        }else{
            this.checkAncestors(Obj,elem,sectionCount)
        }

        if(callback)
            return Obj

    }

    /**paragraph structure */
    public paragraphStructure(Obj,element,secheight,json,indx,sectionArray,sectionCount,charAtLen,unidIdCount,saveSection_Id,returnLen){
        if(Math.round(secheight - element.offsetHeight) < (parseInt((localStorage.getItem('pagesize')).split(',')[1])*96)){
            let page1_charaLen:any='';
            let page2_characLen:any='';
            secheight =  Math.round(secheight - element.offsetHeight);
            //element.innerHTML = element.innerHTML.substring(0,element.innerHTML.lastIndexOf(json[indx]));
            element.innerHTML = element.innerHTML.substring(0,0);
            let breakLoop:any= false;
            var _This = this;
            page1_charaLen=0;
            page2_characLen=0;
            let parent_json = json;
            let appendCharacter = function(json,element,newElement){
                
                if(newElement){
                    unidIdCount++;
                    json[0].isbelongto = saveSection_Id;
                    json[0].unidIdCount = 'element_'+unidIdCount;
                    element.setAttribute('uniqId','element_'+unidIdCount);
                    for(var cakey in json[0]){
                        if(cakey!="offsetHeight" && cakey!="computedStyles"){                       
                            element.setAttribute(cakey,json[cakey]);
                            if(element.nodeName != 'SECTION' && element.nodeName != 'FIGURE' && element.nodeName != 'META' && element.nodeName != 'FIGCAPTION' && element.nodeName != 'IMG' && element.nodeName != 'LINK'){
                                element.setAttribute('setfocus','setfocus_'+unidIdCount);
                                element.setAttribute('id','setfocus_'+unidIdCount);
                            }
                        }
                    }
                }
                for(var k=1; k< json.length; k++){
                    let key = Object.keys(json[k]);

                    // Obj.objKey = k;

                    if(key[0] != "#text"){
                        let elem_new  = document.createElement(key[0]);
                        element.appendChild(elem_new)
                        appendCharacter(json[k][key[0]],elem_new,true);
                    }else{
                        for(var i=0;i<json[k][key[0]].length;i++){
                            if(Math.round(sectionArray[sectionCount].getBoundingClientRect().height) > (parseInt((localStorage.getItem('pagesize')).split(',')[1])*96)) {

                                if(!newElement){
                                    let str = element.innerHTML;
                                    let lastIndex = str.lastIndexOf(" ") <0?0:str.lastIndexOf(" ");
                                    element.innerHTML ='';
                                    element.innerHTML = str.substring(0,lastIndex);
                                }

                                let cropped_objLength='';
                                cropped_objLength = json[k][key[0]].substring(0,i);
                                Obj.startFromUniqID  = element.getAttribute('uniqid');  /**setting  return obj value*/
                                Obj.paraStartFrom = cropped_objLength.lastIndexOf(" ")<0?0:cropped_objLength.lastIndexOf(" ");
                                if(returnLen)
                                    return;


                                Obj.elemType = element.nodeName.toLowerCase();
                                page2_characLen = _This.checkParaRemainingLength(parent_json,Obj.startFromUniqID,Obj.paraStartFrom,sectionArray,sectionCount,k)
                                if(((page1_charaLen < 309) || (page2_characLen < 206))){
                                    Obj.paraStartFrom = 0;
                                    while(element){
                                        if(element.nodeName.toLowerCase() == 'p')
                                            break;
                                        
                                            element = element.parentNode;
                                    }
                                    let copy_elem = element;
                                    _This.checkPreviousSibilings(Obj,copy_elem,sectionCount,false);
                                }else{
                                    Obj.DOMelement='';
                                    element.setAttribute('class','para_decorator')
                                }
                                breakLoop = true
                                break;
                            }else if(((i == Math.round(json[k][key[0]].length-1)) &&  Math.round(sectionArray[sectionCount].getBoundingClientRect().height) <= (parseInt((localStorage.getItem('pagesize')).split(',')[1])*96))){
                                Obj.elemType = element.nodeName.toLowerCase()+'_dontRemove';
                                Obj.DOMelement = element;
                            }
                            page1_charaLen++;
                            element.innerHTML += json[k][key[0]][i]
                        }
                    }
                        
                    if(breakLoop){
                        break;  
                    }
                    
                }
            }
            
            appendCharacter(json,element,false)
            
        }else{
            while(element){
                if(element.parentNode.childElementCount > 1 || element.parentNode.id=='section_'+sectionCount)
                    break;
                
                    element = element.parentNode;
            }
            Obj.startFromUniqID  = element.getAttribute('uniqid');  /**setting  return obj value*/
            Obj.paraStartFrom = 0;
            Obj.elemType = element.nodeName.toLowerCase();
            element.parentNode.removeChild(element);
        }
        //return obj;
        return Obj
    }
    public checkElementCharacterLength(element){
        
    }
    /**function to check next page paragraph line height */
    public checkParaRemainingLength(json,startFromId,startFromLength,sectionArray,sectionCount,Kvalue){
        let len:number=0;
        let _This = this;
        let dummy_Element= document.createElement('div')
        dummy_Element.setAttribute('class','dummyElement')
        sectionArray[sectionCount].appendChild(dummy_Element);
        let Boolean_created:boolean=false;
        let createElement = function(dummy_Element,json,startFromId,startFromLength,Boolean_created,kValue,createNew){
            let elem_new:any='';
            if(createNew){
                elem_new  = document.createElement(createNew);
                dummy_Element.appendChild(elem_new)
            }
            let K:number = kValue !=''? kValue:1;
            for(var k=K; k< json.length; k++){
                let key = Object.keys(json[k]);
                if(key[0] != "#text"){
                    elem_new = elem_new == ''?dummy_Element:elem_new;
                    if(json[k][key[0]][0].unidIdCount == startFromId || Boolean_created){
                        createElement(elem_new,json[k][key[0]],startFromId,startFromLength,true,'',key[0]);
                    }else{
                        createElement(elem_new,json[k][key[0]],startFromId,startFromLength,Boolean_created,'','');
                    }
                }else{
                    if(Boolean_created){
                        for(var i=startFromLength;i<json[k][key[0]].length;i++){
                            if(elem_new == ''){
                                len++;
                                dummy_Element.innerHTML += json[k][key[0]][i]
                            }else{
                                len = elem_new.nodeName.toLowerCase() == 'img'?elem_new.offsetheight():len++;
                                elem_new.innerHTML += json[k][key[0]][i]
                            }
                        }
                        startFromLength = len > 1?0:startFromLength;
                    }
                }
            }
        }
        Boolean_created = json[0].unidIdCount == startFromId?true:Boolean_created;
        Kvalue = Boolean_created?Kvalue:'';
        createElement(dummy_Element,json,startFromId,startFromLength,Boolean_created,Kvalue,'');
        sectionArray[sectionCount].removeChild(dummy_Element);
        return len;
    }

    /**function to get index of li*/
    public checkListArray(elem,sectionCount,obj){
        let Arr:any=[];

        while(elem){
            if(elem.nodeName.toLowerCase() == 'li'){
                Arr.push(Math.round((Array.from(elem.parentNode.children).indexOf(elem))+1))
            }else if(elem.parentNode.id=='section_'+sectionCount){
                break;
            }

            elem = elem.parentNode
        }
        return Arr;
    }
    /** ul/ol li structure function*/
    public listStructure(Obj,elem,isCheck,sectionCount,childjson,pkey){
        

        if(isCheck){
            let lisArrCount:any=[];
            _.each(childjson,(x)=>{
                if(x.hasOwnProperty('LI'))
                    lisArrCount.push(x.hasOwnProperty('LI'))
            })
            if(lisArrCount.length > 2){
                while(elem){
                    if(elem.nodeName.toLowerCase() == 'li' || elem.nodeName.toLowerCase() == 'ol' || elem.nodeName.toLowerCase() == 'ul')
                        break;
                    
                    elem = elem.parentNode
                }
                Obj.startFromUniqID = elem.getAttribute('uniqid');
            }else{

                while(elem){
                    if(elem.nodeName.toLowerCase() == 'ul' || elem.nodeName.toLowerCase() == 'ol')
                        break;

                    Obj.traverseCount++;
                    elem = elem.parentNode;
                }
                Obj.startFromUniqID = elem.children.length>0?elem.children[0].getAttribute('uniqid'):elem.getAttribute('uniqid');
            }   
            Obj.DOMelement = elem;      
        }else{
            let count=0;
            while(elem){
                if(elem.nodeName.toLowerCase() == 'ul' || elem.nodeName.toLowerCase() == 'ol'){
                    elem.setAttribute('start',Obj.LIstartValue[count])
                    count++
                }else if(elem.parentNode.id=='section_'+sectionCount){
                    Obj.LIstartValue=[];
                    break;
                }
                elem = elem.parentNode
            }
        }
        if(isCheck)
            return Obj;

    }
    /**function to restructure page elements */
    public pageBreakInside(Obj,element,childjson){
        while(element){
            if(element.nodeName.toLowerCase() == 'aside' || element.nodeName.toLowerCase() == 'section')
                break;

            element = element.parentNode;

        }
        Obj.startFromUniqID = element.getAttribute('uniqid');
        //Obj.traverseCount = 0;

    }
    
    public removeElement(Obj,element,childjson,sectionCount,fromIndex,tillIndex){
        while(element){
            if(element.parentNode.childElementCount > 1 || element.parentNode.id=='section_'+sectionCount)
                break;
            
                element = element.parentNode;
        }
        // let indx = Array.from(element.parentNode.children).indexOf(element);
        // let parentNode = element.parentNode;
        // do{
        //     parentNode.lastElementChild.remove()
        //     // element.parentNode.removeChild(element);
        // }
        // while(parentNode.children.length > indx)
        
        // if(element)
        //     element.parentNode.remove(Array.from(element.parentNode.children).indexOf(element),element.parentNode.children.length);

        if(element)
            element.parentNode.removeChild(element);

        let key = Object.keys(childjson);
        this.breakLoop= false;
        this.resetLoop(Obj,childjson[key[0]],false,fromIndex,tillIndex,false);
    }
    public breakLoop:boolean=false;
    /**function to reset object (isbelongto,istartappend) */
    public resetLoop(Obj,childjson,setStartAppend,fromIndex,tillIndex,checkExistOrNot){
        childjson[0].isbelongto = !checkExistOrNot?'':childjson[0].isbelongto; 
        let len = tillIndex?tillIndex:childjson.length;

        if(len<=1 && !checkExistOrNot)
            childjson[0].isbelongto = ''; 

        for(var i=fromIndex?fromIndex:1; i< len; i++){
            if(this.breakLoop)
                return i;

                
            let key1 = Object.keys(childjson);
            if(childjson[key1[i]].hasOwnProperty('#text')){
                if(childjson[key1[0]].unidIdCount == Obj.startFromUniqID || setStartAppend){
                    if(checkExistOrNot){
                        this.breakLoop = true;
                    }else{
                        // Obj.startFromUniqID = childjson[key1[0]].unidIdCount;
                        childjson[key1[0]].isStartAppend = true;
                        setStartAppend = false;
                    }
                }
                childjson[key1[0]].isbelongto = !checkExistOrNot?'':childjson[key1[0]].isbelongto; 
            }else{
                setStartAppend = childjson[key1[0]].unidIdCount == Obj.startFromUniqID?true:false;
                if(childjson[key1[0]].unidIdCount == Obj.startFromUniqID && checkExistOrNot)
                        this.breakLoop = true;

                let key2 = Object.keys(childjson[i]);
                this.resetLoop(Obj,childjson[i][key2[0]],setStartAppend,'','',checkExistOrNot)
            }
        }
        if(checkExistOrNot && this.breakLoop)
            return i;
    }
    /** function to reset and set New object (isbelongto,istartappend)*/
    public SetStartValue(Obj,childjson,setStartAppend,fromIndex,tillIndex,unidIdCount,currentExecution){
        let breakLoop:boolean=false;
        childjson[0].isbelongto = ''; 
        let len = tillIndex?tillIndex:childjson.length;
        if(len<=1)
            childjson[0].isbelongto = ''; 

        for(var i=fromIndex?fromIndex:1; i< len; i++){
            if(breakLoop)
                break

            let key1 = Object.keys(childjson);
            if(childjson[key1[i]].hasOwnProperty('#text')){
                if(childjson[key1[i]]['#text'].trim() != ""){
                    if(!currentExecution){
                        unidIdCount++;
                    }
                    childjson[key1[0]].unidIdCount = 'element_'+unidIdCount
                    childjson[key1[0]].isbelongto = ''; 
                    // Obj.elemType = key1[i].toLowerCase();
                    Obj.startFromUniqID = 'element_'+unidIdCount;
                    breakLoop = true;
                }
            }else{
                let key2 = Object.keys(childjson[i]);
                this.SetStartValue(Obj,childjson[i][key2[0]],setStartAppend,'','',unidIdCount,currentExecution)
            }
        } 
        return Obj
    }



    /**function to check position of element in table */
    public getElementInTable(obj,childjson,currentIndex){
        let ArrayOfObject:any=[];
        
        let tableTrIndex:any=[];
        _.each(childjson,(x,count_1)=>{
            if(x.hasOwnProperty('TR') && count_1 != currentIndex){
                tableTrIndex.push(count_1)   
                ArrayOfObject.push({'state':false ,'obj':x})
            }else if(x.hasOwnProperty('TR') && count_1 == currentIndex){
                ArrayOfObject.push({'state':true ,'obj':x})
                tableTrIndex.push(count_1)   
            } 
        })
        if(ArrayOfObject.length<=0){
            obj.firstThreeRows =true;
            obj.lastThreeRows =false;
            obj.inBetween =false;
            obj.removeTill ='';
        }
        else{
            _.each(ArrayOfObject,(x,count)=>{
            if(x.state == true) {

                if(ArrayOfObject.length > 6){
                    switch(count){
                            case 0:
                            case 1:
                            case 2:
                                obj.firstThreeRows =true;
                                obj.lastThreeRows =false;
                                obj.inBetween =false;
                                obj.removeTill ='';
                            break;
                            case (Math.round(ArrayOfObject.length-1)):
                            case (Math.round(ArrayOfObject.length-2)):
                            case (Math.round(ArrayOfObject.length-3)):
                                obj.firstThreeRows =false;
                                obj.lastThreeRows =true;
                                obj.inBetween = false;
                                obj.removeTill = Math.round(ArrayOfObject.length-3);
                                obj.objStartFrom = tableTrIndex[Math.round(tableTrIndex.length-3)]
                            break;
                            default:
                                obj.firstThreeRows =false;
                                obj.lastThreeRows =false;
                                obj.inBetween =true;
                                obj.removeTill ='';
                                break;
                        }
                    }else{
                        obj.firstThreeRows =true;
                        obj.lastThreeRows =false;
                        obj.inBetween = false;
                    }
            }
            })
        }

        return obj;
    }
    /** function to restructure table */
    public formatTableStructure(Obj,element,table_rowCondition,rowElement){
        if(table_rowCondition.firstThreeRows){
            Obj.startFromUniqID = element.getAttribute('uniqid');
            //Obj.elemType = element.nodeName.toLowerCase();
            Obj.DOMelement = element;
        }else if(table_rowCondition.lastThreeRows){
            
            while(element){
                if(element.children.length == table_rowCondition.removeTill)
                    break;
                
                Obj.startFromUniqID = element.lastElementChild.getAttribute('uniqid');
                //Obj.elemType = element.lastElementChild.nodeName.toLowerCase();
                Obj.DOMelement = element.lastElementChild;
                element.lastElementChild.remove()
            }
        }else if(table_rowCondition.inBetween){
            Obj.startFromUniqID = rowElement.getAttribute('uniqid');
            //Obj.elemType = rowElement.nodeName.toLowerCase();
            Obj.DOMelement = rowElement;
        }

        return Obj;
    }

    


    /**function to know element value in table  --  not used*/
    // public tableOldStructure(element,type,childjson){
    //     let obj:any={
    //         firstThreeRows:'',
    //         lastThreeRows:'',
    //         inBetween:'',
    //         indexOfTr:''
    //     }
    //     let indexOfTr:any='';
    //     let matchValue:any=0;
    //     if(type == 'tr'){
    //         while(element){
    //             if(element.nodeName.toLowerCase() == 'tr')
    //                 break;
                    
    //             element = element.parentNode
    //         }
    //         let arrOfTr = Array.from(element.parentNode.children)
    //         _.each(arrOfTr,(x,count)=>{
    //             if(x.nodeName.toLowerCase() == 'tr'){
    //                 matchValue++;
    //                 if(x.getAttribute('uniqid') == element.getAttribute('uniqid'))
    //                     obj.indexOfTr = count;
    //             }
    //         })

    //         switch(obj.indexOfTr){
    //             case 1:
    //             case 2:
    //             case 3:
    //                 obj.firstThreeRows =true;
    //                 obj.lastThreeRows =false;
    //                 obj.inBetween =false;
    //                 break;
    //             case (Math.round(matchValue-1)):
    //             case (Math.round(matchValue-2)):
    //             case (Math.round(matchValue-3)):
    //                 obj.firstThreeRows =false;
    //                 obj.lastThreeRows =true;
    //                 obj.inBetween =false;
    //                 break;
    //             default:
    //         }
            
    //     }else if(type == 'table' || type == 'tbody'){
    //         obj.firstThreeRows =true;
    //         obj.lastThreeRows =false;
    //         obj.inBetween =false;
    //     }
        
    //     return obj;
    // }

   

}