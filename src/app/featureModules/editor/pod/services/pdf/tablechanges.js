tableChangesClass = function(html,two_col){
    this.chapter_html=html;
    this._twocolumn=two_col;
}
tableChangesClass.prototype.tableHTMLChanges = function(){
  var tabletags=this.chapter_html.getElementsByTagName("table"); 
    var trimgs_length=false;
  var trimgs_length_no=0;
  var is_lasttd_li=false;

  for(var t = 0; t < tabletags.length; t++){              
    var closest_aside=tabletags[t].closest('aside');
    if (closest_aside) {
      var closest_aside_attr=closest_aside.getAttribute("role");
      if (closest_aside_attr=='complementary' && tabletags[t].getAttribute("role")=='presentation' && tabletags[t].className.indexOf('table-opener') > -1) {
        tabletags[t].innerHTML=tabletags[t].innerHTML.replace('<thead','<tbody').replace('</thead>','</tbody>');
      }
    }      

    tabletags[t].classList.add('table_cls'+t);              
      var tablecls="tablecls"+t;
        tabletags[t].setAttribute("data-tablecls", tablecls);
        var len_tr_wise=[];
        var tabledata=tabletags[t].innerHTML;
        var trtags=tabletags[t].getElementsByTagName("tr");                                          
        for(var tr = 0; tr < trtags.length; tr++){
            var trdata=trtags[tr].innerHTML;                                              
            var tdtags=trtags[tr].getElementsByTagName("td");
            var tdtags_length=trtags[trtags.length - 1].getElementsByTagName("td").length;
            var thtags=trtags[tr].getElementsByTagName("th");

            for(var th=0;th<tdtags_length;th++){
              if (thtags[th]) {
                var thdata=thtags[th].innerHTML; 
                    
                    thdata = thdata.replace(/<th(.*?)>/, '').replace('</th>','').replace(/<\/?[^>]+(>|$)/g, "");
                    thdata=decodeEntities(thdata);
                    thdata=thdata.trim();
                   
                    var thdata_length=thdata.length;
                    if(th in len_tr_wise == false){            
                        len_tr_wise[th] = '';
                        var length=[];
                    }
                    if(thdata_length > len_tr_wise[th] || len_tr_wise[th]==''){
                        len_tr_wise[th]=thdata_length;
                    }
              }                                     
            }

            for(var td=0;td<tdtags_length;td++){
              if (tdtags[td]) {
                var tddata=tdtags[td].innerHTML;                     
                    tddata = tddata.replace(/<td(.*?)>/, '').replace('</td>','').replace(/<\/?[^>]+(>|$)/g, "");
                    tddata=tddata.trim();
                    tddata=decodeEntities(tddata);
                    var tddata_length=tddata.length;
                    if(td in len_tr_wise == false){            
                        len_tr_wise[td] = '';
                        var length=[];
                    }
                    if(tddata_length > len_tr_wise[td] || len_tr_wise[td]==''){
                      if (tdtags[td].colSpan <= 1) {
                        len_tr_wise[td]=tddata_length;
                      }                                             
                    }                    
              } 
            }
            
          if (trtags[tr]) {
            if (trtags[tr].getElementsByTagName('td')[tdtags_length-1]) {
              if(trtags[tr].getElementsByTagName('td')[tdtags_length-1].getElementsByTagName('li').length > 0){
                is_lasttd_li=true;
              }
            }   
          }               
        }

        if (trtags.length > 0) {
          if (trtags.length < 3) {
            tabletags[t].classList.add('mhhe-pod--additional');
          }else{           
            if(is_lasttd_li==true){
              var closest_section=tabletags[t].closest('section');
              if(!closest_section){
                if(tabletags[t].parentElement.parentElement.nodeName == 'DIV'){
                  var closest_section=tabletags[t].parentElement.parentElement;
                }
              }
              if (closest_section) {                      
                var header=closest_section.getElementsByTagName('header');
                if (header[0]) {
                  var header_text=header[0].innerText;
                  if (header_text.indexOf('Questions and Problems') > -1 || header_text.indexOf('Chapter Four Summary') > -1 || header_text.indexOf('SmartGrid: From Knowledge to Critical Thinking') > -1  || header_text.indexOf('Review') > -1) {
                    tabletags[t].classList.add('mhhe-pod--additional');
                  }
                }
              } 
            }
          }
        }                        

        var cgrp_set=false;
        if(len_tr_wise){
          if (len_tr_wise.length > 4) {
                var cgrp = document.createElement("colgroup");         
             /* for(var c=0;c<len_tr_wise.length;c++){      
                    if(len_tr_wise[c]<1){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '1%');
                    }else if(len_tr_wise[c]>=1 && len_tr_wise[c]<=2){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '3%');
                    }else if(len_tr_wise[c]>=3 && len_tr_wise[c]<=4){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '5%');
                    }else if(len_tr_wise[c]>=5 && len_tr_wise[c]<=6){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '7%');
                    }else if(len_tr_wise[c]>=7 && len_tr_wise[c]<=8){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '9%');
                    }
                    else if(len_tr_wise[c]>=9 && len_tr_wise[c]<=12){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '12%');
                    }else if(len_tr_wise[c]>=13 && len_tr_wise[c]<=15){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '16%');
                    }else if(len_tr_wise[c]>=16 && len_tr_wise[c]<=20){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '22%');
                    }else if(len_tr_wise[c]>=21 && len_tr_wise[c]<=25){
                      cgrp.appendChild(document.createElement("col"));
                      cgrp.children[c].setAttribute("width", '25%');
                    }else{
                        cgrp.appendChild(document.createElement("col"));
                    }
                } */

                if(tabletags[t].getAttribute('data-tablecls') == tablecls){
              //tabletags[t].insertBefore(cgrp,tabletags[t].children[0]); 
              cgrp_set=true;
               }
          }
        }     

        if (tabletags[t].offsetWidth > 0) {
            // console.log(this._twocolumn,tabletags[t],tabletags[t].offsetWidth);
            // debugger;
            if(this._twocolumn){
                // if(tabletags[t].offsetWidth <= 290){
                    tabletags[t].classList.add('mhhe-pod--twocol-table');
                // }
                if(len_tr_wise.length > 5){
                    tabletags[t].style.setProperty('column-span','all');
                    tabletags[t].style.setProperty('margin-left','auto','important');
                    tabletags[t].style.setProperty('margin-right','auto','important');
                }
            }
          var ofwid=tabletags[t].offsetWidth;
          if (tabletags[t].offsetWidth > 665) {
            ofwid=665;
          }
        }
    }

    var alltdtags=this.chapter_html.getElementsByTagName("td");
    for(var atd=0;atd<alltdtags.length;atd++){
      var mathtag=alltdtags[atd].getElementsByTagName('math');
      if (mathtag.length > 0) {
        var sibtds=alltdtags[atd].parentNode.children;
        for (var st = 0;st<sibtds.length;  st++) {
          if(sibtds[st].innerHTML=="&nbsp;" || sibtds[st].innerHTML==' ' || sibtds[st].innerHTML==''){
            sibtds[st].parentElement.removeChild(sibtds[st]);
            if (alltdtags[atd].parentNode.children.length==1) {
              alltdtags[atd].setAttribute("colspan", tdtags_length);
            }
          }
        }
      }
    }

    return true;
};

