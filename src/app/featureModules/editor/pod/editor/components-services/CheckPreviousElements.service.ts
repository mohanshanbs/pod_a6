import { Injectable, Injector } from '@angular/core';

@Injectable({providedIn:'root'})


export class CheckPreviousElementsService{
    constructor(injector:Injector){
    }
    public checkAncestors = function(Obj,element){
        let elem = element;
        let default_value:any= false;
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
                    Obj = this.checkPreviousSibilings(Obj,elem.parentNode,true);
                    break;
                case 'section':
                case 'aside':
                case 'blockquote':
                 if(elem.nodeName.toLowerCase() == "section" && elem.classList.contains("mhhe-pod--header-previous") && elem.previousElementSibling == null){
                        if(elem.parentNode && elem.parentNode.parentNode && elem.parentNode.parentNode.children[0].nodeName.toLowerCase()== "header"){
                                elem = elem.parentNode.parentNode;
                               
                        }
                        
                    }

 				if(elem.nodeName.toLowerCase() == "header" && elem.parentNode.parentNode.parentNode.parentNode && elem.parentNode.parentNode.parentNode.parentNode.nodeName.toLowerCase()== 'aside'){
					elem = elem.parentNode.parentNode.parentNode.parentNode;
                  }

                  if(elem.nodeName.toLowerCase() == "header" && elem.parentNode.parentNode && (elem.parentNode.parentNode.classList.contains("learning-out") || elem.parentNode.parentNode.previousElementSibling && elem.parentNode.parentNode.previousElementSibling.nodeName.toLowerCase() == "header")){
                    elem = elem.parentNode.parentNode.parentNode;
                  }
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
                if(elem.parentNode.nodeName.toLowerCase() == "li" && elem.parentNode.parentNode && elem.parentNode.parentNode.previousElementSibling && elem.parentNode.parentNode.previousElementSibling.nodeName.toLowerCase() == 'header'){
                            elem = elem.parentNode.parentNode.previousElementSibling;
                        } else{
                            elem = elem.parentNode;
                        }
                    Obj.startFromUniqID = elem.getAttribute('uniqid')
                    Obj.elemType = elem.nodeName.toLowerCase();
                    Obj.DOMelement = elem;
                    // Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
                    // Obj.elemType = elem.parentNode.nodeName.toLowerCase();
                    // Obj.DOMelement = elem.parentNode;
                    Obj.breakCondition = true;
                    Obj.isSibling = false;
                    break;
                case 'ul':
                        if(elem.parentNode && elem.parentNode.previousElementSibling && elem.parentNode.previousElementSibling.nodeName.toLowerCase() == 'p'){
                            var preText = elem.parentNode.previousElementSibling.textContent.trim();
                            var textStatus = preText.endsWith(":");
                            if(textStatus){
                                elem = elem.parentNode.parentNode;
                            }
                            if(elem.parentNode.previousElementSibling && elem.parentNode.previousElementSibling.nodeName.toLowerCase() == "header"){
                                elem = elem.parentNode.previousElementSibling;
                            }
                        }
                            Obj.startFromUniqID = elem.getAttribute('uniqid')
                            Obj.elemType = elem.nodeName.toLowerCase();
                            Obj.DOMelement = elem;
                            // Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
                            // Obj.elemType = elem.parentNode.nodeName.toLowerCase();
                            // Obj.DOMelement = elem.parentNode;
                            Obj.breakCondition = true;
                            Obj.isSibling = false;
                            break;
                default:
                    if(elem.nodeName.toLowerCase() == 'header'){
                        Obj.startFromUniqID = elem.parentNode.getAttribute('uniqid')
                        Obj.elemType = 'default';
                        Obj.DOMelement = elem.parentNode;
                        // Obj.breakCondition = true;
                        // Obj.isSibling = false;
                        Obj.breakCondition = false;
                        Obj.isSibling = true;
                    break;   
                    }
                    else{
						if(elem.nodeName.toLowerCase() == 'figure' && elem.children.length == 2){
                           if(elem.children[0].nodeName.toLowerCase() == 'img' && elem.children[1].nodeName.toLowerCase() == 'img'){
                               elem = elem.lastElementChild;
                           }
                       }
                        Obj.startFromUniqID = elem.getAttribute('uniqid')
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.DOMelement = elem;
                        Obj.breakCondition = true;
                        break;
                    }
            }
            if((Obj.elemType) && (Obj.breakCondition))
                break;

