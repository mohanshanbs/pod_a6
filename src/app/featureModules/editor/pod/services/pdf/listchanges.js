listChangesClass = function(extension,projectlist,folder,two_col,poptips){
    this._extension=extension;
    this._projectlist=projectlist;
    this._folder=folder;
    this._twocolumn=two_col;
    this._poptips=poptips;
}

listChangesClass.prototype.removeLineBreaksChapterOpenerList= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var chapter_opener_lists=allTags.getElementsByClassName('mhhe-pod--co-2col-list')
	for (var col = 0; col < chapter_opener_lists.length; col++) {									
		var chapter_opener_lists_html=chapter_opener_lists[col].outerHTML;
		chapter_opener_lists_html = chapter_opener_lists_html.replace(/\n/g, "").replace(/[\t ]+\</g, "<").replace(/\>[\t ]+\</g, "><").replace(/\>[\t ]+$/g, ">");
		chapter_opener_lists[col].outerHTML=chapter_opener_lists_html;
		// debugger;
		// console.log(chapter_opener_lists_html);
	}
	return true;
}

listChangesClass.prototype.listBeforeParaBreakAvoid= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var ulPComb = allTags.querySelectorAll("p + ul,p + ol");
	for (var uC = 0; uC < ulPComb.length; uC++) {		
		if(ulPComb[uC]){
			var elemP=ulPComb[uC].previousElementSibling;
			if(elemP.className.indexOf('mhhe-pod--ulbef-para') <= -1){
				var elemPChilds = [].slice.call(elemP.childNodes, 0).reverse();
				var len=elemP.childNodes.length; 
				var lastlineP = elemP.childNodes[len-1].textContent.split(/\n/).slice(-1)[0];// console.log(lastlineP);
				for(var y=0;y<elemPChilds.length;y++){	
					if(elemPChilds[y].textContent == lastlineP){
						// console.log(elemPChilds[y]);
						var newP=document.createElement('p');
						this._projectlist.cloneAttributes(newP,elemP);
						newP.appendChild(elemPChilds[y]);
						newP.classList.add('mhhe-pod--ulbef-para');
						// debugger;
						elemP.parentElement.insertBefore(newP,elemP.nextElementSibling);	
						if(elemP.textContent.trim()==''){
							elemP.parentElement.removeChild(elemP);
						}
						// uC--;
					}
					// if(newP.offsetHeight < 15){
					// 	newP.insertBefore(elemPChilds[y],newP.firstChild);	
					// 	// debugger;
					// 	console.log(newP);
					// }else if(newP.offsetHeight >= 15){
					// 	newP.classList.add('mhhe-pod--ulbef-para');
					// 	uC--;
					// }
				}
			}			
		}		
	}
	return true;
};

listChangesClass.prototype.listStartCounterReset= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var olStart = allTags.querySelectorAll("ol[start]");
	for (var oC = 0; oC < olStart.length; oC++) {	
		var resetValue=window.getComputedStyle(olStart[oC]).counterReset;
		resetValue=resetValue.replace( /^\D+/g, ''); 
		resetValue=parseInt(resetValue)+parseInt(1);
		if(!isNaN(resetValue)){			
			olStart[oC].style.setProperty('counter-reset','list-item '+resetValue,'important');
		}
	}
	return true;
};

listChangesClass.prototype.splitGlosTermList= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var glosLists = allTags.querySelectorAll("ol,ul");
	for (var gC = 0; gC < glosLists.length; gC++) {	
		
		var terms=glosLists[gC].querySelectorAll('[epub\\:type="glossref"]');
		if(terms.length==0){
			var terms=glosLists[gC].querySelectorAll('dfn[title]');
		}
		if(terms.length > 0){
			var oldUl=glosLists[gC];
			if(oldUl && !oldUl.classList.contains('mhhe-pod--eoc-2col-list') && !oldUl.classList.contains('mhhe-pod--co-2col-list') && !oldUl.classList.contains('mhhe-pod--split-ul') && !oldUl.classList.contains('mhhe-pod--3col-list') && !oldUl.classList.contains('mhhe-pod--eoc-3col-list') && !oldUl.classList.contains('mhhe-pod--co-3col-list')){

				

				var attrs = oldUl.attributes;
		       	var output = "";
		       	
		       	var oldUl_children=oldUl.children;
		       	// for(var oc = oldUl_children.length - 1; oc >= 0; oc--) {	
		       	var old_start=1;	
		       	if(oldUl.getAttribute('start')){
		       	    old_start=parseInt(oldUl.getAttribute('start'));
		       	}	
		       	var start=old_start;
		       	for (var oc = 0; oc < oldUl_children.length; oc++) {		   
		       		var newUl=document.createElement(oldUl.nodeName.toUpperCase());
			       	for(var i = attrs.length - 1; i >= 0; i--) {
			       		if(attrs[i].name!='id'){
			       			newUl.setAttribute(attrs[i].name,attrs[i].value);
			       		}
			       	}
			       	if(oldUl.nodeName=='OL'){
			       		// var start=oc+1;
			       		newUl.setAttribute('start',start);	
			       	}
			       	
			       	newUl.appendChild(oldUl_children[oc]);
			       	var reset=start-1;
			       	// newUl.setAttribute('style','counter-reset:list-item !important;');	
			       	// newUl.style.setProperty('counter-reset',reset);
			       	newUl.classList.add('mhhe-pod--split-ul');
			       	oldUl.parentElement.insertBefore(newUl,oldUl);
			       	oc--;
			       	start++;
		       	}		       				
			}			
		}
	}
	return true;
};

