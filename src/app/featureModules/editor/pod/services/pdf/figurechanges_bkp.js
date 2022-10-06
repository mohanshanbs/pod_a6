figureChangesClass = function(projectlist,two_col=false,chapter_number){ 
	this._projectlist=projectlist;
	this._twocolumn=two_col;
	this._chp_no=chapter_number;
}
figureChangesClass.prototype.addBgclrFig= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var bf_figuretags=allTags.getElementsByTagName("figure");

	for(var bf=0;bf<bf_figuretags.length;bf++){ 		
		if(bf_figuretags[bf].className.indexOf('figfloatright')<=-1){
			var f_img=bf_figuretags[bf].getElementsByTagName('img');
			if(f_img.length > 0){
				bf_figuretags[bf].className=bf_figuretags[bf].className+' '+f_img[0].className;
				f_img[0].className='';
			}
			
			if(f_img.length > 0){
				if(f_img[0].offsetHeight == 0){
					// f_img[0].style.setProperty("height", "150%", "important");
				}else if(f_img[0].offsetHeight > 800){
					f_img[0].setAttribute('class','mhhe-pod--big-img');
				}							
			}		

			if(bf_figuretags[bf].offsetHeight > 700 && bf_figuretags[bf].getElementsByTagName('figcaption').length > 0){
				// console.log(bf_figuretags[bf],bf_figuretags[bf].offsetHeight);
				// if(bf_figuretags[bf].id=='00d0f06a0b2a4770952cb779170c38e1'){
				// 	debugger;
				// }
				if(f_img.length > 0 && bf_figuretags[bf].getElementsByTagName('figcaption')[0].offsetHeight > 200){
					// f_img[0].setAttribute('height','470px;');	
					f_img[0].style.setProperty('width','470px','important');						
				}				
			}		

			bf_figuretags[bf].classList.add('tmp_fig');
			var fig_next_elem=bf_figuretags[bf].nextElementSibling;	
		}									
	}

	var figuretags=document.getElementById('hiddenfinalhtml').contentDocument.querySelectorAll("[class*=tmp_fig]");
	var img_caption=parseFloat(this._chp_no)+0.1;
	var tab_caption=parseFloat(this._chp_no)+0.1;
	var math_caption=parseFloat(this._chp_no)+0.1;
	for(var f=0;f<figuretags.length;f++){			

		if(figuretags[f].getElementsByTagName('img').length == 0 && figuretags[f].getElementsByTagName('math').length > 0){
			figuretags[f].classList.add('mhhe-pod--math-fig');
		}
		var stacked_fig=false;
		if(figuretags[f].parentElement){
			if(figuretags[f].parentElement.nodeName=='FIGURE'){
				if(figuretags[f].parentElement.getElementsByTagName('figure').length > 1){
					stacked_fig=true;
				}
			}else{
				if(figuretags[f].parentElement.parentElement){
					if(figuretags[f].parentElement.parentElement.nodeName=='FIGURE'){
						if(figuretags[f].parentElement.parentElement.getElementsByTagName('figure').length > 1){
							stacked_fig=true;
						}
					}
				}
			}
			
		}

		if(figuretags[f].getElementsByTagName('figure').length > 1){
			stacked_fig=true;
		}
	

		var fig_next_elem_sib=figuretags[f].nextElementSibling;			
		var figparent=figuretags[f].parentElement;
		if(fig_next_elem_sib && figparent.nodeName=='FIGURE'){
			var fig_next_next_elem_sib=fig_next_elem_sib.nextElementSibling;
			var stacked_img_width=figuretags[f].offsetWidth+fig_next_elem_sib.offsetWidth;	
			if(fig_next_elem_sib.nodeName=='FIGURE'){
				if(figuretags[f].parentElement){
					if(figuretags[f].parentElement.nodeName=='FIGURE'){
						if(figuretags[f].parentElement.parentElement){
							if(figuretags[f].parentElement.parentElement.children.length==1){
								figuretags[f].parentElement.style.setProperty('width','100%','important');
								figuretags[f].parentElement.classList.add('mhhe-pod--stacked-fig');
								figuretags[f].parentElement.parentElement.style.setProperty('width','100%','important');
								figuretags[f].parentElement.parentElement.classList.add('mhhe-pod--stacked-parent-div');
							}
						}						
					}
				}

				var hor_fig_div=document.createElement('div');
				hor_fig_div.setAttribute('class','mhhe-pod--stacked-div');
			
				figuretags[f].style.setProperty('display','table-cell','important');
				figuretags[f].style.setProperty('width','50%','important');	

				fig_next_elem_sib.style.setProperty('width','50%','important');
				fig_next_elem_sib.style.setProperty('display','table-cell','important');	

				hor_fig_div.appendChild(figuretags[f]);
				hor_fig_div.appendChild(fig_next_elem_sib);
				figparent.insertBefore(hor_fig_div,fig_next_next_elem_sib);
			}
		}		
		if (figuretags[f].getElementsByTagName('table').length > 0 || figuretags[f].getElementsByTagName('aside').length > 0 || figuretags[f].querySelectorAll("[role=region]").length > 0) {
			figuretags[f].setAttribute("style", '-webkit-column-break-inside: auto!important;page-break-inside: auto!important;break-inside: auto!important;');
		}        			
		if (figuretags[f].children.length == 3) {
			if (figuretags[f].children[0].nodeName=='FIGCAPTION' && figuretags[f].children[1].nodeName=='IMG' && figuretags[f].children[2].nodeName=='P') { 			
				var figp=figuretags[f].children[2];		
			    var fig_p_tag_bg_color=window.getComputedStyle(figp).backgroundColor;

			    if(!fig_p_tag_bg_color || fig_p_tag_bg_color=='transparent' || fig_p_tag_bg_color=='#000000' || fig_p_tag_bg_color=='rgba(0, 0, 0, 0)'){
			    	fig_p_tag_bg_color='#fff';
			    }

			    // debugger;
			    var rgbtohex=this._projectlist.componentToHex(fig_p_tag_bg_color);
				figuretags[f].getElementsByTagName('p')[0].setAttribute('style','background-color:'+rgbtohex+';');	
			  	var div_inside_fig_parent=document.createElement("div");
				div_inside_fig_parent.setAttribute('class','ctr');
				var div_inside_fig=document.createElement("div");
				div_inside_fig.setAttribute('class','ctr-bg');
				div_inside_fig.setAttribute('style','background-color:'+rgbtohex+';');
				div_inside_fig.appendChild(figuretags[f].children[1]);
				div_inside_fig.appendChild(figp);

				div_inside_fig_parent.appendChild(div_inside_fig);
				figuretags[f].appendChild(div_inside_fig_parent); 
			}
		}
		var valid_fig=removeUnwantedTable(figuretags[f]);   
		var movefig_ul=moveFigureOutUL(figuretags[f]); 	

		if(figuretags[f].closest('td')){
			var tfig_imgs=figuretags[f].getElementsByTagName('img');
			for (var tf = 0; tf < tfig_imgs.length; tf++) {
				tfig_imgs[tf].style.removeProperty('width');
			}
			if(figuretags[f].closest('td').className!=''){
				figuretags[f].className=figuretags[f].closest('td').className;
				figuretags[f].closest('td').className='';
			}
		}

		if(figuretags[f].className.indexOf('mhhe-img-row') > -1){
			var fig_imgs=figuretags[f].getElementsByTagName('img');
			for (var fi = 0; fi < fig_imgs.length; fi++) {
				fig_imgs[fi].style.removeProperty('width');
			}
			// figuretags[f].classList.add('width-full');
		}			

		if (valid_fig  && movefig_ul && figuretags[f].getElementsByTagName('img').length > 0 && figuretags[f].getElementsByTagName('table').length == 0 && (figuretags[f].closest('table')==null || figuretags[f].closest('table')==undefined || !figuretags[f].closest('table'))) {

			var clos_fig=figuretags[f].closest('figure');	

			// console.log(figuretags[f]);

			var figcaption=figuretags[f].getElementsByTagName('figcaption');
			var fig_prev_sib=figuretags[f].previousElementSibling;    
			if(fig_prev_sib){
				var fig_prev_sib_header=fig_prev_sib.getElementsByTagName('header');
			}    		
			if(figuretags[f].parentElement){
				var fig_parent_prev_sib=figuretags[f].parentElement.previousElementSibling; 
			}	
			 

			if (fig_prev_sib || fig_parent_prev_sib) {
				var fig_prev_sib_class="nocls";
				if (fig_prev_sib) {
					fig_prev_sib_class=fig_prev_sib.className;   
				}else if(fig_parent_prev_sib){
					fig_prev_sib_class=fig_parent_prev_sib.className;
				}else if(fig_prev_sib_header){
					fig_prev_sib_class=fig_prev_sib_header.className;
				}   
				var closest_div=figuretags[f].closest('#page-1');   
					// if (fig_prev_sib_class.indexOf('chapter_opener') <= -1 && fig_prev_sib_class.indexOf('chapter-intro') <= -1 && fig_prev_sib_class.indexOf('unit-info') <= -1 && fig_prev_sib_class.indexOf('unit_banner') <= -1 && figuretags[f].className.indexOf('pod--75--image') <=-1  && figuretags[f].className.indexOf('figfloatright') <=-1) {

					// if(figuretags[f].className!='' && figuretags[f].className!='tmp_fig'  && figuretags[f].className.indexOf('pod--50--image--wrap') <=-1  && (figuretags[f].className.indexOf('full-bleed') > -1 || figuretags[f].className.indexOf('three-quarters-block') > -1 || figuretags[f].className.indexOf('three-quarters-block-large') > -1 || figuretags[f].className.indexOf('three-quaters') > -1 || figuretags[f].className.indexOf('two-thirds') > -1 || figuretags[f].className.indexOf('dpg-bar--three_quarter_size') > -1  || figuretags[f].className.indexOf('mhe-seventy-five-container') > -1 || figuretags[f].className.indexOf('mhe-seventyfive-container') > -1)){
						// figuretags[f].classList.add('width-full');
      				// }else{ 
    					if(figuretags[f].className.indexOf('mhhe-pod--image-75to50-wrap') > -1){
							var figcaption_html='';
							if (figcaption[0]) {
	        					var figcaption_html=figcaption[0].innerHTML.toLowerCase();
	        				}

	        				if (figuretags[f].nextElementSibling) {
	        					var fig_nxt_p=figuretags[f].nextElementSibling;	
	        					if(fig_nxt_p.className=='cclearfix'){
	        						fig_nxt_p=fig_nxt_p.nextElementSibling;
	        						if(!fig_nxt_p){
	        							fig_nxt_p=figuretags[f].parentElement.nextElementSibling;
	        						}
	        					}
	        				}else{
	        					if(figuretags[f].parentElement){
	        						fig_nxt_p=figuretags[f].parentElement.nextElementSibling;
	        					}					        					
	        				}

	    					if(fig_nxt_p){
	    						var figheight=figuretags[f].offsetHeight;
								var paraheight=fig_nxt_p.offsetHeight*1.5;

								var f_img=figuretags[f].getElementsByTagName('img');
								if(f_img.length > 0){
									if(f_img[0].offsetHeight == 0){
										// f_img[0].style.setProperty("height", "150%", "important")
									}							
								}
								var calp=this.calculateParaHeight(figuretags[f],figuretags[f].offsetHeight,fig_nxt_p,paraheight,0,'',false,'fig');
								// if(figuretags[f].id=="data-uuid-7fca19817d09444a95e6bb0de9b9a5a9"){
								// 	console.log(calp);
								// 	// debugger;
								// }
								if(figuretags[f].offsetHeight > calp){
									figuretags[f].classList.remove('mhhe-pod--image-75to50-wrap');
								}
								if(calp==0){
									calp=true;
								}
								
								if(calp){
									if(figuretags[f].nextElementSibling){
										if(figuretags[f].getElementsByTagName('img')[0].style.height == '150%'){
											figuretags[f].getElementsByTagName('img')[0].style.removeProperty('height');
										}

										if (figuretags[f].nextElementSibling.nodeName == 'P' || figuretags[f].nextElementSibling.nodeName == 'SPAN' || figuretags[f].nextElementSibling.nodeName == 'UL' || figuretags[f].nextElementSibling.nodeName == 'OL') {
	    									if (figuretags[f].nextElementSibling.innerHTML!='') {
				        						if(figuretags[f].parentElement.getElementsByTagName('ul').length > 0){
				        							var figul=figuretags[f].parentElement.getElementsByTagName('ul');
			        								for (var fu = 0; fu < figul.length; fu++) {
			        									if (figul[fu].className!='') {
			        										figul[fu].classList.add('fig-ul');
			        									}else{
			        										figul[fu].setAttribute('class','fig-ul');
			        									}

			        									
			        								}
			        							}else if(figuretags[f].parentElement.getElementsByTagName('ol').length > 0){
			        								var figol=figuretags[f].parentElement.getElementsByTagName('ol');

			        								for (var fo = 0; fo < figol.length; fo++) {
			        									if (figol.className!='') {
			        										figol[fo].classList.add('fig-ul');
			        									}else{
			        										figol[fo].setAttribute('class','fig-ul');
			        									}
			        									
			        								}
			        							}

			        							if(figuretags[f].className.indexOf('pod--50--nowrap') <=-1){
		        									var emptydiv=document.createElement('div');
				        							emptydiv.setAttribute('class','cclearfix');       							
				        							// figuretags[f].classList.add('figfloatright');
				        							figuretags[f].parentElement.insertAdjacentElement('beforeend',emptydiv);

				        							if(figuretags[f].getElementsByTagName('cite').length==0){
				        								figuretags[f].style.setProperty("margin-bottom", "10px", "important");
				        							}


				        							if(valid_fig){
														// clos_fig.classList.add('figfloatright');
														clos_fig.parentElement.insertAdjacentElement('beforeend',emptydiv);	
													}
				        						}
				        							
			        						}
			        					}
									}		        									
								}
	    					}	
    					}						        					
					// }		        								        					        					
				}
			// }        				
		  				
		}else if (figuretags[f].getElementsByTagName('table').length > 0) {
			if(valid_fig){
				var figcaption=figuretags[f].getElementsByTagName('figcaption');
				if (figcaption.length > 0) {
					figcaption[0].setAttribute('style','page-break-after: avoid!important;');
				}

				var a_cite=figuretags[f].getElementsByTagName('cite');
				if (a_cite.length > 0) {
					a_cite[0].style.setProperty('page-break-before','avoid','important;');
				}
			}
		}

		var figcaption=figuretags[f].getElementsByTagName('figcaption');
		if (figcaption[0]) {
			var figcaption_html=figcaption[0].innerHTML.toLowerCase();
			if (figcaption_html.indexOf('figure') > -1 || figcaption_html.indexOf('exhibit') > -1) {

				// figuretags[f].classList.add('mhhe-pod--img-bot');
				var chk_array=['H1','H2','H3','HEADER','SECTION','ASIDE'];
				var next_h= getNextSiblings(figuretags[f],JSON.stringify(chk_array));
				var next_callout= getNextFigureNumber(figuretags[f],figcaption[0].innerText);
				if (next_callout) {
					next_h=next_callout;
				}
				if (next_h) {    							
					figuretags[f].classList.remove('tmp_fig');
					if(!valid_fig){
						if(figuretags[f].getElementsByTagName('img').length > 0){
							// figuretags[f].insertAdjacentHTML('beforebegin','<p class="emptyp"></p>');
							// figuretags[f].insertAdjacentHTML('afterend','<p class="emptyp"></p>');
						}    									
					}
				}else{
					if (figuretags[f].parentElement.nodeName == 'ASIDE') {
						var aside_chk_array=['H1','H2','H3','HEADER','SECTION','ASIDE'];
						var aside_next_h= getNextSiblings(figuretags[f].parentElement,JSON.stringify(aside_chk_array));
						var aside_next_callout= getNextFigureNumber(figuretags[f].parentElement,figcaption[0].innerText);

						if(!figuretags[f].previousSibling && !figuretags[f].nextSibling){    			
							var fig_to_move=figuretags[f].parentElement;
						}else{   									
							var fig_to_move=figuretags[f];
						}

						if (aside_next_h) {
							aside_next_h=aside_next_callout;
						}

						if (aside_next_h) {
							// figuretags[f].parentElement.parentElement.insertBefore(fig_to_move,aside_next_h);
							figuretags[f].classList.remove('tmp_fig');
							if(!valid_fig){
								if(figuretags[f].getElementsByTagName('img').length > 0){
									// figuretags[f].insertAdjacentHTML('beforebegin','<p class="emptyp"></p>');
									// figuretags[f].insertAdjacentHTML('afterend','<p class="emptyp"></p>');
								}
							}
						}else{
							// figuretags[f].parentElement.parentElement.insertBefore(fig_to_move,figuretags[f].parentElement.parentElement.lastChild.nextElementSibling);
							figuretags[f].classList.remove('tmp_fig');
							if(!valid_fig){
								if(figuretags[f].getElementsByTagName('img').length > 0){
									// figuretags[f].insertAdjacentHTML('beforebegin','<p class="emptyp"></p>');
									// figuretags[f].insertAdjacentHTML('afterend','<p class="emptyp"></p>');
								}
							}
						}
					}else{
						// figuretags[f].parentElement.insertBefore(figuretags[f],figuretags[f].parentElement.lastChild.nextElementSibling);
						figuretags[f].classList.remove('tmp_fig');
						if(!valid_fig){
							if(figuretags[f].getElementsByTagName('img').length > 0){
								// figuretags[f].insertAdjacentHTML('beforebegin','<p class="emptyp"></p>');
								// figuretags[f].insertAdjacentHTML('afterend','<p class="emptyp"></p>');
							}
						}
					}
				}
			}
		}

		if (figuretags[f].className.indexOf('tmp_fig') > -1) {
			if(figuretags[f].getElementsByTagName('img').length > 0 && figuretags[f].parentElement){
				// figuretags[f].insertAdjacentHTML('beforebegin','<p class="emptyp"></p>');
				// figuretags[f].insertAdjacentHTML('afterend','<p class="emptyp"></p>');
			}
		}   

		if (figcaption[0]) {
			var figcaption_html=figcaption[0].innerText.toLowerCase();
			// console.log(figcaption[0].querySelectorAll("[class*=number]"),figuretags[f]);
			if(figcaption[0].querySelectorAll("[class*=number]").length > 0){
				var numbered_class=figcaption[0].querySelectorAll("[class*=number]")[0];
				var numbered_class_html=numbered_class.innerText.toLowerCase().trim().split(' ');
				var cap_num;
				if(numbered_class_html[1]){
					cap_num=numbered_class_html[1].trim().charAt(0);
				}					

				if ((numbered_class_html[0].indexOf('figure') > -1 || numbered_class_html[0].indexOf('exhibit') > -1 || numbered_class_html[0].indexOf('module') > -1 || numbered_class_html[0].indexOf('chart') > -1) && !isNaN(cap_num) && (figuretags[f].querySelectorAll(':scope > img').length > 0 || figuretags[f].querySelectorAll(':scope > div > img').length > 0 || figuretags[f].querySelectorAll(':scope > div > div > img').length > 0 || figuretags[f].querySelectorAll(':scope > div > div > div > img').length > 0)) {
					// var fparentwidth=this._projectlist.getPropValue(figuretags[f], 'width');
					// if(!figuretags[f].getElementsByTagName('img')[0].style.setProperty('width',fparentwidth,'important')){
					// 	figuretags[f].getElementsByTagName('img')[0].setAttribute('style','width:'+fparentwidth+' !important;');
					// }

					var fimgs=figuretags[f].getElementsByTagName('img');
					for (var fi = 0; fi < fimgs.length; fi++) {
						var fimg_parent=fimgs[fi].parentElement;
						var fparentwidth=this._projectlist.getPropValue(fimg_parent, 'width');
						// if(!this._twocolumn){
						// 	if(!fimgs[fi].style.setProperty('width',fparentwidth,'important')){
						// 		fimgs[fi].setAttribute('style','width:'+fparentwidth+' !important;');
						// 	}
						// }
						fimgs[fi].classList.remove('mhhe-pod--big-img');						
					}
					figuretags[f].classList.add('mhhe-pod--large-cap-fig');					
					
					if(!figuretags[f].closest('table,aside,li,[role=region]')){						
						figuretags[f].classList.add('mhhe-pod--img-bot-fig');
						figuretags[f].className=figuretags[f].className.replace(' mhhe-pod--image-75to50-wrap','');
						var bot_div=document.createElement('div');
						bot_div.setAttribute('class','mhhe-pod--img-bot');
						bot_div.innerHTML=figuretags[f].outerHTML;
						figuretags[f].parentElement.insertBefore(bot_div,figuretags[f]);
						figuretags[f].parentElement.removeChild(figuretags[f]);	
						// debugger;
						// if(bot_div.nextElementSibling){
						// 	if(bot_div.nextElementSibling.className.indexOf('concept-check') > -1){
						// 		bot_div.appendChild(bot_div.nextElementSibling);
						// 	}
						// }
					}
					figuretags[f].classList.remove('mhhe-pod--inline-fig');					
									
				}else{
					// var figcaption_number_new=setUnnumberedFigure(figuretags[f],figcaption_number);
					// figcaption_number=figcaption_number_new;					

					if(!stacked_fig){
						figuretags[f].classList.remove('mhhe-pod--inline-fig');
						figuretags[f].classList.add('mhhe-pod--img-unnumbered-fig');
					}
										
				}
			}
			else{
				if(!stacked_fig){
					figuretags[f].classList.remove('mhhe-pod--inline-fig');
					figuretags[f].classList.add('mhhe-pod--img-unnumbered-fig');	
				}			
			}			
		}else if(figuretags[f].getElementsByTagName('img').length > 0 && figuretags[f].getElementsByTagName('table').length == 0 && figuretags[f].getElementsByTagName('math').length == 0 && figuretags[f].getElementsByTagName('aside').length == 0){
			// figuretags[f].classList.add('mhhe-pod--inline-fig');
			if(!stacked_fig){
				figuretags[f].classList.add('mhhe-pod--inline-fig');
				figuretags[f].classList.add('mhhe-pod--img-unnumbered-fig');	
			}		
		} 	
		if(figuretags[f].parentElement){
			if(figuretags[f].parentElement.className.indexOf('mhhe-pod--img-top') > -1){
				if(figuretags[f].getElementsByTagName('table').length > 0){
					setUnnumberedFigure(figuretags[f],tab_caption,'Table');
					figuretags[f].classList.remove('mhhe-pod--inline-fig');	
					tab_caption=tab_caption+0.1;

				}else if(figuretags[f].getElementsByTagName('math').length > 0){
					setUnnumberedFigure(figuretags[f],math_caption,'Equation');
					figuretags[f].classList.remove('mhhe-pod--inline-fig');	
					math_caption=math_caption+0.1;					
				}else{
					setUnnumberedFigure(figuretags[f],img_caption,'Image');
					figuretags[f].classList.remove('mhhe-pod--inline-fig');	
					img_caption=img_caption+0.1;						
				}				
			}
		}

		var f_img=figuretags[f].getElementsByTagName('img');
		if(f_img.length == 1){

			if(f_img[0].offsetHeight > 800){
				f_img[0].setAttribute('class','mhhe-pod--big-img');
			}							
		}			
	}
	return true;
};
function setUnnumberedFigure(figure,number,text){
	number=Math.round(number*10)/10;
	var custom_figcap=document.createElement('span');
	custom_figcap.classList.add('mhhe-pod--custom-fig-caption');
	
	var captionText=text+' '+number;
	custom_figcap.innerHTML='Unnumbered ' +captionText;
	figure.parentElement.insertBefore(custom_figcap,figure);
	if(figure.parentElement.previousElementSibling){
		// if(figure.parentElement.previousElementSibling.nodeName=='UL' || figure.parentElement.previousElementSibling.nodeName=='OL'){
		// 	var ulchild=figure.parentElement.previousElementSibling.children[figure.parentElement.previousElementSibling.children.length-1];
		// 	ulchild.innerHTML+='(Refer unnumbered '+captionText+')';
		// }else{
		// 	var ulchild=figure.parentElement.previousElementSibling.children[figure.parentElement.previousElementSibling.children.length-1];
		// }		
		var last_para=figure.parentElement.previousElementSibling.getElementsByTagName('P');
		if(figure.parentElement.previousElementSibling.nodeName=='P'){
			figure.parentElement.previousElementSibling.innerHTML+=' (Refer unnumbered '+captionText+')';
		}else if(last_para.length > 0){
			last_para=last_para[last_para.length-1];
			last_para.innerHTML+=' (Refer unnumbered '+captionText+')';
		}else{
			var custom_figcap_refer=document.createElement('p');
			custom_figcap_refer.classList.add('mhhe-pod--custom-fig-caption-refer');
			custom_figcap_refer.innerHTML='(Refer unnumbered '+captionText+')';
			figure.parentElement.parentElement.insertBefore(custom_figcap_refer,figure.parentElement);
		}
	}				
	return true;
}

