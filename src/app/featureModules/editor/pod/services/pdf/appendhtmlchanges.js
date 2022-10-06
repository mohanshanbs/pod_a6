appendHtmlChanges = function(extension,projectlist,folder,two_col,poptips){
    this._extension=extension;
    this._projectlist=projectlist;
    this._folder=folder;
    this._twocolumn=two_col;
    this._poptips=poptips;
}

// appendHtmlChanges.prototype.appendWidgetData = function(){	
// 	var iframes=document.getElementById('hiddenfinalhtml').contentDocument.body.getElementsByTagName('iframe');
// 	for (var i = 0; i < iframes.length; i++) {
// 		console.log(iframes[i]);
// 		if(iframes[i].src.indexOf('configFile') > -1){
// 			var src=iframes[i].src;
// 			// src=src.replace(new RegExp("..%2F", "g"), "");
// 			// src=src.replace(new RegExp("%2F", "g"),'/');
// 			src=src.split('index.html?configFile=');
// 			var base_url=src[0].split('assets/')[0];
// 			var json_url=src[1].split('%2F');
// 			if(!json_url[0]){			
// 				json_url=src[1].split('/')
// 			}
// 			json_url=json_url[json_url.length-1];
// 			var iframe=iframes[i];
// 			if(json_url[0]){	
// 				json_url=base_url+'assets/widget_data/config/'+json_url;
// 				// console.log(json_url);
// 				this._projectlist.loadJSON(json_url,
// 				    function(data) {   
// 				    	var parentElem=document.createElement('div');
// 				    	parentElem.className='mhhe-pod--widget-par';
// 				        for( let prop in data ){
// 				        	console.log(prop,data);
// 						    if(prop=='showLabel'){
// 						    	parentElem.innerHTML=parentElem.innerHTML+data[prop];
// 						    }
// 						    if(prop=='elements'){
// 						    	var elem_data=data[prop];
// 						    	for( let elem_prop in elem_data ){
// 							    	if(elem_data[elem_prop]=='text'){
// 							    		var input = document.createElement("input");
// 										input.type = "text";
// 										input.className = "mhhe-pod--widget-input"; 
// 										// if(elem_data[elem_prop]->text->content){
// 										// 	input.value=elem_data[elem_prop]->text->content;
// 										// }										
// 										parentElem.appendChild(input); 
// 							    	}

// 							    	if(elem_data[elem_prop]=='content'){
// 							    		parentElem.innerHTML=parentElem.innerHTML+elem_data[elem_prop];
// 							    	}
// 							    }
// 						    }
// 						}
// 						if(iframe.parentElement){
// 							iframe.parentElement.classList.add("mhhe-pod--widget-parent");
// 							iframe.parentElement.insertBefore(parentElem,iframe);
// 							iframe.parentElement.removeChild(iframe);
// 						}						
// 				    },
// 				    function(xhr) {
// 				        console.error(xhr); 
// 				    }
// 				);
// 			}
// 		}		
// 	}	
// 	return true;
// };

appendHtmlChanges.prototype.twoColoumWrapper = function(){	
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var main_parent_body_divs=allTags.querySelectorAll('.mhhe-pod--bodym');
	if (this._twocolumn) {
		var bodyWrapper=document.createElement('div');
		bodyWrapper.classList.add('mhhe-pod--2col');
	}						
	for (var pt = 0; pt < main_parent_body_divs.length; pt++) {
		if (this._twocolumn) {
			// // main_parent_body_divs[pt].classList.add('mhhe-pod--no-margin');							
			// if(main_parent_body_divs[pt].className.indexOf('mhhe-pod--introm') > -1){
			// 	main_parent_body_divs[pt].classList.add('mhhe-pod--chapter--stet');
			// 	main_parent_body_divs[pt].classList.remove('mhhe-pod--introm');
			// }								
			if(main_parent_body_divs[pt].className.indexOf('mhhe-pod--bodym') > -1 && main_parent_body_divs[pt].className.indexOf('mhhe-pod--introm') <=-1 && main_parent_body_divs[pt].className.indexOf('mhhe-pod--endm') <=-1){
				bodyWrapper.appendChild(main_parent_body_divs[pt]);
				main_parent_body_divs[pt].classList.remove('mhhe-pod--bodym');
			}
			// if(main_parent_body_divs[pt].className.indexOf('mhhe-pod--endm') > -1){
			// 	//main_parent_body_divs[pt].classList.add('mhhe-pod--eoc--stet');
			// 	main_parent_body_divs[pt].parentElement.insertBefore(bodyWrapper,main_parent_body_divs[pt]);
			// 	main_parent_body_divs[pt].classList.remove('mhhe-pod--endm');
			// }
		}
		if (!this._poptips && !this._twocolumn) {	
			main_parent_body_divs[pt].classList.add('mhhe-pod--no-margin');
			main_parent_body_divs[pt].classList.remove('mhhe-pod--introm');
			main_parent_body_divs[pt].classList.remove('mhhe-pod--bodym');
			main_parent_body_divs[pt].classList.remove('mhhe-pod--endm');
		}							

	}
	if(allTags.querySelectorAll('.mhhe-pod--introm') && this._twocolumn){
		if(allTags.querySelectorAll('.mhhe-pod--introm')[allTags.querySelectorAll('.mhhe-pod--introm').length-1]){
			allTags.querySelectorAll('.mhhe-pod--introm')[allTags.querySelectorAll('.mhhe-pod--introm').length-1].parentElement.insertBefore(bodyWrapper,allTags.querySelectorAll('.mhhe-pod--introm')[allTags.querySelectorAll('.mhhe-pod--introm').length-1].nextElementSibling);
		}								
	}
	return true;
};

appendHtmlChanges.prototype.addEmptyParatoAside= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var checkElem = ["ASIDE", "FIGURE", "TABLE", "DIV"];

	var asidetags=allTags.querySelectorAll("aside, figure, table, div,section[class*=sidenote-]");
	for (var a = 0; a < asidetags.length; a++) {		
		if(asidetags[a].nextElementSibling){
			if(checkElem.indexOf(asidetags[a].nextElementSibling.nodeName) > -1 || (asidetags[a].nextElementSibling.nodeName=='SECTION' && asidetags[a].nextElementSibling.className.indexOf('sidenote-') > -1)) {
				var valid_elem=true;
				if(asidetags[a].closest('figure')){
					if(asidetags[a].previousElementSibling!=asidetags[a].closest('figure') && asidetags[a].nextElementSibling!=asidetags[a].closest('figure') && asidetags[a]!=asidetags[a].closest('figure')){
						var valid_elem=false;
					}
				}
				if(asidetags[a].closest('header')){
					var valid_elem=false;
				}
				if(valid_elem){
					var fragment = document.createElement('p');
					fragment.setAttribute('class','empty');
					asidetags[a].parentElement.insertBefore(fragment,asidetags[a].nextElementSibling);
				}				
			}	
		}
	}
	return true;
}