EOCChangesClass = function(projectlist,two_col=false){ 
	this._projectlist=projectlist;
	this._twocolumn=two_col;
}

EOCChangesClass.prototype.EOCSplit= function(){	
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var all_list = allTags.querySelectorAll('ul,ol,p');

	for(var al=0;al<all_list.length;al++){
		var valid_keyterm=false;
		var prev_elem=all_list[al].previousElementSibling;
		var eoc_title=[];
		if(prev_elem){
			eoc_title=prev_elem.querySelectorAll("[class~=key-term],[class~=keyterm],[class~=eoc],[class~=EOC],[class~=summary],[class~=h2_custome],[class~=rule]");
		}
		var closest_div=findAncestor(all_list[al]);
		if(all_list[al].className.indexOf('keyterm') >-1 || all_list[al].className.indexOf('key-term') >-1 || all_list[al].className.indexOf('key_term') >-1 || all_list[al].className.indexOf('') >-1){
			valid_keyterm=true;
		}

		if(closest_div || eoc_title || valid_keyterm){
			if(closest_div!=null || eoc_title.length > 0 || valid_keyterm){          				

				if(eoc_title.length > 0 || all_list[al].className.indexOf('mhhe-pod--eoc-2col-list') >-1){
					var li_atags=all_list[al].getElementsByTagName('a');
					for(var at = li_atags.length - 1; at >= 0; at--){
						var anchor = li_atags[at];
						var span = document.createElement("span");
						span.innerHTML = anchor.innerHTML;
						span.className=anchor.className;
						span.classList.add('mhhe-pod--wdbrk');
						// var page_num=span.innerHTML.replace(/Page /g,'').replace(/\s/g,'').replace(/\s/g,'').replace (/"/g,'').replace('(','').replace(')','').replace(/\D/g,'');

						// console.log(page_num,span);
						anchor.parentElement.replaceChild(span,anchor);
						if(span.innerHTML.indexOf('Page ') > -1){
							if(span.innerHTML.length<=8){
								if(span.parentElement){
									this._projectlist.clean(span.parentElement);
									if(span.parentElement.childNodes.length <= 2){
										if(span.parentElement.childNodes[1]){
											if(span.parentElement.childNodes[1].nodeValue.length<=2){
												span.parentElement.parentElement.removeChild(span.parentElement);
											}
										}else{
											span.parentElement.parentElement.removeChild(span.parentElement);
										}										
									}
								}								
							}
						}						
					}
				}
				var closest_list=all_list[al].closest('li');

				// if(!closest_list){				
				// 	all_list[al].classList.add('mhhe-pod--eoc-2col-list');
				// }				
			}
		}
	}

	// var all_p = allTags.getElementsByTagName('p');
	// for(var ap=0;ap<all_p.length;ap++){
	// 	var next_elem=all_p[ap].nextElementSibling;  					
	// 	if(next_elem){
	// 		var next_elem_next_elem=next_elem.nextElementSibling;
	// 		if(next_elem_next_elem){
	// 			if(next_elem.nodeName=='P' && next_elem_next_elem.nodeName=='P'){
	// 				var prev_elem=all_p[ap].previousElementSibling;
 //      			if(prev_elem){
 //      				var eoc_title=prev_elem.querySelectorAll("[class~=key-term],[class~=keyterm]");
 //      			}
 //      			var closest_div=findAncestor(all_p[ap]);
 //      			if(closest_div || eoc_title){
 //          			if(closest_div!=null || eoc_title.length > 0){
 //          				all_p[ap].insertAdjacentText('beforebegin','___beforeeoc__');
 //          				var last_p=findLastParticularTag(all_p[ap],'P');
 //          				last_p.insertAdjacentText('afterend','__aftereoc__');
 //          			}
 //          		}
	// 			}
	// 		}  						
	// 	}  					
	// }

	// document.getElementById('hiddenfinalhtml').contentDocument.body.innerHTML = document.getElementById('hiddenfinalhtml').contentDocument.body.innerHTML.replace(new RegExp("___beforeeoc__","g"),'<div class="mhhe-pod--eoc-2col-list">').replace(new RegExp("__aftereoc__","g"),'</div>');
	
	return true;
};