function removeUnwantedTable(figure){	
	if(figure.getElementsByTagName('table').length == 1){
		var child_table=figure.getElementsByTagName('table')[0];
		var table_fig_tags=child_table.getElementsByTagName('figure');

		if(table_fig_tags.length == 1 && child_table.getElementsByTagName('td').length==1){  
			var fragment = document.createDocumentFragment();
			fragment.appendChild(table_fig_tags[0]);
			child_table.parentNode.replaceChild(fragment, child_table);

			var child_fig=figure.getElementsByTagName('figure');
			if(child_fig.length > 0){
				figure.className=figure.className+' '+child_fig[0].className;
				child_fig[0].outerHTML=child_fig[0].innerHTML;
			}

			var a_figcaption=figure.getElementsByTagName('figcaption');
			if (a_figcaption.length > 0) {
				a_figcaption[0].setAttribute('style','page-break-after: avoid!important;margin-bottom:10px!important;');
			}	

			var a_cite=figure.getElementsByTagName('cite');
			if (a_cite.length > 0) {
				a_cite[0].style.setProperty('page-break-before','avoid','important;');
			}	
			return true;						
		}else{
			return true;
		}
	}else{
		return true;
	} 
}

function moveFigureOutUL(figure){
	if(figure.parentElement){
		var clos_li=figure.closest('li');
		if(clos_li){
			if(figure.closest('ul')){
				if(figure.closest('ul').getElementsByTagName('li').length == 1){
					figure.closest('ul').parentElement.insertBefore(figure, figure.closest('ul'));
				}				
			}else if(figure.closest('ol')){
				if(figure.closest('ol').getElementsByTagName('li').length == 1){
					figure.closest('ol').parentElement.insertBefore(figure, figure.closest('ol'));
				}				
			}else{
				return true;
			}
			return true;		
		}else{
			return true;
		}
	}else{
		return true;
	}  				
}

