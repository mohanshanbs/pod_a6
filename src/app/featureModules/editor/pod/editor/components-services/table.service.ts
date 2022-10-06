import { Injectable, Injector } from '@angular/core';
import { _ } from 'underscore'


@Injectable({providedIn:'root'})


export class TableService{
    constructor(injector:Injector){
    }
    public getElementInTable(obj,childjson,currentIndex){
        let ArrayOfObject:any=[];
        let tableTrIndex:any=[];
        _.each(childjson,(x,count_1)=>{
            if(x.hasOwnProperty('tr') && count_1 != currentIndex){
                tableTrIndex.push(count_1)   
                ArrayOfObject.push({'state':false ,'obj':x})
            }else if(x.hasOwnProperty('tr') && count_1 == currentIndex){
                ArrayOfObject.push({'state':true ,'obj':x})
                tableTrIndex.push(count_1)   
            } 
        })
        if(ArrayOfObject.length<=0){
            obj.tableObj.firstThreeRows =true;
            obj.tableObj.lastThreeRows =false;
            obj.tableObj.inBetween =false;
            obj.tableObj.removeTill ='';
        }
        else{
            _.each(ArrayOfObject,(x,count)=>{
            if(x.state == true) {

                //if(ArrayOfObject.length > 6){
                    switch(count){
                            case 0:
                            case 1:
                            case 2:
                                obj.tableObj.firstThreeRows =true;
                                obj.tableObj.lastThreeRows =false;
                                obj.tableObj.inBetween =false;
                                obj.tableObj.removeTill ='';
                            break;
                            case (Math.round(ArrayOfObject.length-1)):
                            case (Math.round(ArrayOfObject.length-2)):
                            case (Math.round(ArrayOfObject.length-3)):
                                obj.tableObj.firstThreeRows =false;
                                obj.tableObj.lastThreeRows =true;
                                obj.tableObj.inBetween = false;
                                obj.tableObj.removeTill = Math.round(ArrayOfObject.length-3);
                                obj.tableObj.objStartFrom = tableTrIndex[Math.round(tableTrIndex.length-3)]
                            break;
                            default:
                                obj.tableObj.firstThreeRows =false;
                                obj.tableObj.lastThreeRows =false;
                                obj.tableObj.inBetween =true;
                                obj.tableObj.removeTill ='';
                                break;
                        }
                    // }else{
                    //     obj.tableObj.firstThreeRows =true;
                    //     obj.tableObj.lastThreeRows =false;
                    //     obj.tableObj.inBetween = false;
                    // }
                    /** need to write condition for table to be adjusted if table tr height is high enough not to remove */
                    if(obj.tableObj.lastThreeRows == true && (count == Math.round(ArrayOfObject.length-3)) && ArrayOfObject.length > 6){
                        obj.tableObj.firstThreeRows =false;
                        obj.tableObj.lastThreeRows =false;
                        obj.tableObj.inBetween =true;
                        obj.tableObj.removeTill ='';
                        obj.tableObj.row_index = tableTrIndex[Math.round(tableTrIndex.length-4)];
                        let lastElem = obj.DOMelement;
                        obj.DOMelement = obj.DOMelement.parentNode.childNodes[Math.round(tableTrIndex.length-4)];
                        if(obj.DOMelement){
                            obj.startFromUniqID = obj.DOMelement.getAttribute('uniqid');
                        } else {
                            obj.startFromUniqID = lastElem.getAttribute('uniqid');
                        }
                       
                        lastElem.parentNode.removeChild(lastElem)
                    }
            }
            })
        }
        return obj.tableObj;
    }
    /** function to restructure table */
    public formatTableStructure(Obj,element,table_rowCondition,rowElement){
        if(table_rowCondition.firstThreeRows){
            Obj.startFromUniqID = element.getAttribute('uniqid');
            Obj.DOMelement = element;
        }else if(table_rowCondition.lastThreeRows){
            
            while(element){
                if(element.children.length == table_rowCondition.removeTill || element.lastElementChild == null || element.lastElementChild == '')
                    break;
                
                if(element.lastElementChild) {
                     Obj.startFromUniqID = element.lastElementChild.getAttribute('uniqid');
                     Obj.DOMelement = element.lastElementChild;
                     element.lastElementChild.remove()
                }
               
            }
        }else if(table_rowCondition.inBetween){
            Obj.startFromUniqID = rowElement.getAttribute('uniqid');
            Obj.DOMelement = rowElement;
        }

        return Obj;
    }
}