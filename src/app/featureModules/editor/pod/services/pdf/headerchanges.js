headerChangesClass = function(projectlist){
    this._projectlist=projectlist;
}
headerChangesClass.prototype.headerHTMLChanges = function(){  
    var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
    var headertags=allTags.getElementsByTagName('header');                      
    var styles = ["color", "font-family", "font-size", "line-height", "white-space", "padding", "display", "float", "border", "border-top", "border-right", "border-bottom", "border-left", "border-color", "border-width", "border-style", "padding-top", "padding-right", "padding-bottom", "padding-left","width", "height", "font-weight", "margin-top", "margin-left", "margin-bottom", "margin-right", "text-decoration","background-color","background-image","font-style","position","text-align","vertical-align","top","left","bottom","right","word-wrap"];
    var setchpno=false;   
    for (var cn = 0; cn < headertags.length; cn++) {        
        var ischapter=false;
        if (headertags[cn].getElementsByClassName("chapter-number").length > 0){
            ischapter=headertags[cn].getElementsByClassName("chapter-number");
        }else if (headertags[cn].getElementsByClassName("number").length > 0){
            ischapter=headertags[cn].getElementsByClassName("number");
        }else if (headertags[cn].getElementsByClassName("mhhe-chapter_opener-chapter_number").length > 0){
            ischapter=headertags[cn].getElementsByClassName("mhhe-chapter_opener-chapter_number");
        }

        if (ischapter) {
            for (var hc = 0; hc < ischapter.length; hc++) {
                var cn_html=ischapter[hc].innerHTML.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase();
                if(cn_html.indexOf('part') === -1){
                    var txt='chapter';
                    var cp_class='chp-no';
                }else{
                    var txt='part';
                    var cp_class='part-no';
                }
                    cn_html=cn_html.replace(txt,'').replace(/\s/g,'').replace(/:/g,'');

                if (headertags[cn]) {
                    var chapter_info='<div class="'+cp_class+'"><span class="hide">'+txt.toUpperCase()+' '+cn_html.toUpperCase()+'</span><span class="hide">:</span></div>';
                    headertags[cn].innerHTML=headertags[cn].innerHTML+chapter_info;
                    setchpno=true;
                }
                
            }
        }         
        if (setchpno==true) {
            break;
        }               
    }
    return true;
};  

headerChangesClass.prototype.removeBottomSpacesForHeaders = function(){
    var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
    var headertags=allTags.querySelectorAll('header,h1,h2,h3');
    for (var h = 0; h < headertags.length; h++) {
        var previous_element=getPreviousElementSibling(headertags[h]);
        if(previous_element){
            var valid_head=false;
            if(headertags[h].parentElement){
                if(headertags[h].parentElement.nodeName=='SECTION'){
                    valid_head=true;
                }
            }
            if(previous_element.nodeName=='H4' || previous_element.className.indexOf('sidenote-') > -1){
                valid_head=false;
            }
            if(previous_element && valid_head){
                previous_element.classList.add('mhhe-pod--header-previous');
                previous_element.style.setProperty('padding-bottom','0px','important');
                previous_element.style.setProperty('margin-bottom','0px','important');
            }
        }        
    }    
};

function getPreviousElementSibling(elem){ 
    // console.log(elem);  
    if(elem.previousElementSibling!=null && elem.previousElementSibling!=undefined){
        return elem.previousElementSibling;
    }else{
        if(elem.parentElement){
            // console.log(elem.parentElement,'ddddddddd');
            return getPreviousElementSibling(elem.parentElement);
        }else{
            return false;
        }
    }
    // return false;
}

headerChangesClass.prototype.ChapterOpenerHeaderChanges = function(){
    var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
    var htags=allTags.getElementsByClassName('mhhe-chapter_opener part-one');
    for(var hh=0;hh<htags.length;hh++){
        var ptags=htags[hh].getElementsByTagName('p');
        for (var pt = 0; pt < ptags.length; pt++) {
            var pcolor=document.defaultView.getComputedStyle(htags[hh], null).getPropertyValue("color");
            var pcolor_hex=this._projectlist.componentToHex(pcolor);
            ptags[pt].setAttribute('style', 'color: '+pcolor_hex+'!important;');                    
        }                                   
    }
    return true;
};

headerChangesClass.prototype.siteNoteChanges = function(){
    var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
    var site_notes=allTags.querySelectorAll("[class^=sidenote-4],[class^=sidenote-3]");
    for (var si = 0; si < site_notes.length; si++) {
         var h4_tags=site_notes[si].getElementsByTagName('h4');
        if(h4_tags.length > 0){
            var computed=document.defaultView.getComputedStyle(h4_tags[0], null);
            var h4_padding=(parseFloat(computed.getPropertyValue("margin-top").replace('px',''),10)/12).toFixed(2)+'em';
            var h4_margin=(parseFloat(computed.getPropertyValue("padding-top").replace('px',''),10)/12).toFixed(2)+'em';                                
            if(h4_tags[0].getElementsByClassName('inline').length > 0){                     
                h4_tags[0].getElementsByClassName('inline')[0].setAttribute('style','padding-bottom:7px !important;margin-top:-1em !important;');

            }else if(h4_tags[0].getElementsByClassName('icon').length > 0){
                h4_tags[0].getElementsByClassName('icon')[0].setAttribute('style','padding-bottom:7px !important;margin-top:-0.5em !important;');
            }
        }
    }
    return true;
};