figureChangesClass.prototype.calculateParaHeight= function(elem,elem_height,para,para_height,final_height,place="",fbreak=false,modeltype=""){
	if(fbreak){
		return final_height;
	}
	var updated_place=place;
	var styles=this._projectlist.defaultStyles();	

	var elem_height_percentage=elem_height;
	var para_height_percentage=para_height;	
	var nxt_elem_has_p=para.querySelectorAll('p,span,header'); 


	if(para.nodeName=='P' || para.nodeName=='SPAN' || para.nodeName=='UL' || para.nodeName=='OL'){		

		if(para.closest(".mhhe-pod--glos-entry")){
			return final_height;
		}

		if(elem.parentElement!=para.parentElement){		  				
	 	    var p_styles = '';
	 	    for (var s=0; s < styles.length; s++) {
	 	       p_styles += styles[s]+':'+this._projectlist.getPropValue(para, styles[s])+';';
	 	    }
	 	    
	 	    if(para.parentElement.previousElementSibling){
	 	 	    if(para.parentElement.previousElementSibling.nodeName=='P' || para.parentElement.previousElementSibling.nodeName=='SPAN' || para.parentElement.previousElementSibling.nodeName=='UL' || para.parentElement.previousElementSibling.nodeName=='OL' || para.parentElement.previousElementSibling.nodeName=='FIGURE'){		 	    	
	 	    		if(para.parentElement.parentElement==elem.parentElement){
	 	    			updated_place=para.parentElement;
	 	    			para.parentElement.parentElement.insertBefore(para,para.parentElement);
	 	    		}else if(elem.nextElementSibling==null){	
	 	    			if(place==''){
	 	    				var newplace=elem.nextElementSibling;
	 	    			}else{
	 	    				var newplace=place;
	 	    			}   			
	 	    			elem.parentElement.insertBefore(para,newplace);	 	
	 	    			updated_place=newplace;  			
	 	    		}					
				}else{
					if(place==''){
						if(elem.parentElement){
							updated_place=elem.parentElement.lastChild.nextElementSibling;
							elem.parentElement.insertBefore(para,elem.parentElement.lastChild.nextElementSibling);
						}
					}else{						
						if(elem.parentElement!=null){
							if(place!=null){
								if(place.parentElement!=elem.parentElement){
									place=elem.nextElementSibling;								
								}
							}
							
							updated_place=place;
							elem.parentElement.insertBefore(para,place);
						}						
					}			  					
				}
	 	    }else{
	 	    	if(place==''){
 	    			updated_place=elem.parentElement.lastChild.nextElementSibling;
					elem.parentElement.insertBefore(para,elem.parentElement.lastChild.nextElementSibling);
				}else{
					updated_place=place;
					// console.log(place);
					elem.parentElement.insertBefore(para,place);
				}
	 	    }
		}
		
		final_height=(para.offsetHeight)+final_height;
		// if(elem.id=='data-uuid-7fca19817d09444a95e6bb0de9b9a5a9'){
		// 	console.log(final_height,para,elem_height);
		// }		
		var fig_hight_percentage=elem_height;  				
		if(final_height >= elem_height){
			return final_height;			  			
		}else{	  			
			var nxt_p=para.nextElementSibling;				

			if(nxt_p){		
	  			if(nxt_p.querySelectorAll('[data-moved="yes"]')){
	  				if(nxt_p.querySelectorAll('[data-moved="yes"]').length > 0 && nxt_p.querySelectorAll('p,span,ul,ol').length==0){
	  					if(nxt_p.nextElementSibling){
	  						var nxt_nxt_elem_has_p=nxt_p.nextElementSibling.querySelectorAll('p,span,header'); 
	  						if(nxt_nxt_elem_has_p.length > 0 && (nxt_p.nextElementSibling.nodeName=='DIV' || nxt_p.nextElementSibling.nodeName=='SECTION')){
	  							if(nxt_p.nextElementSibling.getAttribute("role")=='region'){
									return final_height;
								}
			  					var next_childrens=nxt_p.nextElementSibling.children;
			  					return this.processNextElementWrapping(next_childrens,styles,elem,para,para_height_percentage,elem_height,para,final_height,updated_place,modeltype);			  					
			  				}else{
		  						return final_height;
		  					} 
	  					}else{
	  						return final_height;
	  					} 					
		  			}
	  			}	  				
				var nxt_elem_has_p=nxt_p.querySelectorAll('p,span,header'); 
				if(nxt_p.nodeName=='P' || nxt_p.nodeName=='SPAN' || nxt_p.nodeName=='UL' || nxt_p.nodeName=='OL'){
					var total_p_height=(nxt_p.offsetHeight)+para_height_percentage;
					return this.calculateParaHeight(elem,elem_height,nxt_p,total_p_height,final_height,updated_place,'',false,modeltype);
				}else if(nxt_elem_has_p.length > 0 && (nxt_p.nodeName=='DIV' || nxt_p.nodeName=='SECTION')){
					if(nxt_p.getAttribute("role")=='region'){
						return final_height;
					}
					var next_childrens=nxt_p.children;
					return this.processNextElementWrapping(next_childrens,styles,elem,para,para_height_percentage,elem_height,para,final_height,updated_place,modeltype);	
				}else{
	  				return final_height;
	  			}
			}else{
				var elemparent=para.parentElement;
				if(elemparent.nextElementSibling){	
					var nxt_par=elemparent.nextElementSibling;		  
					if(nxt_par.className=='cclearfix'){
						if(!nxt_par.nextElementSibling){
							nxt_par=nxt_par.parentElement.nextElementSibling;
						}
					}	

					if(nxt_par){
			  			if(nxt_par.querySelectorAll('[data-moved="yes"]').length > 0 && nxt_par.querySelectorAll('p,span,ul,ol').length==0){
		  					if(nxt_par.nextElementSibling){
		  						var nxt_nxt_elem_has_p=nxt_par.nextElementSibling.querySelectorAll('p,span,header'); 
		  						if(nxt_nxt_elem_has_p.length > 0 && (nxt_par.nextElementSibling.nodeName=='DIV' || nxt_par.nextElementSibling.nodeName=='SECTION')){
		  							if(nxt_par.nextElementSibling.getAttribute("role")=='region'){
										return final_height;
									}
				  					var next_childrens=nxt_par.nextElementSibling.children;
				  					return this.processNextElementWrapping(next_childrens,styles,elem,para,para_height_percentage,elem_height,para,final_height,updated_place,modeltype);			  					
				  				}else{
			  						return final_height;
			  					} 
		  					}else{
		  						return final_height;
		  					} 					
			  			}

			  			var nxt_par_elem_has_p=nxt_par.querySelectorAll('p,span,header'); 
		  				if(nxt_par_elem_has_p.length > 0 && (nxt_par.nodeName=='DIV' || nxt_par.nodeName=='SECTION')){
		  					if(nxt_par.getAttribute("role")=='region'){
								return final_height;
							}
		  					var next_childrens=nxt_par.children;
		  					return this.processNextElementWrapping(next_childrens,styles,elem,para,para_height_percentage,elem_height,para,final_height,updated_place,modeltype);
		  				}else{
		  					return final_height;
		  				}
					}else{
	  					return final_height;
	  				}	  					
					
				}else{
  					return final_height;
  				}
			}
		}
	}else if(nxt_elem_has_p.length > 0 && (para.nodeName=='DIV' || para.nodeName=='SECTION')){
		var next_childrens=para.children;		
		if(para.getAttribute("role")=='region'){
			return final_height;
		}
		return this.processNextElementWrapping(next_childrens,styles,elem,para,para_height_percentage,elem_height,elem,final_height,updated_place,modeltype);
	}else{
		return final_height;
	}
}

