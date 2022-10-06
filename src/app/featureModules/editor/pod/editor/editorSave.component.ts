import { Injectable, Renderer2 } from '@angular/core';
import { editorHttpService } from './editorFrame-services/editorHttp.service';
import { editorDomService } from './editorFrame-services/editorDom.service';
import { editorJsonService } from './editorFrame-services/editorJson.service';

@Injectable()
export class EditorSave{
    constructor(
        public editorHttpService:editorHttpService,
        public editorDomService:editorDomService,
        public editorJsonService:editorJsonService,
        public renderer:Renderer2
        ){

    }

    mappingContent = async function(obj,testIframe,contentDoc){
        try{
            // let page_html = obj.sectionArray[obj.sectionCount];
            let responseData = await this.http.get(this.appConfig.config.apiURL+"/readfile",{params:{'url':"./pod_assets/uploads/Denniston_10e/s9ml/chapter03/editorUniqID.html"}}).toPromise();
            let headTags = responseData.match(/<head[^>]*>[\s\S]*<\/head>/gi);
            let bodyTags = responseData.match(/<body[^>]*>[\s\S]*<\/body>/gi);
            testIframe.head.innerHTML = headTags;
            testIframe.body.innerHTML = bodyTags;

            let original_html = testIframe.body;

            // contentDoc.body.innerHTML='';
            // contentDoc.body.appendChild(page_html);
            await this.matchElement(obj,original_html,contentDoc);
            return new Promise((resolve,reject)=>{
                resolve(testIframe)
            })
        }catch (error){
            console.log(error)
        }
        
    }

    matchElement = async function(editorElements,originalElements,contentDoc){
        try{
            // console.log("editorElements==>",editorElements);
            // console.log("editorElements.childNodes====>",editorElements.childNodes);
            let data = editorElements.childNodes;
            for(let x of data){

                if(x.nodeName == "#text"){
                    await this.appendTextNode(x.parentNode,originalElements,contentDoc,x)
                }else{
                    let _Id = x.getAttribute('uniqidcount')
                    if(_Id == null || _Id == undefined){
                        await this.insertingElements(x,originalElements,contentDoc);
                        console.log('reset')
                    }else{
                        let node_list = contentDoc.body.querySelectorAll('[uniqidcount="'+_Id+'"]');
                        if(node_list.length > 1){

                        }else{
                            await this.matchElement(x,originalElements,contentDoc)
                        }
                    }
                }
            }
            return new Promise((resolve,reject)=>{
                resolve(originalElements)
            })
        }catch (error){
            console.log(error)
        }
    }
    /** function for appending text node */
    appendTextNode = async function(editElement,originalElements,contentDoc,textElem){
        let _Id = editElement.getAttribute('');
        let orgininal_element = originalElements.querySelector('[uniqidcount="'+_Id+'"]');
        let _Index = Array.from(textElem.parentNode.childNodes).indexOf(textElem);

        if(orgininal_element.childNodes.length > _Index){
            orgininal_element.childNodes[_Index].textContent ='';
            orgininal_element.childNodes[_Index].textContent = textElem.textContent;
        }else{
            let textNode = this.renderer.createText(textElem.textContent)
            orgininal_element.appendChild(textNode)
            //orgininal_element.insertBefore(textElem,orgininal_element.childNodes[_Index]);
        }


        return new Promise((resolve,reject)=>{
            resolve('textappend')
        })
    }

    insertingElements = async function(elem,originalElements,contentDoc){
        try {
            // console.log("inserting the elements");
            // console.log("next line ------",elem.parentNode.nodeName.toLowerCase());
            let _Id = elem.parentNode.nodeName.toLowerCase() == 'body'?'container':elem.parentNode.getAttribute('uniqidcount');
      
            let node_list = contentDoc.body.querySelectorAll('[uniqidcount="'+_Id+'"]');
           
            let orgininal_element = _Id != 'container'?originalElements.querySelector('[uniqidcount="'+_Id+'"]'):originalElements;
           
            let json:any ='';
            // if(_Id != 'container'){
            //     json = await this.editorJsonService.createJSON(node_list[0].childNodes,'','');
            // }else{
            //     let from_index = Array.from(elem.parentNode.childNodes).indexOf(elem);
            //     json = await this.editorJsonService.createJSON(elem.parentNode.childNodes,from_index,(from_index+1));
            // }
            let from_index = Array.from(elem.parentNode.childNodes).indexOf(elem);
   
            json = await this.editorJsonService.createJSON(elem.parentNode.childNodes,from_index,(from_index+1));

            let data = JSON.parse(json); 
          
            let new_element:any='';
            for(let keyx in data){
                new_element = await this.editorDomService.createElement('',data[keyx],'',contentDoc)
            }
        
            let appendAtIndex = Array.from(elem.parentNode.childNodes).indexOf(elem);
            orgininal_element.insertBefore(new_element,orgininal_element.childNodes[appendAtIndex]);

            return new Promise((resolve,reject)=>{
                resolve(originalElements)
            })   
        } catch (error) {
            console.log(error)
        }
        
    }

    deletingElement = function(){

    }

}