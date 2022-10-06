mathChangesClass = function(html,two_col){
	this.chapter_html=html;
	this._twocolumn=two_col;
}
mathChangesClass.prototype.mathHTMLChanges = function(){
	var motags=this.chapter_html.getElementsByTagName("mo"); 
	for (var mm = 0;mm<motags.length;  mm++) {
		var mo_prev_sib= motags[mm].previousElementSibling;
		if(motags[mm].innerHTML=="&nbsp;" || motags[mm].innerHTML==' ' || motags[mm].innerHTML==''){											
			if (mo_prev_sib) {
				if (mo_prev_sib.children.length == 0) {
				    if (mo_prev_sib.innerHTML) {
						mo_prev_sib.innerHTML=mo_prev_sib.innerHTML+'&#160;';
						motags[mm].parentElement.removeChild(motags[mm]);
					}
				}											
			}
		}
		if(motags[mm]){
			if (motags[mm].innerHTML=='/') {
				motags[mm].setAttribute("maxsize", '1'); 
			}

			if (motags[mm].innerHTML=='∑') {
				motags[mm].setAttribute("maxsize", '1'); 
			}

			if (motags[mm].innerHTML=='∫') {
				motags[mm].setAttribute("maxsize", '1'); 
				motags[mm].innerHTML='&int;';
			}			

			if(motags[mm].innerHTML=="("){
				if (!mo_prev_sib) {
					var moparent=motags[mm].parentElement;
					if (moparent.nodeName=='mrow') {
						var moparentofparent=motags[mm].parentElement.parentElement;
						if (moparentofparent.nodeName == 'msup' || moparentofparent.nodeName == 'msub') {
							var moparentofparent_prevsib=moparentofparent.previousElementSibling;
							if (moparentofparent_prevsib) {
								if (moparentofparent_prevsib.nodeName=='mn') {
									moparentofparent_prevsib.innerHTML=moparentofparent_prevsib.innerHTML+'&#160;';
								}
							}													
						}else{
							var moparent_prevsib=moparent.previousElementSibling;
							if (moparent_prevsib) {
								if (moparent_prevsib.nodeName=='mn') {
									moparent_prevsib.innerHTML=moparent_prevsib.innerHTML+'&#160;';
								}
							}											
						}
					}
				}
			}
		}
											
	}
	var mathtags=this.chapter_html.getElementsByTagName('math');
	if (mathtags) {
		for (var mt = 0; mt < mathtags.length;mt++) {
						// if(this._twocolumn){
   //              if(mathtags[mt].parentElement.offsetWidth <= 290){
   //                  mathtags[mt].parentElement.classList.add('mhhe-pod--twocol-math');
   //              }
   //          }
			var mathChildNodes = mathtags[mt].childNodes;  
			var mstyle_open = document.createElement('mstyle');
			mstyle_open.setAttribute('displaystyle','true');	

			mstyle_open.innerHTML=mathtags[mt].innerHTML;		
			mathtags[mt].innerHTML='';								      

			// for (var mc = 0; mc < mathChildNodes.length;mc++) {
			// 	// if(mathtags[mt].id=='data-uuid-a593982247a74e928583a70f97517816'){
			// 	// 	debugger;
			// 	// }
			// 	mstyle_open.appendChild(mathChildNodes.item(mc));
				
			//     // mstyle_open.appendChild(mathChildNodes.item(mc));
			//     // if(mathChildNodes.item(0)){
			//     // 	mathChildNodes.item(0).parentNode.insertBefore(mstyle_open, mathChildNodes.item(mc));
			//     // }
			// }
			mathtags[mt].insertBefore(mstyle_open, mathtags[mt].firstChild);

			if (mathtags[mt].getAttribute('close')) {
				var newmo_close = document.createElement("mo"); 
				newmo_close.setAttribute("maxsize", '1.5'); 
				newmo_close.innerHTML=mathtags[mt].getAttribute('close');
				fragment_math.appendChild(newmo_close);
			}

			var mfencedtags=mathtags[mt].getElementsByTagName('mfenced');
			for (var mf = 0; mf < mfencedtags.length;mf++) {
				if (mfencedtags[mf].getAttribute('open') || mfencedtags[mf].getAttribute('close')) {
					var fragment = document.createDocumentFragment();
					if (mfencedtags[mf].getAttribute('open')) {
						var newmo_open = document.createElement("mo");
						newmo_open.setAttribute("maxsize", '1.5'); 
						newmo_open.innerHTML=mfencedtags[mf].getAttribute('open');
						fragment.appendChild(newmo_open);
					}
					while(mfencedtags[mf].firstChild) {
					    fragment.appendChild(mfencedtags[mf].firstChild);
					}
					if (mfencedtags[mf].getAttribute('close')) {
						var newmo_close = document.createElement("mo"); 
						newmo_close.setAttribute("maxsize", '1.5'); 
						newmo_close.innerHTML=mfencedtags[mf].getAttribute('close');
						fragment.appendChild(newmo_close);
					}
					mfencedtags[mf].parentNode.replaceChild(fragment, mfencedtags[mf]);
				}                        					
			}
		}
	}

	return true;
};

mathChangesClass.prototype.mathChangeNegativeMspaceWidth = function(){
	var mspacetags=this.chapter_html.getElementsByTagName("mspace"); 
	// console.log(mspacetags);
	for (var ms = 0; ms < mspacetags.length;  ms++) {
		if(mspacetags[ms].getAttribute('width')){
			if(mspacetags[ms].getAttribute('width').indexOf('-') > -1){
				mspacetags[ms].removeAttribute('width');
				mspacetags[ms].setAttribute('width','1px');
			}
		}
	}
};