figureChangesClass.prototype.processNextElementWrapping= function(next_childrens,styles,elem,para,para_height_percentage,elem_height,elem_place,final_height,u_place="",mtype=""){
	for (var c = 0; c < next_childrens.length; c++) {
		var dont_move='';	
		if(next_childrens[c].nodeName == 'HEADER'){
			var headerchildrens=next_childrens[c].children;
			for (var nhc = 0; nhc < headerchildrens.length; nhc++) { 

				if(headerchildrens[nhc].nodeName=='H1'){
					return this.calculateParaHeight(elem,elem_height,para,para_height_percentage,final_height,elem_place,true,mtype);
				}							
		 	    var header_styles = '';
		 	    for (var si=0; si < styles.length; si++) {
		 	    	if(styles[si]!='float' && styles[si]!='width' && styles[si]!='height'){
						var style_value= this._projectlist.getPropValue(headerchildrens[nhc], styles[si]);
						if(styles[si]=='background-color'){
							if(!style_value || style_value=='transparent' || style_value=='#000000' || style_value=='rgba(0, 0, 0, 0)'){
								style_value='#fff';
							}
						}
						
		 	    		header_styles += styles[si]+':'+style_value+';';
		 	    	}		 	       
		 	    }
		 	    if(headerchildrens[nhc].innerText.length >=33 && mtype=='fig'){
		 	    	header_styles+='margin-bottom:25px!important;display:inline!important;';
		 	    }

				var span = document.createElement("span");
				if(mtype!='fig'){
					span.classList.add('mhhe-pod--majorcolumn-span');
				}
				span.innerHTML = headerchildrens[nhc].innerHTML;
				span.setAttribute('style',header_styles);
				span.id=headerchildrens[nhc].id;
				span.className='mhhe--pod-moved-header';
				var moved=next_childrens[c].getAttribute('data-moved');

				if(moved!='yes'){															
					if(next_childrens[c+1]){
						if(next_childrens[c+1].nodeName =='ASIDE'){
							dont_move='yes';
						}
					}
					// console.log(dont_move);
					if(dont_move!='yes'){
						elem_place.parentElement.insertBefore(span,elem_place.nextElementSibling);
						elem_place=span.nextElementSibling;
					}		

					// if(elem.id=='data-uuid-de426b7620234b3a9a8a05c73df4c64e'){
					// 	debugger;
					// }							
				}							
			}
			if(dont_move!='yes'){
				next_childrens[c].setAttribute('style','display:none!important;');
				next_childrens[c].setAttribute('data-moved','yes');	
			}
				  							
		}else{
			var nxt_p=next_childrens[c];
			place_elem=u_place;

			if(nxt_p.nodeName=='H1'){
				return this.calculateParaHeight(elem,elem_height,para,para_height_percentage,final_height,elem_place,true,mtype);
			}
			
			if(nxt_p){			  				
				var nxt_elem_has_p=nxt_p.querySelectorAll('p,span,header,ul,ol');
				if(u_place==''){
					var place_elem=elem_place;
				}
				if(nxt_p.nodeName=='P' || nxt_p.nodeName=='SPAN' || nxt_p.nodeName=='UL' || nxt_p.nodeName=='OL'){			  					
					var total_p_height=(nxt_p.offsetHeight)+para_height_percentage;
					return this.calculateParaHeight(elem,elem_height,nxt_p,total_p_height,final_height,place_elem,false,mtype);
				}else if(nxt_elem_has_p.length > 0 && (nxt_p.nodeName=='DIV' || nxt_p.nodeName=='SECTION')){
					var next_childrens=nxt_p.children;
					return this.processNextElementWrapping(next_childrens,styles,elem,para,para_height_percentage,elem_height,elem_place,final_height,place_elem);
				}
				else{			  					
					return this.calculateParaHeight(elem,elem_height,nxt_p,total_p_height,final_height,place_elem,false,mtype);

				}
			}else{
				return this.calculateParaHeight(elem,elem_height,nxt_p,total_p_height,final_height,place_elem,false,mtype);
			}
		}
	}
}

