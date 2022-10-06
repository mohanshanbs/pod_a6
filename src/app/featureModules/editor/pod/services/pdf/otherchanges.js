otherChangesClass = function(extension,projectlist,folder,baseUrl){
    this._extension=extension;
    this._projectlist=projectlist;
    this._folder=folder;
    this.baseUrl=baseUrl;
}
// ,h2,h3

otherChangesClass.prototype.createTOC= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var headertags=allTags.getElementsByTagName("header");

	var toc_content='<div class="toc-con">\n\r<p class="tocs">Table Of Contents</p>\n\r<ul class="toc1">\n\r';
	var tags = [ "h1","h2","h3"];
	var all_headings = [];		
	all_headings = allTags.querySelectorAll('h1');
	var diff_h1=false;
	var txt_exist='';
    for (var ah = 0; ah < all_headings.length; ah++) {	
	    var all_headings_txt='';
		var h1_txt="";
		var h2_txt="";
		var h3_txt="";
		var diff_h1_txt="";						    	
	    var closest_aside=all_headings[ah].closest('aside');
	    var closest_header=all_headings[ah].closest('header');
			if (!closest_aside) {
		    if (all_headings[ah]) {
		    	
		    	if (closest_header) {								    		
			    	if (closest_header.className.indexOf('chapter_opener') > -1 || closest_header.className.indexOf('chapter-intro') > -1) {
						var header_childrens=closest_header.children;
						for (var hc = 0; hc < header_childrens.length; hc++) {														
							if (header_childrens[hc].className.indexOf('page-number') == -1 && header_childrens[hc].className.indexOf('chp-no') == -1 && header_childrens[hc].className.indexOf('part-no') == -1 && header_childrens[hc].className.indexOf('unit_number') == -1 && header_childrens[hc].className.indexOf('unit-number') == -1) 
							{
								diff_h1_txt+=header_childrens[hc].innerText+'&nbsp;';
							}																										
						}

						if(diff_h1_txt && (diff_h1==false || txt_exist!=diff_h1_txt)){
							all_headings_txt+='<h1 class="toc-level1">'+diff_h1_txt+'</h1>';
							diff_h1=true;	
							var txt_exist=diff_h1_txt;
						}
					}else{
						var header_childrens=closest_header.querySelectorAll('h1,h2,h3');	

						for (var hc = 0; hc < header_childrens.length; hc++) {
							
							if (header_childrens[hc].className.indexOf('page-number') == -1 && header_childrens[hc].className.indexOf('chp-no') == -1 && header_childrens[hc].className.indexOf('part-no') == -1 && header_childrens[hc].className.indexOf('unit_number') == -1 && header_childrens[hc].className.indexOf('unit-number') == -1) {
								if (header_childrens[hc].nodeName == 'H1') {
									h1_txt+=header_childrens[hc].innerText+'&nbsp;';
								}else if (header_childrens[hc].nodeName == 'H2') {
									h2_txt+=header_childrens[hc].innerText+'&nbsp;';
								}else if (header_childrens[hc].nodeName == 'H3') {
									h3_txt+=header_childrens[hc].innerText+'&nbsp;';
								}
							}
						}
																
					}	
		    	}else{
					if (all_headings[ah].nodeName == 'H1') {
						all_headings_txt+='<h1 class="toc-level1">'+all_headings[ah].innerText+'</h1>';
					}else if (all_headings[ah].nodeName == 'H2') {
						all_headings_txt+='<h2 class="toc-level2">'+all_headings[ah].innerText+'</h2>';
					}else if (all_headings[ah].nodeName == 'H3') {
						all_headings_txt+='<h3 class="toc-level3">'+all_headings[ah].innerText+'</h3>';
					}										
				}		
		    }
		    if (closest_header && closest_header.className.indexOf('settoc') == -1) {
		    	if(h1_txt!=''){
					all_headings_txt+='<h1 class="toc-level1">'+h1_txt+'</h1>';
					h1_txt="";
				}

				if (h2_txt!='') {
					all_headings_txt+='<h2 class="toc-level2">'+h2_txt+'</h2>';
					h2_txt="";
				}

				if (h3_txt!='') {
					all_headings_txt+='<h2 class="toc-level2">'+h3_txt+'</h2>';
					h3_txt="";
				}
				closest_header.classList.add('settoc');
		    }
			
			all_headings_txt = all_headings_txt.replace(/Page(.*?)&nbsp;/, '');
			if (all_headings_txt!='') {								
				toc_content+='<li><a href="#toc_header'+ah+'">'+all_headings_txt+'</a></li>\n\r';
				all_headings[ah].setAttribute('id','toc_header'+ah);
			}

			if (diff_h1_txt!='') {
				toc_content+='</ul>\n\r<ul class="toc2">';
			}
		}
	}
	toc_content+='</ul>\n\r</div>\n\r';
	var first_page=document.getElementById('hiddenfinalhtml').contentDocument.getElementById('page-1');
	if(first_page){
		first_page.innerHTML=toc_content+first_page.innerHTML;
	}

	return true;
};