listChangesClass.prototype.processToc= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var main_list = allTags.querySelectorAll("ol,ul");
	for (var m = 0; m < main_list.length; m++) {
		var main_list_children=main_list[m].children;
		for (var c = 0; c < main_list_children.length; c++) {
			var inner_list_children=main_list_children[c].children;
			for (var ic = 0; ic < inner_list_children.length; ic++) {
				var inner_inner_list_children=inner_list_children[ic].children;

				var html_heading=inner_list_children[ic].innerText.trim();				
				for (var ii = 0; ii < inner_inner_list_children.length; ii++) {					
					var html_body=inner_inner_list_children[ii].innerText.trim();
					if(html_heading==html_body){
						inner_inner_list_children[ii].parentElement.removeChild(inner_inner_list_children[ii]);
					}else{
						var removable_list_children=inner_inner_list_children[ii].children;
						for (var rc = 0; rc < removable_list_children.length; rc++) {
							if(removable_list_children[rc].nodeName=='OL' || removable_list_children[rc].nodeName=='UL'){
								removable_list_children[rc].parentElement.removeChild(removable_list_children[rc]);
							}
						}
					}				
				}
			}
		}
	}
	
	return true;
};

listChangesClass.prototype.insertBulletsForList= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var lists = allTags.querySelectorAll("ul.mhhe-pod--wrap-list,ol.mhhe-pod--wrap-list");
	for (var ls = 0; ls < lists.length; ls++) {
		var par_div=document.createElement('div');
		cloneAttributes(par_div,lists[ls]);

		var li_list=lists[ls].children;
		for (var i = 0; i < li_list.length; i++) {
			var li_children=li_list[i].children;
			for (var li = 0; li < li_children.length; li++) {
				var span=document.createElement('span');
				span.className="mhhe-pod--ul-list";
				// span.innerText="•";
				if(lists[ls].nodeName=='OL'){
					span.innerText=i+1;
					span.innerText+='.';
				}else{
					span.innerText="•";
				}
				
				li_children[li].insertBefore(span,li_children[li].firstChild);

				span.after(span, " "); 


				//var text = document.createTextNode(" ");
				// li_children[li].insertBefore(text,li_children[li].querySelector('.mhhe-pod--ul-list').nextElementSibling);
				var text1 = document.createTextNode("\n\r");
				par_div.appendChild(text1);
				par_div.appendChild(li_children[li]);
				
			}
		};
		lists[ls].parentElement.insertBefore(par_div,lists[ls]);

		lists[ls].parentElement.removeChild(lists[ls]);
		//lists[ls].style.setProperty('list-style-type','none','important');






		// if(lists[ls].parentElement){
		// 	if(lists[ls].parentElement.querySelectorAll("figure.mhhe-pod--image-75to50-wrap").length > 0){
				// if(window.getComputedStyle(lists[ls]).listStyleType=='disc'){
					// var li_list=lists[ls].children;
					// for (var i = 0; i < li_list.length; i++) {
					// 	var span=document.createElement('span');
					// 	span.className="mhhe-pod--ul-bullet";
					// 	span.innerText="•";
					// 	li_list[i].insertBefore(span,li_list[i].firstChild);
					// };
					// lists[ls].style.setProperty('list-style-type','none','important');
				// }
		// 	}
		// }
	}
	
	return true;
};

listChangesClass.prototype.multiColumnOption= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var main_list = allTags.querySelectorAll("ol,ul");
	for (var m = 0; m < main_list.length; m++) {
		main_list[m].classList.add("list_column");
	}
	
	return true;
};

function cloneAttributes(element, sourceNode) {
	let attr;
	let attributes = Array.prototype.slice.call(sourceNode.attributes);
	while(attr = attributes.pop()) {
		element.setAttribute(attr.nodeName, attr.nodeValue);
	}
	return true;
}