figureChangesClass.prototype.fixLargeFigCaption= function(){//mhhe-pod--image-75to50-wrap
	var styles=this._projectlist.defaultStyles();
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var figcaption=allTags.getElementsByTagName('figcaption');
	for (var fc = 0; fc < figcaption.length; fc++) {
		var caption_parent=figcaption[fc].parentElement;
		var figcap_height=figcaption[fc].offsetHeight;	
		var par_next_elem=caption_parent.nextElementSibling;
		var par_prev_elem=caption_parent.previousElementSibling;
		var fig_next_fig=false;
		if(par_next_elem){
			if(par_next_elem.nodeName=='FIGURE'){
				fig_next_fig=true;
			}

			if(par_prev_elem){
				if(par_prev_elem.nodeName=='FIGURE'){
					fig_next_fig=true;
				}
			}
		}

		var valid_caption=true;
		if(caption_parent.parentElement){
			if(caption_parent.parentElement.className.indexOf('mhhe-pod--stacked-div') >-1){
				valid_caption=false;
			}
			if(caption_parent.getElementsByTagName('img').length <= 0){
				valid_caption=false;
			}
		}
		// && !fig_next_fig
		var parentfloat=this._projectlist.getPropValue(caption_parent, 'float');
		if(figcap_height > 20 && caption_parent.className.indexOf('mhhe-pod--image-75to50-wrap') <=-1 && parentfloat=='none' && valid_caption &&caption_parent.className.indexOf('mhhe-pod--large-cap-fig') <=-1){

			var imgs=caption_parent.getElementsByTagName('img');
			for (var im = 0; im < imgs.length; im++) {
				var img_parent=imgs[im].parentElement;
				var parentwidth=this._projectlist.getPropValue(img_parent, 'width');
				// debugger;
				// console.log(this._twocolumn,'CCCCCC');
				// if(!this._twocolumn){
				// 	if(!imgs[im].style.setProperty('width',parentwidth,'important')){
				// 		imgs[im].setAttribute('style','width:'+parentwidth+' !important;');
				// 	}
				// }				
			}		

			caption_parent.classList.add('mhhe-pod--large-cap-fig');
			// var fig_styles = '';
	 	//     for (var si=0; si < styles.length; si++) {
	 	//     	if(styles[si]!='width' && styles[si]!='height'){	 	    		
	 	//       		fig_styles += styles[si]+':'+this._projectlist.getPropValue(figcaption[fc], styles[si])+';';
	 	//     	}	 	       
	 	//     }	 	    
			// var styleset=setFigureCaptionStyle(figcaption[fc],styles,this._projectlist);
			// if(styleset){
			// 	var span = document.createElement("span");
			// 	span.innerHTML = figcaption[fc].innerHTML;
			// 	span.setAttribute('style',fig_styles);
			// 	span.setAttribute('class','mhhe-pod--large-caption');
			// 	span.id=figcaption[fc].id;
			// 	caption_parent.parentElement.insertBefore(span,caption_parent.nextElementSibling);
			// 	caption_parent.removeChild(figcaption[fc]);
			// 	fc--;
			// }
			
		}
	}
	return true;
}