EOCChangesClass.prototype.keytermList= function(){	
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var dfntags=allTags.getElementsByTagName("dfn");
	if (dfntags.length >= 5) {
		for(var x=0;x<dfntags.length;x++){ 
			var parent=dfntags[x].parentElement;

			// if(parent.className.indexOf('wdbrk') > -1){
				parent=parent.parentElement;
				//this._projectlist.clean(parent);
			// }

		var parent_next_sib=parent.nextElementSibling;
		var parent_next_sib_nodename='';
		if(parent_next_sib){ 
			parent_next_sib_nodename=parent_next_sib.nodeName;
			var parent_next_sib_dfn=parent_next_sib.getElementsByTagName("dfn").length;
		}else{
			var parent_next_sib_dfn=0;
		}
		var parent_prev_sib=parent.previousElementSibling;
		var parent_prev_sib_nodename='';
		if(parent_prev_sib){ 
			parent_prev_sib_nodename=parent_prev_sib.nodeName;
			var parent_prev_sib_dfn=parent_prev_sib.getElementsByTagName("dfn").length;
		}else{
			var parent_prev_sib_dfn=0;
		}	

		var page_num_dfn=false;
		var next_text_node='';
		if (parent.childNodes.length == 2) {
			var prev_text_node=parent.childNodes[0].textContent.replace(/\s/g,'');			
			next_text_node=parent.childNodes[1].textContent.replace(/\s/g,'').replace (/"/g,'');		
			var number_dfn=next_text_node.replace('(','').replace(')','');
	
			number_dfn=number_dfn.replace(/\D/g,'');
			if(number_dfn > 0){
				if(number_dfn.length <=4 && next_text_node.length<=5){
					var page_num_dfn=true;
				}
			}
		} 
		valid_dfn=false;
		if(parent.childNodes[1]){
			next_text_node=parent.childNodes[1].textContent.replace(/\s/g,'').replace (/"/g,'');
		}
		
		if (parent.childNodes.length == 2 && (next_text_node=='' || page_num_dfn==true)) {
			var valid_dfn=true;
		}	

		if (page_num_dfn== true) {
			parent.childNodes[1].parentElement.removeChild(parent.childNodes[1]);
		}	

		if(parent.nodeName==parent_prev_sib_nodename || parent.nodeName==parent_next_sib_nodename){
			if ( parent_next_sib_dfn > 0 || parent_prev_sib_dfn > 0) {
				if(parent_prev_sib_nodename!=parent.nodeName){
					if(parent.nodeName=='LI'){
						
						if (parent.childNodes.length==1 || valid_dfn==true) {
							var closest_list=parent.closest('li');
							if(!closest_list){
								//parent.parentElement.classList.add("mhhe-pod--eoc-2col-list");
							}
						}
					}else{
						var parparelement=parent.parentElement;
						if (parent.nodeName=='P' && (parent.childNodes.length==1 || valid_dfn==true)) {
								//parent.insertAdjacentText('beforebegin','___beforekeytermli__');
						}															
					}
				}

				if(parent_next_sib_nodename!=parent.nodeName){
					if(parent.nodeName!='LI'){														
						
						if (parent.nodeName=='P' && (parent.childNodes.length==1 || valid_dfn==true)) {
							//parent.insertAdjacentText('afterend','___afterkeytermli__');
						}
					}
				}
			}											
		}

		var parentofparent=parent.parentElement;
		var parentofparent_next_sib=parentofparent.nextElementSibling;
		var parentofparent_next_sib_nodename='';
		if(parentofparent_next_sib){ 
			parentofparent_next_sib_nodename=parentofparent_next_sib.nodeName;
		}
		var parentofparent_prev_sib=parentofparent.previousElementSibling;
		var parentofparent_prev_sib_nodename='';
		if(parentofparent_prev_sib){ 
			parentofparent_prev_sib_nodename=parentofparent_prev_sib.nodeName;
		}

		if(parentofparent.nodeName==parentofparent_prev_sib_nodename || parentofparent.nodeName==parentofparent_next_sib_nodename){
			if(parentofparent_prev_sib_nodename!=parentofparent.nodeName){
				if(parentofparent.nodeName=='LI'){
					
					if (parent.childNodes.length==1 || valid_dfn==true) {
						var closest_list=parentofparent.parentElement.closest('ul,ol');				
						
						if(!closest_list){
							//parentofparent.parentElement.classList.add("mhhe-pod--eoc-2col-list");
						}
					}		
				}
			}											
		}

	}
		// document.getElementById('hiddenfinalhtml').contentDocument.body.innerHTML = document.getElementById('hiddenfinalhtml').contentDocument.body.innerHTML.replace(new RegExp("___beforekeytermli__","g"),'<div class="mhhe-pod--eoc-2col-list">').replace(new RegExp("___afterkeytermli__","g"),'</div>');
	} 
	return true;
};

EOCChangesClass.prototype.EOCSplitCustom= function(){	
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var ultags=allTags.querySelectorAll("ol.mhhe-pod--eoc-2col-list,ul.mhhe-pod--eoc-2col-list");
	if(this._twocolumn){
		var ultags=allTags.querySelectorAll(".mhhe-pod--2col ol,.mhhe-pod--2col ul");
	}
	// debugger;
	for (var u = 0; u < ultags.length; u++) {
		if(ultags[u].className.indexOf('ulprocessed')<=-1){
			ultags[u].classList.add('ulprocessed');
			var ultag=ultags[u];
			var litags=ultag.getElementsByTagName('li');
		    var place=ultags[u];	
			var customul_set=false;
			if(ultags[u].getAttribute("start")!=null){
				var start=ultags[u].getAttribute("start");
			}else{
				var start=1;
			}			
			var newul='';
			for (var a = 0; a < litags.length; a++) {
				if(litags[a].parentElement==ultags[u]){
					var litag=litags[a];
					if(litag.className.indexOf('liprocessed')<=-1){
						litag.classList.add('liprocessed');
						if(litag.querySelectorAll("figure,table").length > 0){
							console.log(litag);
							var lichildren=litag.children;
							if(lichildren[0].nodeName=='P' && newul){
								var newli=document.createElement('li');
								newli.appendChild(lichildren[0]);
								newul.appendChild(newli);
								start++;
								// debugger;
							}else{
								start++;
							}
							// debugger;							
							var customul=document.createElement('ul');
							var classname=ultag.className.replace(' mhhe-pod--eoc-2col-list','').replace('mhhe-pod--eoc-2col-list','').replace(' 2colul','');
							customul.setAttribute('style','list-style: none;');
							customul.setAttribute('class',classname);
							customul.classList.add('ulprocessed');
							// customul.setAttribute('start',start+1);
							customul.appendChild(litags[a]);
							ultags[u].parentElement.insertBefore(customul,ultags[u]);
							customul_set=true;

							// if(litag.id=='data-uuid-d387d889641a45b3a269ebd69f2fb537'){
							// 	debugger;
							// }
							// start++;				
							a--;							
						}else{
							if(customul_set){
								start++;
								var newul=document.createElement(ultag.nodeName);
								var classname=ultag.className.replace(' 2colul','').replace('2colul','');
								newul.setAttribute('class',ultag.className);
								newul.setAttribute('start',start);
								newul.appendChild(litags[a]);
								place.parentElement.insertBefore(newul,place);
								customul_set=false;
								a--;								
							}else{							
								if(!newul){
									var newul=document.createElement(ultag.nodeName);
									var classname=ultag.className.replace(' 2colul','').replace('2colul','');
									newul.setAttribute('class',ultag.className);
									newul.setAttribute('start',start);
									newul.appendChild(litags[a]);
									place.parentElement.insertBefore(newul,place);
									// start++;
								}
								if(litags[a] && newul){
									newul.appendChild(litags[a]);
									// start++;
								}	
								start++;							
								a--;
								
							}
						}						
					}
				}				 
		    }
		}	
	}	
}	

EOCChangesClass.prototype.setParentForTwoColumn=function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var all_li = allTags.querySelectorAll('ul,ol');

	for(var al=0;al<all_li.length;al++){		
		if(all_li[al].querySelectorAll(".step-info").length > 0){
			if(all_li[al].closest(".mhhe-pod--introm")){				
				var li_par_div=document.createElement('div');
				// li_par_div.setAttribute('class','mhhe-pod--co-2col-list');
				li_par_div.innerHTML=all_li[al].outerHTML;
				all_li[al].parentElement.insertBefore(li_par_div,all_li[al]);
				all_li[al].parentElement.removeChild(all_li[al]);	
			}
		}
	}
	return true;
};

function findLastParticularTag(el,tag){
	if(el.nextElementSibling){
		if (el.nextElementSibling.nodeName == tag) {  						
			return findLastParticularTag(el.nextElementSibling,tag);
		}else{
			return el;
		}
	}else{
		return el;
	}
}


function findAncestor (el) {
    while ((el = el.parentElement) && el.className.toLowerCase().indexOf('eoc') <= -1 && el.className.toLowerCase().indexOf('card-market part-two') <= -1);
    return el;
}