headerChangesClass.prototype.setclassAsideHeader = function(){
    var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
    // // var headertags=allTags.querySelectorAll('header,h1,h2,h3,h4,h5,h6');

    // // var wrapper=document.createElement(div);
    // // wrapper.setAttribute('class','mhhe-pod--box-2-col');
    // // for (var h = 0; h < headertags.length; h++) {
    // //     var parent_section=headertags[h].closest('.mhhe-pod--box-2-col');
    // //     if(parent_section){
    // //         var header_levels=headertags[h].querySelectorAll('h1,h2,h3,h4,h5,h6');
    // //         if(header_levels[0]){
    // //             wrapper.appendChild(headertags[h]);
    // //         } 
    // //     }        
    // // }        var two_col_sections=allTags.querySelectorAll('.,h1,h2,h3,h4,h5,h6mhhe-pod--box-2-col-bottom,.mhhe-pod--box-2-col-top');    


    // var two_col_sections=allTags.querySelectorAll('.mhhe-pod--box-2-col');    
    // for (var tc = 0; tc < two_col_sections.length; tc++) {
    //     var headerSet=[];
    //     var headertags=two_col_sections[tc].querySelectorAll('header');
    //     var wrapper=document.createElement('div');
    //     wrapper.setAttribute('class','mhhe-pod--box-2-content');
    //     var children=two_col_sections[tc].childNodes;
    //     // if(headertags.length == 0){
    //     //     for (var sc = 0; sc < children.length; sc++) {
    //     //         wrapper.appendChild(children[sc]);
    //     //     }
    //     //     // nextElem.parentElement.insertBefore(wrapper,nextElem);
    //     //     two_col_sections[tc].insertBefore(wrapper, two_col_sections[tc].firstChild);
    //     // }else{            
    //         for (var esc = 0; esc < children.length; esc++) {
    //             if(children[esc].nodeName=='HEADER'){
    //                 children[esc].querySelectorAll('h1,h2,h3,h4,h5,h6');
    //                 if(headerSet.indexOf(children[esc].nodeName+children[esc]) > -1){
    //                     var wrapper=document.createElement('div');
    //                     wrapper.setAttribute('class','mhhe-pod--box-2-content');
    //                 }
    //                 headerSet.push(children[esc].nodeName+children[esc]);
    //                // appendChild(children[esc],wrapper,[];
    //                two_col_sections[tc].insertBefore(wrapper, children[esc]);
    //             }
    //             if(children[esc].nodeName!='HEADER'){
    //                 wrapper.appendChild(children[esc]);
    //             }
    //             if(esc == (children.length-1)){
    //                 if(!wrapper.parentElement){
    //                     two_col_sections[tc].insertBefore(wrapper,two_col_sections[tc].lastChild);
    //                 } 
    //             }
    //             console.log(wrapper);                
    //         }
    //         // var elem_find=headertags[0];
    //         // var next_until = nextUntil(headertags[0],elem_find.nodeName);
    //         // console.log(next_until);
    //     // }
    // }

    var two_col_sections=allTags.querySelectorAll('.mhhe-pod--box-2-col-bottom,.mhhe-pod--box-2-col-top,.mhhe-pod--box-2-col');    
    for (var tc = 0; tc < two_col_sections.length; tc++) {
        var headerSet='';
        var wrapper=document.createElement('div');
        wrapper.setAttribute('class','mhhe-pod--box-2-content');
        var twoColChildren=two_col_sections[tc].children;     
        if(twoColChildren.length==1){
            var target=two_col_sections[tc].children[0];
        }else{
            var target=two_col_sections[tc];
        }
        
        var header_childs=target.childNodes;
        var headers=target.querySelectorAll(':scope > header');   
        

        if(headers.length > 0){
            var splitH=splitHeders(headers);
        }else{

            headerSet='set';
            splitH=true;
        }    
        if(splitH){
            header_first=headers[0];
            for (var esc = 0; esc < header_childs.length; esc++) {  
                if(header_childs[esc]==header_first){
                    headerSet=header_childs[esc].nodeName; 
                }         
                if(headerSet!='' && header_childs[esc]!=header_first){
                    wrapper.appendChild(header_childs[esc]);  
                    esc--;           
                }         
            } 
           if(target.lastChild){
                target.insertBefore(wrapper,target.lastChild.nextElementSibling);
           }else{
                target.appendChild(wrapper);                
           }
           
        }
       
    }
    return true;
};

function splitHeders(headers_array){ 
// console.log('saddasd',headers_array); 
    for (var hf = 0; hf < headers_array.length; hf++) {
        if(headers_array[hf].getElementsByTagName('h4').length > 0 && headers_array[hf].getElementsByTagName('h5').length > 0){
            var header_wrapper=document.createElement('header');
            var attrs = headers_array[hf].attributes;
            for(var i = attrs.length - 1; i >= 0; i--) {
                if(attrs[i].name!='id'){
                    header_wrapper.setAttribute(attrs[i].name,attrs[i].value);
                }                
            }   
            header_wrapper.appendChild(headers_array[hf].getElementsByTagName('h5')[0]);
            headers_array[hf].parentElement.insertBefore(header_wrapper,headers_array[hf].nextElementSibling);
            hf--;
        }
    }
    return true;
}

// function nextUntil(elem,node_name) {
//     // Setup siblings array
//     var siblings = [];
//     // Get the next sibling element
//     elem = elem.nextElementSibling;

//     // As long as a sibling exists
//     while (elem) {
//         // If we've reached our match, bail
//         if (elem.nodeName==node_name) break;

//         // Otherwise, push it to the siblings array
//         siblings.push(elem);

//         // Get the next sibling element
//         elem = elem.nextElementSibling;

//     }
//     return siblings;
// };