figureChangesClass.prototype.setImgHeight= function(){
	var allTags = document.getElementById('hiddenfinalhtml').contentDocument;
	var bf_figuretags=allTags.getElementsByTagName("figure");
	for(var bf=0;bf<bf_figuretags.length;bf++){ 		
		if(bf_figuretags[bf].id=='00d0f06a0b2a4770952cb779170c38e1'){
				console.log(bf_figuretags[bf]);
			}
		var f_img=bf_figuretags[bf].getElementsByTagName('img');
		if(bf_figuretags[bf].offsetHeight > 700 && bf_figuretags[bf].getElementsByTagName('figcaption').length > 0){
			// console.log(bf_figuretags[bf],bf_figuretags[bf].offsetHeight);
			// if(bf_figuretags[bf].id=='00d0f06a0b2a4770952cb779170c38e1'){
			// 	debugger;
			// }
			if(f_img.length > 0 && bf_figuretags[bf].getElementsByTagName('figcaption')[0].offsetHeight > 200){
				// f_img[0].setAttribute('height','470px;');	
				f_img[0].style.setProperty('width','470px','important');						
			}				
		}		

	}
};

function setFigureCaptionStyle(parent,styles,projectlist){
	var figcap_childrens=parent.children;
    for (var fcc = 0; fcc < figcap_childrens.length; fcc++) {
    	var fig_child_styles = '';
	    for (var cf=0; cf < styles.length; cf++) {
	    	if(styles[cf]!='width' && styles[cf]!='height'){
    			fig_child_styles += styles[cf]+':'+projectlist.getPropValue(figcap_childrens[fcc], styles[cf])+';';
    		}    		
	    }
	    fig_child_styles += 'margin-inside: auto !important;margin-outside: auto !important;';
	    figcap_childrens[fcc].setAttribute('style',fig_child_styles);
	    if(figcap_childrens[fcc].children.length > 0){
	    	setFigureCaptionStyle(figcap_childrens[fcc],styles,projectlist);
	    }
    }
    return true;
}