tableChangesClass.prototype.removeTableFullWidth = function(){
    var tables=this.chapter_html.getElementsByTagName("table");
    for(var ts = 0; ts < tables.length; ts++){
        var parent_width_pixels= tables[ts].offsetWidth;
        var table_width_percentage=(100 * tables[ts].offsetWidth) / parent_width_pixels;
        // if(tables[ts].id=='data-uuid-fa42dd5b4dfc4eff8b49a88b3bf1df97'){
        //     debugger;
        // }
        if(table_width_percentage==100){
            // if(tabletags[t].id=='data-uuid-a7e773cda60648b0b5ee940a59d882fa'){
            //     debugger;
            // }
            tables[ts].style.setProperty("width", "auto", "important");
        }
    }
    return true;
};

tableChangesClass.prototype.reduceTableMarginLinux = function(){
    var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
    var pagebreak_elems = allTags.querySelectorAll('.mhhe-pod--table-1-col-top');
    for (var pt = 0; pt<pagebreak_elems.length;  pt++) {
        var children_pb=pagebreak_elems[pt].children;
        pagebreak_elems[pt].style.setProperty('margin-top','0px','important');
        var tab=pagebreak_elems[pt].querySelector('table');     
        childrenMarginReduce(children_pb,tab);        
    }

    return true;
};

function childrenMarginReduce(children_,tab_elem){
    for (var pc = 0; pc<children_.length;  pc++) {
        children_[pc].style.setProperty('margin-top','0px','important');
        if(children_[pc]==tab_elem){
            return true;
        }else{
          childrenMarginReduce(children_[pc].children,tab_elem);
        }
    } 
}

function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}






