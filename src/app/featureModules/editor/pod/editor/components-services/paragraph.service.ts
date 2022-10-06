import { Injectable, Injector } from '@angular/core';
import { CheckPreviousElementsService } from './CheckPreviousElements.service'

@Injectable({providedIn:'root'})

export  class ParagraphService{
    public CheckPreviousElements_service:CheckPreviousElementsService
    viewerheight: number = 0;
    constructor(injector:Injector){
        this.CheckPreviousElements_service = injector.get(CheckPreviousElementsService);
        this.viewerheight = localStorage.getItem('pagesize') ? parseFloat((localStorage.getItem('pagesize')).split(',')[1])*96 -60 : 910;
        //this.viewerheight = 910;
    }

    /**paragraph structure */
    public paragraphStructure = async function(Obj,element,secheight,json,section,sectionCount,uniqid,saveSection_Id,returnLen){
        if(Math.round(secheight - element.offsetHeight) > this.viewerheight){
            let page1_charaLen:any='';
            let page2_characLen:any='';
            secheight =  Math.round(secheight - element.offsetHeight);
           
            element.innerHTML = element.innerHTML.substring(0,0);
            let breakLoop:any= false;
            var _This = this;
            page1_charaLen=0;
            page2_characLen=0;
          
            let parent_json = json;
            let appendCharacter = async function(json,element,newElement){
                
                if(newElement){
                    uniqid++;
                    json[0].isBelongTo = saveSection_Id;
                    json[0].uniqid = 'element_'+uniqid;
                    element.setAttribute('uniqId','element_'+uniqid);
                    for(var cakey in json[0]){
                        if(cakey!="offsetHeight" && cakey!="computedStyles"){                    
                            element.setAttribute(cakey,json[0][cakey]);
                            if(element.nodeName != 'SECTION' && element.nodeName != 'FIGURE' && element.nodeName != 'META' && element.nodeName != 'FIGCAPTION' && element.nodeName != 'IMG' && element.nodeName != 'LINK'){
                                // element.setAttribute('setfocus','setfocus_'+uniqid);
                                // element.setAttribute('id','setfocus_'+uniqid);
                            }
                        }
                    }
                }
                for(var k=1; k< json.length; k++){
                    let key = Object.keys(json[k]);

                    if(key[0] != "text"){
                        let elem_new  = document.createElement(key[0]);
                        element.appendChild(elem_new)
                        appendCharacter(json[k][key[0]],elem_new,true);
                    }
                        
                    if(breakLoop){
                        break;  
                    }
                    
                }
            }
            
            appendCharacter(json,element,true);
            
        }else{
            while(element && element.parentNode){
                if(element.parentNode.childElementCount > 1 || element.parentNode.id=='section_'+sectionCount)
                    break;
                
                    element = element.parentNode;
            }
           if(element.previousElementSibling && element.previousElementSibling.nodeName.toLowerCase() == "header" || element.previousElementSibling.classList.contains("mhhe-blk-header") && element.previousElementSibling.children.length == 1) {
                element = element.previousElementSibling;
            }

            if(element.previousElementSibling && element.previousElementSibling.getAttribute('text') == "Required") {    
                element = element.parentNode;    
            }

             if(element.previousElementSibling && element.previousElementSibling.nodeName.toLowerCase() == "ol" && element.previousElementSibling.classList.contains("list-step")) {    
                element = element.parentNode;    
            }
            var prevElem;
            if(element.previousElementSibling && element.previousElementSibling.nodeName.toLowerCase() == "p" && 
                element.previousElementSibling.getElementsByTagName('strong')[0] && 
                element.previousElementSibling.getElementsByTagName('strong')[0].nodeName.toLowerCase() == "strong"){
                    element = element.previousElementSibling;
                    prevElem = true;
                }


            Obj.startFromUniqID  = element.getAttribute('uniqid');  /**setting  return obj value*/
            Obj.paraStartFrom = 0;
            Obj.elemType = element.nodeName.toLowerCase();
            Obj.DOMelement = element;
            if(prevElem){
                element.parentNode.removeChild(element.nextElementSibling);
            }
            element.parentNode.removeChild(element);
        }

        if(element.previousElementSibling && element.previousElementSibling.nodeName.toLowerCase() == "p" && 
        element.previousElementSibling.getElementsByTagName('strong')[0] && 
        element.previousElementSibling.getElementsByTagName('strong')[0].nodeName.toLowerCase() == "strong"){
            element = element.previousElementSibling;
        }


    Obj.startFromUniqID  = element.getAttribute('uniqid');  /**setting  return obj value*/
    Obj.paraStartFrom = 0;
    Obj.elemType = element.nodeName.toLowerCase();
    Obj.DOMelement = element;
    if(element.parentNode){
        element.parentNode.removeChild(element);
    }
    
        return Obj
    }

    /**function to check next page paragraph line height */
    public checkParaRemainingLength = function(json,startFromId,startFromLength,section,Kvalue){
        let len:number=0;
        let _This = this;
        let dummy_Element= document.createElement('div')
        dummy_Element.setAttribute('class','dummyElement')
        section.appendChild(dummy_Element);
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
                if(key[0] != "text"){
                    elem_new = elem_new == ''?dummy_Element:elem_new;
                    if(json[k][key[0]][0].uniqid == startFromId || Boolean_created){
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
        Boolean_created = json[0]['attributes'][0].uniqid == startFromId?true:Boolean_created;
        Kvalue = Boolean_created?Kvalue:'';
        createElement(dummy_Element,json,startFromId,startFromLength,Boolean_created,Kvalue,'');
        section.removeChild(dummy_Element);
        return len;
    }

}