function getNextFigureNumber(fig,figcaption){
	figcaption=figcaption.trimLeft();
	var fignum=figcaption.replace('Figure ','');
	fignum=fignum.split(" ")[0];

	var fignum_split=fignum.split('.');
	var nextfig_num='Figure '+fignum_split[0]+'.'+(parseInt(fignum_split[1])+1);
	if (fignum.indexOf('-') > -1) {
		var fignum_split=fignum.split('-');
		var nextfig_num='Figure '+fignum_split[0]+'-'+(parseInt(fignum_split[1])+1);
	}

	nextfig_num=nextfig_num.toLowerCase();
	if (nextfig_num) {
		return getNextCallOut(fig,nextfig_num);
	}
}

function getNextCallOut(elem,n_fig_num){
	while (elem = elem.nextElementSibling) {
	    var nodename=elem.nodeName;
	    if(nodename=='P'){
	    	var elem_text=elem.innerText.toLowerCase();
	    	if(elem_text.indexOf(n_fig_num) > -1){
	    		// console.log(elem.innerText);
	    		return elem;
	    	}		        	
	    }
	}
}

function getNextSiblings(elem, filter) {
    var sibs = [];
    while (elem = elem.nextElementSibling) {
        var nodename=elem.nodeName;
        if(filter.indexOf(nodename) > 1 && elem.nodeName!='A'){
        	if (nodename =='ASIDE' && elem.className.indexOf('conceptcheck') > -1) {
        		return elem;
        	}else if(nodename !='ASIDE'){
        		return elem;
        	}			        	
        }
    }
}