            if((Obj.elemType) && (Obj.DOMelement.nodeName.toLowerCase() =='aside' )) { 
                break;
            }

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

    public checkDescendants =  function(obj,element){
        let elem = element

        return this.checkAncestors(obj,element);
    }
    public checkPreviousSibilings = function(Obj,elem,callback){
        if(elem.previousElementSibling != null || Array.from(elem.parentNode.children).indexOf(elem) != 0){
            let indexFrom = Array.from(elem.parentNode.children).indexOf(elem.previousElementSibling);
            for(var i=indexFrom; i>=0;i--){
                if(elem.parentNode.children[i].nodeName.toLowerCase() == 'header' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h1' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h2' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h3' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h4' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h5' || elem.parentNode.children[i].nodeName.toLowerCase() == 'h6'){
                    if(i == 0){
                        Obj.isSibling = true;
                        let value = this.checkDescendants(Obj,elem.parentNode.children[i]);
                    }else{
                        Obj.startFromUniqID = elem.parentNode.children[i].getAttribute('uniqid');
                        Obj.elemType = elem.parentNode.children[i].nodeName.toLowerCase();
                        Obj.DOMelement = elem.parentNode.children[i];
                        Obj.isSibling = true;
                    }
                }else if(elem.parentNode.children[i].nodeName.toLowerCase() == 'p'){
                    if(elem.parentNode.children[i].innerHTML.length > 206){
                         if(elem.parentNode && elem.parentNode.nodeName.toLowerCase() == "figcaption"){
                        elem = elem.parentNode;
                    }
                        Obj.startFromUniqID = elem.getAttribute('uniqid');
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.DOMelement = elem;
                    }else{
                        if(i == 0){
                            Obj.isSibling = true;
                            this.checkAncestors(Obj,elem.parentNode.children[i]);
                        }else{
                            if(elem.parentNode.children[i].previousElementSibling.nodeName.toLowerCase() == 'header'){
                                Obj.isSibling = true;
                                this.checkDescendants(Obj,elem.parentNode.children[i].previousElementSibling);
                            }else{
                                Obj.startFromUniqID = elem.getAttribute('uniqid');
                                Obj.elemType = elem.nodeName.toLowerCase();
                                Obj.DOMelement = elem;
                            }
                        }
                    }
                }else if(elem.parentNode.children[i].nodeName.toLowerCase() == 'figcaption'){
                        Obj.startFromUniqID = elem.parentNode.children[i].getAttribute('uniqid');
                        Obj.elemType = elem.parentNode.children[i].nodeName.toLowerCase();
                        Obj.DOMelement = elem.parentNode.children[i];
                        Obj.isSibling = true;
                }else{
                    if(elem.parentNode.children[i].classList.contains('minor-column')){
                        let minor_elem = elem.parentNode.children[i];

                        let inx = Array.from(minor_elem.parentNode.childNodes).indexOf(minor_elem) 
                        if(inx == 0){
                            this.checkAncestors(Obj,elem.parentNode.children[i])
                        }else{
                            if(elem.parentNode.children[i].previousElementSibling.nodeName.toLowerCase() == 'header'){
                                Obj.isSibling = true;
                                this.checkDescendants(Obj,elem.parentNode.children[i].previousElementSibling);
                            }else{
                                Obj.startFromUniqID = elem.getAttribute('uniqid');
                                Obj.elemType = elem.nodeName.toLowerCase();
                                Obj.DOMelement = elem;
                            }
                        }

                    }else{
                        Obj.startFromUniqID = elem.getAttribute('uniqid');
                        Obj.elemType = elem.nodeName.toLowerCase();
                        Obj.DOMelement = elem;
                    }
                    // Obj.startFromUniqID = elem.getAttribute('uniqid');
                    // Obj.elemType = elem.nodeName.toLowerCase();
                    // Obj.DOMelement = elem;
                }

                
                if(Obj.startFromUniqID && Obj.elemType)
                    break;
            }
        }else{
            this.checkAncestors(Obj,elem)
        }

        if(callback)
            return Obj

    }
}