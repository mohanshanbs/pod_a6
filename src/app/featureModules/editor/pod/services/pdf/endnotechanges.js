endnoteChangesClass = function(chapter,folder,extension,index,projectlist,globalVariableFact,spinner,uploadURL,figclass,two_col){
    this.e_chapter=chapter;
    this.e_folder=folder;
    this.e_extension=extension;
    this.e_index=index;
    this.e_projectlist=projectlist;
    this.e_service_ip=globalVariableFact;
    this.e_spinner=spinner;
    this._uploadsURL = uploadURL;    
	this.e_figclass=figclass;
	this._twocolumn=two_col;
}
endnoteChangesClass.prototype.processRemarks= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var xml_url=this._uploadsURL+localStorage.getItem('projectstandard')+'/'+this.e_folder+"/s9ml/remarks.s9ml";										
	if (this.e_extension=='epub') {
		var xml_url=this._uploadsURL+localStorage.getItem('projectstandard')+'/'+this.e_folder+"/s9ml/remarks.xhtml";
	}
	var request = new XMLHttpRequest();
	request.open('GET', xml_url, false);  // `false` makes the request synchronous
	request.send(null);

	var atags=allTags.getElementsByTagName('a');
	var pending=atags.length;
	var ap=0;

	if (request.status === 200) {
	  	var remarks=request.responseText;
	  	remarks=remarks.replace(/<?.*?>/, '').replace(/<remarks/g,'<ul').replace(/<\/remarks>/g,'</ul>').replace(/<remark/g,'<li').replace(/<\/remark>/g,'</li>').replace(/<\/remarks>/g,'</ul>').replace(/<title\/>/g,'').replace(/<b\/>/g,'');
	  	document.getElementById('hiddenremarkdata').innerHTML=remarks;										  	
	  	var allremarks_data = document.getElementById('hiddenremarkdata');		
	  	var rd= remarks;
	  	var keys = rd.match(/<remark (.*?)<\/remark>/g);
	  	if (this.e_extension=='epub') {
	  		var keys = rd.match(/<aside (.*?)<\/aside>/g);
	  	}
	  	var li_tags=allremarks_data.getElementsByTagName('li');
	  	var rem_array=[];
		for(var at = atags.length - 1; at >= 0; at--){
			if (atags[at].href) {
				var ahref=atags[at].href;
				if(ahref.indexOf('remark') > -1){							            				
					if (this.e_extension=='epub') {
				  		var remark = ahref.split('#');
				  		if (remark) {
				  			remark=remark[1];
				  		}
				  	}else{
				  		var remark_value=ahref.match(/remark:(.*?)]/);
	    				if (remark_value) {
	    					var remark=remark_value[1].replace(/['"]+/g, ''); 										           
	    				}
				  	}
		            if(remark && rem_array.indexOf(remark) == -1){
		                var remark_ind=document.getElementById('hiddenremarkdata').querySelectorAll('[key="'+remark+'"]');
		                if (this.e_extension=='epub') {
		                	var remark_ind=document.getElementById('hiddenremarkdata').querySelectorAll('[id="'+remark+'"]');
		                }
		                if (remark_ind[0]) {
		                	var key=remark_ind[0].innerHTML;
			                if(remark_ind.length > 0){
			                  	key = key.replace(/data-uuid=.*">/, '');
			                  	key = key.replace(/data-uuid=.*"/, '');                                    
			                  	key=key.replace('key="'+remark+'">','');
			                  	key=key.replace('key="'+remark+'"','');
			                  	key=key.replace('</remark>','');
			                   	key=key.replace('<remark','');
			                  	key = key.replace(/key="(.*?)">/g, ''); 
			                  	key = key.replace(/<text>/g, '').replace(/<\/text>/g, '');
								if (this.e_extension=='epub') {
									var rem_p=remark_ind[0].getElementsByTagName('p');
									if (rem_p[0]) {
										var key=rem_p[0].innerHTML;
									}																			
								}
			                  	var remark_text=key;
			                  	var remarksStr=remark_text;
			                  	var suptags = remarksStr.match(/<sup>(.|\n)*?<\/sup>/g);
			                  	if (suptags) {                    
			                    	var number=suptags[0].replace(new RegExp("<sup>","g"),'').replace(new RegExp("</sup>","g"),'').replace(new RegExp(" ","g"),'');
			                  	}else{
			                    	var start_pos = remarksStr.indexOf('<text>') + 1;
			                    	var end_pos = remarksStr.indexOf('.',start_pos);
			                    	var num = remarksStr.substring(start_pos,end_pos)
			                      	var number=num.replace('text>','');
			                  	}
			                  	number=number.replace(/\s/g,'');										                  	
			                  	

								var symbol='';
								if(remark_text.indexOf('*') > -1 || remark_text.indexOf('&#42') > -1 || remark_text.indexOf('&ast;') > -1){
									symbol='*';
								}
								if(remark_text.indexOf('†') > -1 || remark_text.indexOf('&#8224;') > -1 || remark_text.indexOf('&dagger;') > -1){
									symbol='†';
								}
								if(remark_text.indexOf('‡') > -1 || remark_text.indexOf('&Dagger;') > -1 || remark_text.indexOf('&#8225;') > -1){
									symbol='‡';
								}
								if(parseInt(number, 10) > 0){ 
			                  		var symbol='';
			                  	}
							  	if(symbol!=''){														 
							  		var closest_tab=atags[at].closest('table,aside');
							  		if(closest_tab){
							  			var span_dag='<p class="tabft">'+remark_text+'</p>';
							  			closest_tab.insertAdjacentHTML('afterend',span_dag);
							  		}else{
							  			var span_dag='<span class="tab-fn" >'+remark_text+'</span>';
	        							if (atags[at].className) {
	        								var a_class_name=atags[at].className;
	        								if (atags[at].className=='no-break') {
	        									a_class_name=atags[at].className+' footnote-nobrk';
	        								}
	        								var span_dag_parent='<span class="'+a_class_name+'">'+span_dag+'</span>';
	        								// atags[at].innerHTML=atags[at].innerHTML+span_dag_parent;
	        								var tabfn=span_dag_parent
	        							}else{
	        								// atags[at].innerHTML=atags[at].innerHTML+span_dag;
	        								var tabfn=span_dag;
	        							}
	        							if(atags[at].closest('aside')){
	        								atags[at].closest('aside').insertAdjacentHTML('afterend',tabfn);
	        							}else{
	        								atags[at].innerHTML=atags[at].innerHTML+tabfn;
	        							}
							  		}						        							

	    							rem_array.push(remark);
	            				}
	    					}
		                }
					}
				}
			}
			ap++;
		}
	}	

	return true;
};		

endnoteChangesClass.prototype.processGlossary= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
		var styles=this.e_projectlist.defaultStyles();
									
	if (this.e_extension=='epub') {
		var url=this._uploadsURL+this.e_folder+"/s9ml/glossary.xhtml";
	}else{
		var url=this._uploadsURL+this.e_folder+"/s9ml/glossary/glossary_reader_0.html";		
	}
	var request = new XMLHttpRequest();
	request.open('GET', url, false);  // `false` makes the request synchronous
	request.send(null);

	// var atags=allTags.getElementsByTagName('a');
	var atags=allTags.querySelectorAll('[epub\\:type="glossref"]');
	var dfntype='glossref';
	if(atags.length==0){
		var atags=allTags.querySelectorAll('dfn[title]');
		dfntype='title';
	}
	
	if(this._eocpoptips){
		eoc_check=false;
	    var new_section=document.createElement('section');
	    new_section.setAttribute('class','mhhe-pod--eoc-keyterm-section');
		var new_header=document.createElement('header');
		var section_before=allTags.querySelectorAll('.mhhe-pod--eoc-keyterm-after,.mhhe-pod--eoc-keyterm,.mhhe-pod--eoc-keyterm-after-2col,.mhhe-pod--eoc-keyterm-2col');
	
		if(section_before.length>0){

			section_before=section_before[0];
				
			if(angular.element(section_before).hasClass("mhhe-pod--eoc-keyterm-after")||angular.element(section_before).hasClass("mhhe-pod--eoc-keyterm-after-2col")){
		

				var section_before_header=section_before.getElementsByTagName('header');
				if(section_before_header){
					section_before_header=section_before_header[0].firstElementChild;
					
					if(section_before_header){
						var nodename=section_before_header.nodeName.toLowerCase();
						var new_header_level=document.createElement(nodename);
						//new_header_level.className=section_before_header.classList;
							var p_styles = '';
				 	    // for (var s=0; s < styles.length; s++) {
				 	    //    p_styles += styles[s]+':'+this.e_projectlist.getPropValue(section_before_header, styles[s])+';';
				 	       
				 	    // }
				 	    styles.map(styles => p_styles +=styles+':'+this.e_projectlist.getPropValue(section_before_header, styles)+';');

				 	    new_header_level.setAttribute('style',p_styles);
				 	    if(section_before_header.innerText == section_before_header.innerText.toUpperCase())
				 	    {
				 	    	 new_header_level.innerText="KEY TERMS";
				 	    }
				 	   else{
				 	   		new_header_level.innerText="Key Terms";
				 	   }
				 	   
						new_header.appendChild(new_header_level);
						new_section.appendChild(new_header);
				 	   }
				 	   }

					}
				
			else if(angular.element(section_before).hasClass("mhhe-pod--eoc-keyterm")||angular.element(section_before).hasClass("mhhe-pod--eoc-keyterm-2col")){
						var section_before_header=section_before.getElementsByTagName('header');
			
					if(section_before_header){
						var clone_header = section_before_header[0].cloneNode(true); // "deep" clone
   						clone_header.removeAttribute('id');

						new_section.appendChild(clone_header);
					}
				
			}

				var div_eocterms=document.createElement('div');
			
			if(angular.element(section_before).hasClass('mhhe-pod--eoc-keyterm-after-2col') || angular.element(section_before).hasClass('mhhe-pod--eoc-keyterm-2col'))
			{	
				div_eocterms.classList.add('mhhe-pod--eoc-keyterm-div','mhhe-pod--eoc-2col-keyterm');
			}else{
				div_eocterms.setAttribute('class','mhhe-pod--eoc-keyterm-div');
			}eoc_check = true;
		}
			
		
			

		var margin_class=allTags.querySelectorAll('.mhhe-pod--introm,.mhhe-pod--bodym');
		for (var mc = 0; mc < margin_class.length; mc++) {
			margin_class[mc].classList.add('mhhe-pod--no-margin');
			margin_class[mc].classList.remove('mhhe-pod--introm');
			margin_class[mc].classList.remove('mhhe-pod--bodym');
		}
	}
	// if (this.e_extension=='zip') {
	// 	var atags=allTags.querySelectorAll('dfn[title]');
	// }
	// console.log(atags);
	// var pending=atags.length;
	// var ap=0;
	var lo=allTags.querySelectorAll('[aria-label="learning objectives"]');

	if(atags.length==0 && lo.length == 0){
		var margin_class=allTags.querySelectorAll('.mhhe-pod--introm,.mhhe-pod--bodym');
		for (var mc = 0; mc < margin_class.length; mc++) {
			margin_class[mc].classList.add('mhhe-pod--no-margin');
		}
	}


	if (request.status === 200) {
	  	var gloss=request.responseText;
	  	document.getElementById('hiddenglosdata').innerHTML=gloss;										  	
	  	var allgloss_data = document.getElementById('hiddenglosdata');	
	  
	  	var li_tags=allgloss_data.getElementsByTagName('li');
	  	var glos_array=[];
		for (var at = 0; at < atags.length; at++) {						
			var validdfn=true;	
			if(atags[at].closest('.mhhe-pod--eoc-2col-list') || atags[at].closest('.mhhe-pod--co-2col-list')){
				validdfn=false;
			}
			if ((atags[at].href || atags[at].title) && validdfn) {
				
				if (this.e_extension=='epub' && dfntype=='glossref') {
					var ahref=atags[at].href;
			  		var glossary = ahref.split('#');
			  		if (glossary) {
			  			glossary=glossary[1];
			  		}
			  	}else{
			  		var glossary=atags[at].title;
			  		// debugger;
			  		// var glossary_value=ahref.match(/glossary:(.*?)]/);
    			// 	if (glossary_value) {
    			// 		var glossary=glossary_value[1].replace(/['"]+/g, ''); 										           
    			// 	}
			  	}

	            if(glossary && glos_array.indexOf(glossary) == -1){
	                var glossary_ind=document.getElementById('hiddenglosdata').querySelectorAll('[key="'+glossary+'"]');
	                if (this.e_extension=='epub') {
	                	var glossary_ind=document.getElementById('hiddenglosdata').querySelectorAll('[id="'+glossary+'"]');		                	
					}
					if(glossary_ind.length==0){
	                	var glossary_ind=document.getElementById('hiddenglosdata').querySelectorAll('[title="'+glossary+'"]');	
	                }

	                if (glossary_ind[0]) {
	                	var key;
						var glossary_desc;
	                	if (this.e_extension=='epub') {
	                		key=glossary_ind[0].innerHTML;
	                		glossary_desc=glossary_ind[0].nextElementSibling;
	                	}else{
	                		if(glossary_ind[0].getElementsByTagName('p')){
	                			glossary_desc=glossary_ind[0].getElementsByTagName('p')[0];
	                		}
	                		if(glossary_ind[0].getElementsByTagName('b')){
	                			key=glossary_ind[0].getElementsByTagName('b')[0].innerHTML;
	                		}
	                	}	                	
		                if(glossary_ind.length > 0){
		                    var glossary_text=key;
							var glos_div=document.createElement('div');
							var append="";
		                    if(this._twocolumn){
		                    	append='-twocol';
		                    }
							glos_div.setAttribute('class','mhhe-pod--glos-entry'+append+'');
							glos_div.classList.add('minor-column');
							glos_div.setAttribute('minor_id','glos-term-'+(at+1));
							glos_div.classList.add('mhhe-pod--minor-float');

		                    var glos_title=document.createElement('p');
							glos_title.setAttribute('class','mhhe-pod--glos-title'+append+'');
							glos_title.classList.add('mhhe-pod--minor-float');
							glos_title.innerHTML=key;
		                    

		                    if(glossary_desc){
 								var glos_desc=document.createElement('span');
								glos_desc.setAttribute('class','mhhe-pod--margin-glos'+append+'');
								glos_desc.classList.add('mhhe-pod--minor-float');
								glos_desc.innerHTML=glossary_desc.innerHTML;
			                    glos_title.appendChild(glos_desc);	
		                    }

		                    glos_div.appendChild(glos_title);
		                    // if(atags[at].closest('p')){
							var glos_parent=atags[at].closest('p');
							var majorid="";
							if(glos_parent){
								glos_parent.classList.add('major-column');
								if(glos_parent.getAttribute('major_id')!=null && glos_parent.getAttribute('major_id')!='' && glos_parent.getAttribute('major_id')!=undefined){
									majorid=glos_parent.getAttribute('major_id')+' ';
								}
								glos_parent.setAttribute('major_id',majorid+'glos-term-'+(at+1));
								glos_parent.classList.add('glos-term-'+(at+1));
							}else{
								if(atags[at].parentElement) {
									atags[at].parentElement.classList.add('major-column');
									if(glos_parent.getAttribute('major_id')!=null && glos_parent.getAttribute('major_id')!='' && glos_parent.getAttribute('major_id')!=undefined){
										majorid=glos_parent.getAttribute('major_id')+' ';
									}
									atags[at].parentElement.setAttribute('major_id',majorid+'glos-term-'+(at+1));
									atags[at].parentElement.classList('glos-term-'+(at+1));
								}
							}
							
							if(!this._twocolumn){
								if(atags[at].closest('ul,ol')){
									glos_parent=atags[at].closest('ul,ol');
									if(glos_parent.closest('ul,ol')){
										glos_parent=glos_parent.closest('ul,ol');
									}
								}		                    
								if(atags[at].closest('[role=region],aside,table')){
									// var table_next=atags[at].closest('[role=region],aside,table').nextElementSibling;
									// var table_parent=atags[at].closest('[role=region],aside,table').parentElement;
									var glos_aside_parent=atags[at].closest('[role=region],aside,table');
									if(glos_aside_parent.previousElementSibling){
										if(glos_aside_parent.previousElementSibling.className.indexOf('mhhe-pod--glos-par') > -1){
											var glos_parent_new=glos_aside_parent.previousElementSibling;
										}else{
											var glos_parent_new=document.createElement('div');
											glos_parent_new.setAttribute('class','mhhe-pod--glos-par');
										}
									}else{
										var glos_parent_new=document.createElement('div');
										glos_parent_new.setAttribute('class','mhhe-pod--glos-par');
									}
									
									glos_parent_new.appendChild(glos_div);
									glos_aside_parent.parentElement.insertBefore(glos_parent_new,glos_aside_parent);
									glos_parent=glos_parent_new;
									
									if(glos_aside_parent.nodeName=='TABLE'){
										if(glos_aside_parent.offsetWidth > 510){
											glos_aside_parent.setAttribute('style','width:510px !important;');
										}else{
											glos_aside_parent.setAttribute('style','width:'+glos_aside_parent.offsetWidth+'px !important;');
										}
									}
								}else{
									glos_parent.classList.add('mhhe-pod--glos-par');
									glos_parent.parentElement.insertBefore(glos_div,glos_parent);
								}
							}else{
								if(!glos_parent) glos_parent=atags[at].parentElement;
								glos_parent.classList.add('mhhe-pod--glos-p-twocol');
								placeAfterGlosParent(glos_div,glos_parent.nextElementSibling,glos_parent);
							}
    					}
	                }
	                glos_array.push(glossary);
				}
			}
		}
	}	

	return true;
};		

function placeAfterGlosParent(glos,place,glos_parent){
	if(place){
		if(!place.classList.contains('mhhe-pod--glos-entry-twocol')){
			glos_parent.parentElement.insertBefore(glos,place);
		}else{
			placeAfterGlosParent(glos,place.nextElementSibling,glos_parent);
		}
	}else{
		glos_parent.parentElement.insertBefore(glos,place);
	}
}


endnoteChangesClass.prototype.moveHeadsUpNearPoptips= function(){
	// var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	// var sectiontags=allTags.getElementsByTagName('section');

	// for (var s = 0; s < sectiontags.length; s++) {
	// 	var glosterm_height=0;
	// 	var section_childrens_height=0;
	// 	var inside=false;
	// 	if(sectiontags[s].querySelectorAll('.mhhe-pod--glos-p').length > 0){
	// 		if(sectiontags[s].querySelectorAll('.mhhe-pod--glos-p')[sectiontags[s].querySelectorAll('.mhhe-pod--glos-p').length-1].nextElementSibling){
	// 			var sectiontowrap=sectiontags[s].querySelectorAll('.mhhe-pod--glos-p')[sectiontags[s].querySelectorAll('.mhhe-pod--glos-p').length-1].nextElementSibling;
	// 			inside=true;
	// 		}			
	// 	}else if(sectiontags[s].nextElementSibling){
	// 		var sectiontowrap=sectiontags[s].nextElementSibling;
	// 	}
	// 	if(sectiontags[s].querySelectorAll('.mhhe-pod--glos-entry').length > 0 && sectiontowrap){
	// 		var glosterms=sectiontags[s].querySelectorAll('.mhhe-pod--glos-entry');
	// 		for (var g = 0; g < glosterms.length; g++) {
	// 			glosterm_height+=glosterms[g].offsetHeight;
	// 		}
	// 		if(inside){
	// 			var section_childrens=sectiontags[s].querySelectorAll('.mhhe-pod--glos-p');
	// 			for (var sc = 0; sc < section_childrens.length; sc++) {
	// 				section_childrens_height+=section_childrens[sc].offsetHeight;										
	// 			}
	// 			var actual_section_height=section_childrens_height;
	// 			var last_p=section_childrens[section_childrens.length-1];
	// 		}else{
	// 			var actual_section_height=sectiontags[s].offsetHeight-glosterm_height;
	// 			var last_p=sectiontags[s].lastElementChild;
	// 		}	
	// 		// if(sectiontags[s].id=='d8062ad326154a3ea2bf347d2a6ab2f5'){
	// 		// 	console.log(sectiontags[s],actual_section_height,glosterm_height);	
	// 		// 	debugger;
	// 		// }
				
	// 		if(actual_section_height < glosterm_height){
	// 			// this.calculateParaHeight(elem,elem_height,nxt_p,total_p_height,final_height,updated_place,'',false,modeltype);
	// 			var calp=this.e_figclass.calculateParaHeight(last_p,glosterm_height,sectiontowrap,sectiontowrap.offsetHeight,0,last_p.nextElementSibling);
	// 			// if(calp){

	// 			// }
	// 		}
	// 	}
	// }
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var glos_parents=allTags.querySelectorAll('p.mhhe-pod--glos-p');
	for (var gp = 0; gp < glos_parents.length; gp++) {
		var glosterm_height=0;
		var grand_parent=glos_parents[gp].closest('section');
		if(grand_parent){
			var glosterms=grand_parent.querySelectorAll('.mhhe-pod--glos-entry');
			for (var g = 0; g < glosterms.length; g++) {
				glosterm_height+=glosterms[g].offsetHeight;
			}
		}
		
	}
	return true;
};