otherChangesClass.prototype.removeAnswerText= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var answertags = allTags.getElementsByClassName('answer');
	var keyTerms = allTags.getElementsByClassName('key_terms');
	for (var a = 0; a < answertags.length; a++) {
	    answertags[a].parentElement.removeChild(answertags[a]);
	    a--;
	}
	var newSec = document.createElement("SECTION");
	newSec.id= "key_terms_wrapper";
		newSec.classList.add("mhhe-pod--eoc-3col-list");

	for(var i = 0; i<keyTerms.length; i++){
		while (keyTerms[i].childNodes.length > 0) {
    			newSec.appendChild(keyTerms[i].childNodes[0]);
		}
		keyTerms[i].appendChild(newSec);
  			keyTerms[i].insertBefore(keyTerms[i].children[0].children[0], keyTerms[i].childNodes[0]);
	}

	return true;
};

otherChangesClass.prototype.addMultiColumn = function(){ 
	splitColumn('world-of-business',2);
	splitColumn('competing-globalization',3);
	splitColumn('integrity-in-action',3);
	splitColumn('summary',2);
	splitColumn('discussion',2);
	splitColumn('exercisestrategy',2);
	splitColumn('managingpeople',2);
	splitColumn('hrinsmallbusiness',2);
	splitColumn('notes',2);

	return true;
};

function splitColumn(classname,splitcount){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var multi_col_tags = allTags.getElementsByClassName(''+classname+'');

		for(var i = 0; i<multi_col_tags.length; i++){ console.log(i)
			var newSec = document.createElement("SECTION");
		newSec.classList.add("mhhe-pod--eoc-"+splitcount+"col-list");
			var e = multi_col_tags[i];
			if(e.nodeName.toLowerCase() == "h1"){
				e = e.parentNode.parentNode;
			}
			var t = false;
		while (e.children.length > 0) {
			if(e.children[0].classList.contains("scrobile_container")){
				t = true;
			}
			   
				newSec.appendChild(e.children[0]);
    		
		}

		e.appendChild(newSec);

		if(t){
			console.log(newSec)
			for(var j= 0;j < newSec.children.length;j++){
				if(newSec.children[j].classList.contains("scrobile_container")){
					newSec.parentNode.appendChild(newSec.children[j]);
				}
			}

		}
	    e.insertBefore(e.children[0].children[0], e.childNodes[0]);
	}
}


otherChangesClass.prototype.createSpanClassForHyperLinks= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var hyplinks=allTags.getElementsByTagName('a');
	for (var h = 0; h < hyplinks.length; h++) {									
		// if(hyplinks[h].className!=''){
			if(hyplinks[h].href.indexOf('assets/longdesc') > -1){
				var hyplink_parent=hyplinks[h].parentElement;
				hyplink_parent.innerHTML=hyplink_parent.innerHTML.trim();
				if(hyplink_parent.children.length <=1){
					hyplinks[h].parentElement.parentElement.removeChild(hyplinks[h].parentElement);
				}
			}else{
				var aspan = document.createElement('span');
				aspan.setAttribute('class',hyplinks[h].className);		

				switch (hyplinks[h].innerHTML.toLowerCase()) {
				    case 'chapter':
				    case 'figure':
				    case 'table':
				        aspan.classList.add('mhhe-pod--hyper-link');
				}

				if(hyplinks[h].href){
					var domain=getHostName(hyplinks[h].href);
					if(domain){
						if(this.baseUrl.indexOf(domain) == -1){
							aspan.classList.add('mhhe-pod--wdbrk');
						}
					}
				}
				

				var hypChildNodes = hyplinks[h].childNodes;  
				for (var hc = 0; hc < hypChildNodes.length;hc++) {
					aspan.appendChild(hypChildNodes[hc]);
				}			
				hyplinks[h].insertBefore(aspan, hyplinks[h].firstChild);
			}
			
		// }
	}
	return true;
}

function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
}

// otherChangesClass.prototype.removeScrollableContainerClasses= function(){
// 	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
// 	var scrollable_removable=allTags.querySelectorAll('[class*=scrobile_container]');
// 	for (var sc = 0; sc < scrollable_removable.length; sc++) {									
// 		if(scrollable_removable[sc].querySelectorAll('table').length > 0){
// 			var prefix='scrobile_container';
// 			var regx = new RegExp('\\b' + prefix + '.*?\\b', 'g');
//     		scrollable_removable[sc].className = scrollable_removable[sc].className.replace(regx, '');
//     		scrollable_removable[sc].className=scrollable_removable[sc].className.trim();
// 	    }
// 	}
// 	return true;
// }

otherChangesClass.prototype.reduceFontBheads= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var bheads=allTags.querySelectorAll('h2');
	for (var bh = 0; bh < bheads.length; bh++) {						
		if(window.getComputedStyle(bheads[bh]).textTransform=="uppercase"){
			bheads[bh].classList.add('mhhe-pod--bhead-caps');
	    }
	}
	return true;
}

otherChangesClass.prototype.moveBlockQuoteUp= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var blockquote_elems = allTags.querySelectorAll(".note,.block");
	var styles=this._projectlist.defaultStyles();	

	for (var bq = 0; bq < blockquote_elems.length; bq++) {
		if(blockquote_elems[bq].firstElementChild && this._projectlist.getPropValue(blockquote_elems[bq], 'float') == 'none'){
			if(blockquote_elems[bq].firstElementChild.nodeName=='P'){
				var p_styles = '';
				var para=blockquote_elems[bq].firstElementChild;

				var bQ_P_styles = '';
		 	    for (var si=0; si < styles.length; si++) {
		 	    	if(styles[si]!='float' && styles[si]!='width' && styles[si]!='height'){
		 	    		bQ_P_styles += styles[si]+':'+this._projectlist.getPropValue(blockquote_elems[bq], styles[si])+';';
		 	    	}		 	       
		 	    }
				para.setAttribute('style',bQ_P_styles);
				blockquote_elems[bq].parentElement.insertBefore(para,blockquote_elems[bq]);	
				if(blockquote_elems[bq].innerHTML.trim()==''){
					blockquote_elems[bq].parentElement.removeChild(blockquote_elems[bq]);
				}		    
			}
		}
	}
	
	return true;
};

otherChangesClass.prototype.removeEmptyTagsSetFloatClass= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var allelems=allTags.body.getElementsByTagName("*");
	for (var y = 0, len = allelems.length; y < len; y++) {
		if(allelems[y]){
			var eFloat=document.defaultView.getComputedStyle(allelems[y], null).getPropertyValue("float");
			// if(allelems[y].className.indexOf('mhhe-pod--minor-float') == -1){
				if(eFloat!='none' || allelems[y].getAttribute("aria-label")=="learning objectives"){
					allelems[y].classList.add('mhhe-pod--minor-float');
					setFloatClassChildren(allelems[y]);
				}
			// }
			
			var content=allelems[y].innerHTML.trim();
			if(content=='' || allelems[y].className == "digital") {
				// if(allelems[y].nodeName){
				// 	console.log(allelems[y], "node=",allelems[y].nodeName)
				// 	if(allelems[y].nodeName!='TABLE' && allelems[y].nodeName!='TR' && allelems[y].nodeName!='TD' && allelems[y].nodeName!='TH' && allelems[y].nodeName!='COL' && allelems[y].nodeName!='COLGROUP' && allelems[y].className.indexOf('wrapperpg')<= -1 && allelems[y].nodeName!='IMG' && allelems[y].nodeName!='LINK' && allelems[y].nodeName!='META' && !allelems[y].closest('math') && allelems[y].nodeName!='BR' && allelems[y].nodeName!='SPAN' && allelems[y].nodeName!='EM' && allelems[y].nodeName!='STRONG'){
				// 		allelems[y].remove();
				// 		y--;
				// 	}
				// }
				if(allelems[y].nodeName){
					if(allelems[y].nodeName!='TABLE' && allelems[y].nodeName!='TR' && allelems[y].nodeName!='TD' && allelems[y].nodeName!='TH' && allelems[y].nodeName!='COL' && allelems[y].nodeName!='COLGROUP' && allelems[y].nodeName!='IMG' && allelems[y].nodeName.toUpperCase()!='IMAGE' && allelems[y].nodeName!='LINK' && allelems[y].nodeName!='META' && !allelems[y].closest('math') && allelems[y].nodeName!='BR' && allelems[y].nodeName!='IFRAME' && allelems[y].nodeName!='SPAN' && allelems[y].nodeName!='EM' && allelems[y].nodeName!='STRONG'){
						if(allelems[y].className){
							if(allelems[y].className.indexOf('wrapperpg')<= -1){
								allelems[y].remove();
								y--;
							}
						}
					}
				}
			}
		}                           
	}
	return true;
};


function setFloatClassChildren(elem){
	var floatChildren=elem.children;
	for (var fc = 0, len = floatChildren.length; fc < len; fc++) {
		floatChildren[fc].classList.add('mhhe-pod--minor-float');
		if(floatChildren[fc].children.length > 0){
			setFloatClassChildren(floatChildren[fc]);
		}
	}
	return true;
}