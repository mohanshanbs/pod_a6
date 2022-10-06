import {
    Injectable
} from '@angular/core';
import {
    Http,
    RequestOptionsArgs,
    RequestOptions,
    Headers
} from "@angular/http";
import {
    HttpHeaders,
    HttpClient
} from '@angular/common/http';
import {
    Observable,
    BehaviorSubject,
    Subject
} from 'rxjs';
import {
    DomSanitizer
} from '@angular/platform-browser';
import {
    AppConfig
} from '../../../../../app-config';
import {
    ProjectDataService
} from '../project-data.service';
import {
    NgxSpinnerService
} from 'ngx-spinner';

var MathJax: any;
declare var tableChangesClass: any;
declare var mathChangesClass: any;
declare var headerChangesClass: any;
declare var endnoteChangesClass: any;
declare var figureChangesClass: any;
declare var EOCChangesClass: any;
declare var otherChangesClass: any;
declare var listChangesClass: any;
declare var cssChangesClass: any;
declare var appendHtmlChanges: any;
import {
    tableChangesClass
} from './tablechanges.js';
import {
    mathChangesClass
} from './mathchanges.js';
import {
    headerChangesClass
} from './headerchanges.js';
import {
    endnoteChangesClass
} from './endnotechanges.js';
import {
    figureChangesClass
} from './figurechanges.js';
import {
    EOCChangesClass
} from './eocchanges.js';
import {
    otherChangesClass
} from './otherchanges.js';

import {
    listChangesClass
} from './listchanges.js';

import {
    cssChangesClass
} from './csschanges.js';

import {
    appendHtmlChanges
} from './appendhtmlchanges.js';
import { environment } from '../../../../../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class ProcessPDFService {
    APIUrl: any;
    private _headers = new HttpHeaders().set('Content-Type', 'application/json');
    baseUrl: any;
    uploadURL: any;
    htmlappendcss: any;
    tableidarray: any = [];
    tablesize: any = [];

    constructor(private http: Http, private httpClient: HttpClient, private sanitizer: DomSanitizer, public appConfig: AppConfig, private dataservice: ProjectDataService, private spinner: NgxSpinnerService) {
        this.APIUrl = appConfig.config.apiURL;
        this.baseUrl = appConfig.config.baseURL;
        this.uploadURL = this.appConfig.config.uploadsURL;
    }

    generateHtml(toc, index, pageno,pop_tips=false,two_column=false) {
        console.log('generate_html');
        //console.log(pageno,pop_tips,two_column);
        var extension = toc.extension;
        var folder = toc.folder;
        var chapter = toc.chapter_name;
        var projectlist = this.dataservice;
        var chapternum = toc.chapter_val;
        var otherClass = new otherChangesClass(extension, projectlist, folder, this.uploadURL);
        var figClass = new figureChangesClass(projectlist,two_column,chapternum);
        var endnoteClass = new endnoteChangesClass(chapter, folder, extension, index, projectlist, this.APIUrl, this.spinner, this.uploadURL,figClass,two_column);
        var appendHtmlClass = new appendHtmlChanges(extension,projectlist,folder,two_column,pop_tips);
        var listClass = new listChangesClass(extension,projectlist,folder,two_column,pop_tips);
        var cssClass = new cssChangesClass(extension,projectlist,folder,two_column,pop_tips,window.location.protocol+'//'+environment.pod_port+'/pod_assets/uploads/');
        var subject = new Subject < string > ();
        var endpointURL=this.APIUrl;
        var viewerheight = localStorage.getItem('pagesize') ? parseFloat((localStorage.getItem('pagesize')).split(',')[1]) * 96 - 60 : 910;    
        var viewerwidth =  localStorage.getItem('pagesize') ? parseFloat((localStorage.getItem('pagesize')).split(',')[0]) * 96 : 708;
        //Endnote process
        if (chapter.indexOf('glossary') > -1 || chapter.indexOf('remarks') > -1) {
            var url = this.APIUrl + "/createhtmlfileendnote";
        } else {
            if (extension == 'epub') {
                var url = endpointURL + "/createhtmlfileepub";
            } else {
                var url = endpointURL + "/createhtmlfileblk1";
            }
        }
        this.spinner.show();
        //Get chapter HTML request
        var getc = projectlist.createhtmlfileepub(folder, chapter, url, chapternum, extension)
            .subscribe((res) => {
                var url = endpointURL + "/htmlfilefinal";
                var final = projectlist.createhtmlfileepub(folder, chapter, url, chapternum, extension)
                    .subscribe((respg) => {
                        var iframe = document.getElementById("hiddenfinalhtml");
                        var contentdocument = ( < HTMLIFrameElement > iframe).contentDocument;
                        const customCSS  = document.createElement('link');
                        customCSS.rel = 'stylesheet';
                        customCSS.href = window.location.protocol+'//'+environment.pod_port+'/pod_assets/uploads/iframe.css';
                        contentdocument.head.appendChild(customCSS);    
                        contentdocument.body.innerHTML = respg.text();
                        var allTags = contentdocument;
                        //PDF start page number process           
                        var page_number: any;

                        if(!pageno && extension == 'ETS')
                            pageno = 1;

                        if (pageno > 0) {
                            if (contentdocument.getElementsByClassName('wrapperpg')) {
                                contentdocument.getElementsByClassName('wrapperpg')[0].setAttribute('pagenum', pageno);
                            }
                            this.spinner.show();
                        } else {
                            page_number = (document.getElementById('s_page_number' + index) as HTMLInputElement).value;
                            if (page_number > 0) {
                                // page_number=page_number-1;
                                if (contentdocument.getElementsByClassName('wrapperpg')) {
                                    contentdocument.getElementsByClassName('wrapperpg')[0].setAttribute('pagenum', page_number);
                                }
                                // $scope.showloader=true; 
                                this.spinner.show();

                                // $scope.poptext="PDF";
                            } else {
                                alert('Start Page Number field is required!!');
                                (document.getElementById('s_page_number' + index) as HTMLInputElement).focus();
                                // projectlist.endProcess();
                                return false;
                            }
                        }

                        var EOCClass = new EOCChangesClass(projectlist,two_column);
                        // var set_parent=EOCClass.setParentForTwoColumn();    
                        // if(set_parent){
                            var twocolumn_wrapper=appendHtmlClass.twoColoumWrapper();
                            if(twocolumn_wrapper){
                                var main_parent_divs=allTags.querySelectorAll('.mhhe-pod--introm,.mhhe-pod--bodym,.mhhe-pod--endm');
                                for (var mp = 0; mp < main_parent_divs.length; mp++) {
                                    if (two_column) {
                                        main_parent_divs[mp].classList.remove('mhhe-pod--introm');
                                        main_parent_divs[mp].classList.remove('mhhe-pod--bodym');
                                        main_parent_divs[mp].classList.remove('mhhe-pod--endm');
                                    }
                                }
                            }

                        //Append the required CSS from chapter HTML to implement some style changes
                        var appendcss = cssClass.appendCss();

                        //Endnote process                   
                        if (chapter.indexOf('glossary') > -1 || chapter.indexOf('remarks') > -1) {
                            this.spinner.show();
                            // processEndNote(chapter,folder,extension,index);              
                            // var endnote_changes_status=endnoteClass.processEndnote();

                            var url_endnote = endpointURL + "/createendnotefile";
                            var final_end = projectlist.gethtmldata(folder, chapter, url_endnote, extension, 'endnote',two_column,pop_tips)
                                .subscribe((data) => {
                                    console.log(data);
                                   // debugger;
                                    this.spinner.hide();
                                    subject.next(data.text());
                                })
                           // return false;
                            return subject.asObservable();

                        }
                        var allelems=contentdocument.body.getElementsByTagName("*");
                            for (var y = 0, len = allelems.length; y < len; y++) {
                                if(allelems[y]){
                                    var padding=projectlist.getPropValue(allelems[y], 'padding-top');
                                    var margin=projectlist.getPropValue(allelems[y], 'margin-top');
                                    // console.log(allelems[y],padding,margin);
                                    var content=allelems[y].innerHTML.trim();
                                    if(content==''){
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
                        //Remove page number text from HTML                                               
                       var elements = allTags.getElementsByClassName('page-number');
                        while(elements.length > 0){
                            projectlist.removeAncestor(elements[0]);
                        }   
                        //Table tag changes (Colgroup tags append ... etc)
                        var tableClass = new tableChangesClass(allTags,two_column);
                        
                        //Math equation tag changes
                        var mathClass = new mathChangesClass(allTags,two_column);                       
                        var answertxt=otherClass.removeAnswerText();   
                        var multi_col =otherClass.addMultiColumn(); 

                        // console.log('table_changes_status');
                        //Remove media icons 
                        var removemedia=cssClass.removeMediaIcons();                        

                        //Header tag changes(Running header text implementations)
                        var headerClass = new headerChangesClass(projectlist);
                        var header_changes_status=headerClass.headerHTMLChanges();
                        //End of chapter(EOC) changes(Double column split)
                        
                        var eoc_changes_status=EOCClass.EOCSplit();                                      
                        // console.log('eoc_changes_status');
                        //Save the HTML with the above changes
                        var finalhtml=contentdocument.body.innerHTML;       
                    
                        var url=endpointURL+"/savehtml";    
                        var final=projectlist.createhtmlfile(folder,chapter,url,finalhtml,'',false,'',false,viewerwidth,viewerheight)
                            .subscribe((respg) => {
                                respg = respg;
                                
                                var f_url = endpointURL + "/htmlfilefinal";
                                var f_final = projectlist.createhtmlfileepub(folder, chapter, f_url, chapternum, extension)
                                    .subscribe((final_data_new) => {
                                        final_data_new = final_data_new;
                                        contentdocument.body.innerHTML = '';
                                        //Append the HTML response in DOM
                                        contentdocument.body.innerHTML = final_data_new.text();
                                        //mathjax rendering
                                        if((contentdocument.getElementsByTagName('head')[0].innerHTML).indexOf('id="mathscript1"') < 0) {
                                            var mathscript = document.createElement("script");
                                            mathscript.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-svg.js";
                                            mathscript.async = true;
                                            mathscript.id = "mathscript1";
                                            var mathscript1 = document.createElement("script");
                                            mathscript1.src = "https://polyfill.io/v3/polyfill.min.js?features=es6";
                                            contentdocument.getElementsByTagName('head')[0].append(mathscript1);
                                            contentdocument.getElementsByTagName('head')[0].append(mathscript); 
                                        } 

                                        //Block quote tag changes
                                        var math_changes_status=mathClass.mathHTMLChanges();
                                    var mspace_changes=mathClass.mathChangeNegativeMspaceWidth();
                                    var table_changes_status=tableClass.tableHTMLChanges();
                                    //Block quote tag changes
                                    var bq_changes=cssClass.blockquoteAlignment(); 
                                    // Get the color and added important
                                    var clr_changes=cssClass.colorFix();  
                                    var reducefont=otherClass.reduceFontBheads(); 
                                    var mblkqtUp=cssClass.moveBlockQuoteUp(); 
                                    var setfontsize=cssClass.setFontSizeProximanova(); 
                                    var list_start=listClass.listStartCounterReset();
                                    var emptytags=otherClass.removeEmptyTagsSetFloatClass();
                                    // var widget_data=appendHtmlClass.appendWidgetData();
                                    // var setImgHeight=figClass.setImgHeight();
                                    // var breakavoidli=listClass.listBeforeParaBreakAvoid();
                                    // var table_width=tableClass.removeTableFullWidth();
                                    // Get the color and added important
                                    var ht_changes_status=headerClass.ChapterOpenerHeaderChanges();
                                    // console.log('ht_changes_status');
                                    // Site note changes
                                    //var sitenote_status=headerClass.siteNoteChanges();    
                                    
                                    // console.log('sitenote_status');
                                    // Remarks process goes here
                                    var endnote_changes_status=endnoteClass.processRemarks();

                                    let split_list=false;
                                    if (!two_column && pop_tips) { // no poptip comes  added by sowmiya to test split ul occurence
                                        split_list=listClass.splitGlosTermList();
                                    }else{
                                        split_list=true;
                                    }
                                    var emptyPara=appendHtmlClass.addEmptyParatoAside();

                                    let process_glos=false;
                                    if (pop_tips && split_list) {   
                                        process_glos=endnoteClass.processGlossary();    
                                    }else{
                                        process_glos=true;
                                    }   
                                    var hyperlinks=otherClass.createSpanClassForHyperLinks();
                                    var answer=cssClass.removeAnswerButtons();

                                    var removeClass=cssClass.removeUnwantedClassNames();
                                    // var scrollable=otherClass.removeScrollableContainerClasses();                            
                                    
                                    if (process_glos) {
                                        var moveheadsup=endnoteClass.moveHeadsUpNearPoptips();     
                                       
                                        // console.log('endnote_changes_status');
                                        var finalhtml_end = contentdocument.body.innerHTML;
                                        //Remove a tags
                                        finalhtml_end=finalhtml_end.replace(/<a [^>]*>/g,'');
                                        finalhtml_end=finalhtml_end.replace(/<\/a>/g,'');     
                                        finalhtml_end=finalhtml_end.replace(/<a [^>]*>(.*?)<\/a>/g,'$1');
                                        contentdocument.body.innerHTML=finalhtml_end;
                                        var keyterm_split=EOCClass.keytermList();   
                                        // if (chapter.indexOf('chapter') > -1) {
                                        //     // Table of contents
                                        //     // var toc=otherClass.createTOC();
                                        // }else{
                                        //     var toc=true;
                                        // }
                                        //Figure tag changes
                                        var fig_changes_status=figClass.addBgclrFig(); 
                                        //var progress_margin=cssClass.progressMarginAdjustments();
                                        // if(progress_margin){
                                            var hremove_status=headerClass.removeBottomSpacesForHeaders();
                                        // }
                                        var setclass_aside_header=headerClass.setclassAsideHeader();
                                        // if(aside){
                                            var fig_caption=figClass.fixLargeFigCaption();
                                            var fig_width_status=figClass.setImageWidth();
                                            // console.log('aside');
                                            // var textalign=otherClass.makeTextAlignImportant();
                                            //var icons=otherClass.setWidthIcons();
                                            // var eoc_fig=EOCClass.EOCSplitCustom();
                                            var linebreaks=listClass.removeLineBreaksChapterOpenerList();
                                                

                                            var characterSet=cssClass.fixCharacterSetIssues();
                                            var bullets=listClass.insertBulletsForList();
                                            var optionColumn = listClass.multiColumnOption();
                                            // if(res.os=='linux'){
                                                var setmargin=tableClass.reduceTableMarginLinux();
                                            // }
                                            if((contentdocument.getElementsByTagName('head')[0].innerHTML).indexOf('id="mathscript1"') >= 0) {
                                                let alltag = contentdocument.querySelectorAll('body math');
                                                for(let i = 0; i < alltag.length; i++) {
                                                  let target = alltag[i];
                                                  if(MathJax != undefined){
                                                    target.parentNode.replaceChild(MathJax.mathml2svg([alltag[i]][0].outerHTML),target);
                                                    MathJax.startup.document.clear();
                                                    MathJax.startup.document.updateDocument();
                                                  }
                                                //   target.parentNode.replaceChild(MathJax.mathml2svg([alltag[i]][0].outerHTML),target);
                                                //   MathJax.startup.document.clear();
                                                //   MathJax.startup.document.updateDocument();
                                                }
                                            }

                                            /*var headlinks = contentdocument.getElementsByTagName('head')[0].children;
                                            for(var i=0; i < headlinks.length; i++) {
                                            let hrefval = (headlinks[i].href) ? headlinks[i].href : '';
                                            if(hrefval && hrefval.indexOf('pod_assets') > -1) {
                                                headlinks[i].href = 'http://localhost/pod_assets'+ hrefval.split('pod_assets')[1];
                                            }
                                            }*/
                                                finalhtml_end=contentdocument.body.innerHTML;
                                                finalhtml_end=finalhtml_end.replace(/∅/g,'&#216;');
                                                var url_end = endpointURL + "/savehtmllast";
                                                this.spinner.show();
                                                var final_end = projectlist.createhtmlfile(folder, chapter, url_end, finalhtml_end,  JSON.stringify(appendcss),two_column,extension,pop_tips,viewerwidth,viewerheight)
                                                    .subscribe((respg_end) => {
                                                        // respg_end=respg_end; 
                                                        // $scope.showloader=false;
                                                        // $scope.show_gen_pdf=true; 
                                                        // angular.element( document.querySelector('#html_'+index)).attr('class','ng-hide');
                                                        // angular.element( document.querySelector('#page_num'+index)).attr('class','ng-hide');
                                                        // angular.element( document.querySelector('#pdf_'+index)).attr('class','ng-show');
                                                        // projectlist.endProcess();
                                                        //this.autoSave();
                                                      //  this.spinner.hide();
                                                toc.enlargeHtml = false;
                                                toc.pc_status = 1;
                                                var respg_end = respg_end;
                                                var self = this;
                                               this.htmlappendcss = appendcss;
                                                setTimeout(function(){
                                                var iframe_hidden  = document.getElementById("hiddenfinalhtml");
                                                var contentdocument_hidden = ( < HTMLIFrameElement > iframe_hidden).contentDocument;
                                                var finalhtml = contentdocument_hidden.body.innerHTML;
                                                var final_end = projectlist.createhtmlfile(folder, chapter, url_end, finalhtml,  JSON.stringify(appendcss),two_column,extension,pop_tips,viewerwidth,viewerheight)
                                                .subscribe((respg) => {
                                                    self.spinner.hide();
                                                   //if(window.location.href.indexOf('convertchapter') > -1) {
                                                        self.savefinalhtml(toc);
                                                    //}
                                                    subject.next(respg_end.text());
                                                })
                                            }, 2000);
                            })
                                        }
                                    })
                            })
                    })
            });
                return subject.asObservable();
    }


 savefinalhtml(currentChapter) {
    var tableidarray = [];
    var iframe_hidden  = document.getElementById("hiddenfinalhtml");
    var contentdocument_hidden = ( < HTMLIFrameElement > iframe_hidden).contentDocument;
    var projectlist = this.dataservice;
    let tablesize =  this.tablesize;
    var viewerwidth =  parseFloat(localStorage.getItem('pagesize').split(',')[0]) * 96;
    let checkwidth = ((parseFloat(localStorage.getItem('pagesize').split(',')[0])-1.5) * 96);
    var viewerheight = localStorage.getItem('pagesize') ? parseFloat((localStorage.getItem('pagesize')).split(',')[1]) * 96 - 60 : 910;
    if(this.htmlappendcss && contentdocument_hidden.body.innerHTML){
    let tablelist = contentdocument_hidden.querySelectorAll('body table');
    if (tablelist.length > 0) {
        for (let i = 0; i < tablelist.length; i++) {
             tablelist[i].removeAttribute('style');
             let tableChildren = tablelist[i].children;
             for(var j=0; j < tableChildren.length; j++){
               tableChildren[j].removeAttribute('style');
               for(var p=0; p<tableChildren[j].children.length; p++) {
                  for(var q=0; q<tableChildren[j].children[p].children.length; q++) {
                    if(tableChildren[j].children[p].children[q].textContent !== '') {
                      tableChildren[j].children[p].children[q].removeAttribute('style');
                      break;
                    }
                 }
               }
             }
          }
         
      let pageheight = (parseFloat((localStorage.getItem('pagesize')).split(',')[1]) * 96);
      for (let i = 0; i < tablelist.length; i++) {

        if(tablelist[i].id == 'data-uuid-8e9a48466743480f990e059160b22e5b'){
            console.log('tablelist : ', tablelist[i].id);
        }

        let thistable =  contentdocument_hidden.querySelectorAll('#'+tablelist[i].id);
        let curwidth: any = window.getComputedStyle(tablelist[i], null).getPropertyValue("width");
        let curheight: any = window.getComputedStyle(tablelist[i], null).getPropertyValue("height");
        curwidth = parseFloat(curwidth.split('px')[0]);
        let tablewidth = (parseFloat((localStorage.getItem('pagesize')).split(',')[1]) - 2.38)*96;
       
       if (curwidth > checkwidth && thistable[0].innerHTML.indexOf('<img') < 0) {
          if(thistable[0].classList.contains("mhhe-pod--additional")){
        thistable[0].innerHTML = thistable[0].innerHTML.replace(new RegExp("<td ", "g"), "<td style='font-size: 8pt !important; padding: 3px !important;margin: 0 !important;text-indent: 0 !important;'");
        thistable[0].innerHTML = thistable[0].innerHTML.replace(new RegExp("<th ", "g"), "<th style='font-size: 8pt !important; padding: 3px !important;margin: 0 !important;text-indent: 0 !important;'");
        thistable[0].innerHTML = thistable[0].innerHTML.replace(new RegExp("<col ", "g"), "<col style='font-size: 8pt !important; padding: 3px !important;margin: 0 !important;text-indent: 0 !important;'");
        } else {
            thistable[0].innerHTML = thistable[0].innerHTML.replace(new RegExp("<td ", "g"), "<td style='font-size: 12px !important; padding: 3px !important;margin: 0 !important;text-indent: 0 !important;'");
            thistable[0].innerHTML = thistable[0].innerHTML.replace(new RegExp("<th ", "g"), "<th style='font-size: 12px !important; padding: 3px !important;margin: 0 !important;text-indent: 0 !important;'");
            thistable[0].innerHTML = thistable[0].innerHTML.replace(new RegExp("<col ", "g"), "<col style='font-size: 12px !important; padding: 3px !important;margin: 0 !important;text-indent: 0 !important;'");
        }

          tableidarray.push(tablelist[i].id);
          let tableChildren = tablelist[i].children;
          let totalheight = 0;
          let tmpwidth = 0;
          let theadwidth = 0;
          let tbodywidth = 0;
          this.setTableWidth(tableChildren, curwidth, true);
          totalheight = 0;
          for(var j=0; j < tableChildren.length; j++){
            if(tableChildren[j].tagName.toLowerCase() == 'thead' || tableChildren[j].tagName.toLowerCase() == 'tbody'){
                let tmpheight = window.getComputedStyle(tableChildren[j], null).getPropertyValue("height");
                totalheight = totalheight + parseFloat(tmpheight);
            }
          }
          curwidth = 0;
          curwidth = window.getComputedStyle(tablelist[i], null).getPropertyValue("width");
          curwidth = parseFloat(curwidth.split('px')[0]);
          if(curwidth > checkwidth) {
            let breaknode = document.createElement('p') as HTMLElement;
            breaknode.setAttribute("class", "break_the_page");
            var differenceheight = totalheight - checkwidth;
            var scaleper = (differenceheight) / totalheight;
            pageheight = pageheight-59;
            
          if(totalheight > 690 && totalheight <= 1035 && totalheight < 764){
                var scaleval = (1-scaleper);
                var moveval = ((scaleval*100)/14.875);
                moveval = Math.round(moveval * 10) / 10;
                this.setTableWidth(tableChildren, tablewidth, true);
                (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) scale('+(scaleval-0.04)+') translate(7.1331%, -'+(moveval)+'%); width: 835px !important; height: 762px !important;';
                (thistable[0].parentNode.parentNode as HTMLElement).after(breaknode);
                (thistable[0].parentNode.parentNode as HTMLElement).setAttribute("rotate-section","true");
                (tablelist[i] as HTMLElement).classList.add("tableLandscape");
                /* if(tablelist[i].id == 'data-uuid-8e9a48466743480f990e059160b22e5b'){

                } */
                
          } else if (totalheight > 1035){
            var scaleval = (1-scaleper)+0.2;
            var moveval = (scaleval*100)/2.7;
            moveval = Math.round(moveval * 10) / 10;
            (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) scale('+scaleval+') translate(20%,'+Math.abs(differenceheight/2.5)+'px); width: '+tmpwidth+'px !important; height: 762px !important;';
            (thistable[0].parentNode.parentNode as HTMLElement).after(breaknode);
            (thistable[0].parentNode.parentNode as HTMLElement).setAttribute("rotate-section","true");
            (tablelist[i] as HTMLElement).classList.add("tableLandscape");
        } 
          else {
            this.setTableWidth(tableChildren, tablewidth, true);
            var differenceWidth = pageheight-827;

            //vis start - 30,2021
            //(tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(-25px, '+Math.abs(differenceheight/5)+'px); width: 835px !important; height: 762px !important; margin-bottom: 80px !important;';
            if(parseFloat((localStorage.getItem('pagesize')).split(',')[0]) < 7)
            {
               /* console.log('id : ', tablelist[i].id);
                console.log('contentdocument_hidden :', contentdocument_hidden.querySelectorAll('#'+tablelist[i].id));
                console.log('aside table :', contentdocument_hidden.querySelectorAll('aside table'));
                console.log('aside table with id:', contentdocument_hidden.querySelectorAll("aside table[id='"+tablelist[i].id+"']"));
                console.log('aside table with id length:', contentdocument_hidden.querySelectorAll("aside table[id='"+tablelist[i].id+"']").length); 
                console.log('rr :', (tablelist[i] as HTMLElement));
                console.log('ss :', thistable[0].parentNode); */
                if(contentdocument_hidden.querySelectorAll("aside table[id='"+tablelist[i].id+"']").length > 0){
                    //(tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(-7px, -5.2px); width: 627px !important; height: 615px !important; margin-bottom: 13px !important;';
                    // vishnu -table rotation table row break fix - start
                    // vishnu -table rotation table row break fix for table size 5.5*8.5, 6*9, 6.375*9.125 - start
                    if(parseFloat((localStorage.getItem('pagesize')).split(',')[0]) == 6.375 && parseFloat((localStorage.getItem('pagesize')).split(',')[1]) == 9.125 ){
                        (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(1px, -2px); width: 637px !important; margin-left: -120px; ';
                        (thistable[0].parentNode as HTMLElement).style.cssText += "height : 649px !important ; display: grid;";
                    }
                    else if(parseFloat((localStorage.getItem('pagesize')).split(',')[0]) == 6 && parseFloat((localStorage.getItem('pagesize')).split(',')[1]) == 9)
                    {
                        (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(0px, -137.2px); width: 654px !important;';
                        (thistable[0].parentNode as HTMLElement).style.cssText += "height : 660px !important; display: grid;";
                    }
                    else if(parseFloat((localStorage.getItem('pagesize')).split(',')[0]) == 5.5 && parseFloat((localStorage.getItem('pagesize')).split(',')[1]) == 8.5)
                    {
                        (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(1px, -142.2px); width: 615px !important;';
                        (thistable[0].parentNode as HTMLElement).style.cssText += "height : 621px !important; display: grid;";
                    }                    
                    else{
                        (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(145px, -149.2px); width: 615px !important; height: 315px !important; margin-bottom: 10px !important;';
                        (thistable[0].parentNode as HTMLElement).style.cssText += "height : 621px !important";
                    }
                    
                    if((thistable[0] as HTMLElement).children[1].nodeName.toLowerCase() == 'thead'){                        
                        (thistable[0].children[1] as HTMLElement).style.removeProperty('display');                        
                    }
                    if((thistable[0] as HTMLElement).children[2].nodeName.toLowerCase() == 'tbody'){                        
                        (thistable[0].children[2] as HTMLElement).style.removeProperty('display');                        
                    }
                    // vishnu -table rotation table row break fix 5.5*8.5, 6*9, 6.375*9.125 - end
                    (thistable[0].parentNode.parentNode as HTMLElement).after(breaknode);
                    (thistable[0].parentNode.parentNode as HTMLElement).setAttribute("rotate-section","true");
                    (tablelist[i] as HTMLElement).classList.add("tableLandscape");
                    //(thistable[0].parentNode as HTMLElement).style.cssText += "overflow-x : scroll !important";
                }
                
            }
            // else
            // {
            //     (tablelist[i] as HTMLElement).style.cssText += 'transform: rotate(270deg) translate(-25px, '+Math.abs(differenceheight/5)+'px); width: 835px !important; height: 762px !important; margin-bottom: 80px !important;';
            // } 
             //vis end - 30,2021
          }

        //   (thistable[0].parentNode.parentNode as HTMLElement).after(breaknode);
        //   (thistable[0].parentNode.parentNode as HTMLElement).setAttribute("rotate-section","true");
        //   (tablelist[i] as HTMLElement).classList.add("tableLandscape");
        }
      }
          this.setTableWidth(tablelist[i].children, 0, false);
    }    
    var finalhtml = contentdocument_hidden.body.innerHTML;
    var url=this.APIUrl+"/savehtmllast";   
    var final_end = projectlist.createhtmlfile(currentChapter.folder,currentChapter.pc_name,url,finalhtml,JSON.stringify(this.htmlappendcss),currentChapter.pc_twocolumn,currentChapter.extension,currentChapter.pc_poptips,viewerwidth,viewerheight)
    .subscribe((respg) => {
    })
    }
 }
}

 setTableWidth(tableChildren, tmpwidth, type) {
    let theadwidth = 0;
    let tbodywidth = 0;
    for(var j=0; j < tableChildren.length; j++){
                if(tableChildren[j].tagName.toLowerCase() == 'thead' || tableChildren[j].tagName.toLowerCase() == 'tbody'){
                    if(type) {
                        //tableChildren[j].style.cssText = 'display: block';
                        tableChildren[j].style.cssText = 'display: contents';
                    }
                    if(tableChildren[j].tagName.toLowerCase() == 'tbody') {
                       for(var p=0; p<tableChildren[j].children.length; p++) {
                           var elemLineHeight = window.getComputedStyle(tableChildren[j].children[p], null).getPropertyValue("line-height");
                           var lh = parseInt(elemLineHeight,10);
                           
                            // vishnu - table rotation fix (start) - 30/04/2021
                            /*if(tableChildren[j].children[p].children[0].textContent !== ''){
                               (tableChildren[j].children[p]).style.height = tableChildren[j].children[p].offsetHeight+'px';

                            } */
                            if(tableChildren[j].children[p].children.length > 0 && 
                                typeof(tableChildren[j].children[p].children[0]) !== 'undefined'  
                              )
                            {
                                if(tableChildren[j].children[p].children[0].textContent !== '')
                                {
                                    (tableChildren[j].children[p]).style.height = tableChildren[j].children[p].offsetHeight+'px';
                                }
                            }
                            // vishnu - table rotation fix (end) - 30/04/2021
                            else 
                            {
                               (tableChildren[j].children[p]).style.height = (tableChildren[j].children[p].offsetHeight+lh)+'px';
                               for(var r = 0;r<tableChildren[j].children[p].children.length;r++)
                               {
                                   (tableChildren[j].children[p]).children[r].style.width = tableChildren[j].children[p].children[r].offsetWidth+'px';
                               }
                               
                            }
                            
                            //(tableChildren[j].children[p]).style.height = tableChildren[j].children[p].offsetHeight+'px';
                            if(type) {
                            for(var q=0; q<tableChildren[j].children[p].children.length; q++) {
                                if(tableChildren[j].children[p].children[q].textContent !== '') {
                                  tbodywidth = (tableChildren[j].children[p].children[q]).offsetWidth;
                                  tbodywidth = (tbodywidth / tmpwidth) * 100;
                                  (tableChildren[j].children[p].children[q]).style.width = tbodywidth+'%';
                                  tbodywidth = 0;
                                }
                             }
                          }
                       }
                    }
                    if(tableChildren[j].tagName.toLowerCase() == 'thead') {
                       for(var p=0; p<tableChildren[j].children.length; p++) {
                           var elemLineHeight = window.getComputedStyle(tableChildren[j].children[p], null).getPropertyValue("line-height");
                           var lh = parseInt(elemLineHeight,10);
                           
                           if(tableChildren[j].children[p].children[0].textContent !== ''){
                               (tableChildren[j].children[p]).style.height = tableChildren[j].children[p].offsetHeight+'px';

                           } else {
                               (tableChildren[j].children[p]).style.height = (tableChildren[j].children[p].offsetHeight+lh)+'px';
                            //    for(var r = 0;r<tableChildren[j].children[p].children.length;r++){
                            //        (tableChildren[j].children[p]).children[r].style.width = tableChildren[j].children[p].children[r].offsetWidth+'px';
                            //    }
                               
                           }
                            
                            //(tableChildren[j].children[p]).style.height = tableChildren[j].children[p].offsetHeight+'px';
                            if(type)  {
                              for(var q=0; q<tableChildren[j].children[p].children.length; q++) {
                                if(tableChildren[j].children[p].children[q].textContent !== '') {
                                  theadwidth = (tableChildren[j].children[p].children[q]).offsetWidth;
                                  theadwidth = (theadwidth / tmpwidth) * 100;
                                  (tableChildren[j].children[p].children[q]).style.width = theadwidth+'%';
                                  theadwidth = 0;
                                }
                            }
                         }
                       }
                    }
                }
              }
  }
    generatePDF(toc, index) {
        var extension = toc.extension;
        var folder = toc.folder;
        var chapter = toc.chapter_name;
        var chapternum = toc.chapter_val;
        var pid = toc.pc_project_id;
        var cid = toc.pc_id;
        var ccount = toc.convert_count;
        let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
        this.spinner.show();
        var subject = new Subject < string > ();
        this.dataservice.generatePDFFile(this.APIUrl + "/convertpdf", {
                "ccount": ccount,
                "pid": pid,
                "cid": cid,
                "uid": userid,
                "folder": folder,
                "cfolder": chapter,
                "htmltype": 2,
                "extension": extension,
                "uploadURL": this.uploadURL+localStorage.getItem('projectstandard')+'/'
            })
            .subscribe((res) => {
                subject.next(res.text());
                res = res.text();
                var ccount1 = parseInt(ccount) + 1;
                var n = ccount1.toString();
                localStorage.setItem('convert_count', n);
                if (res.indexOf('/') > -1) {
                    //this.autoSave();
                    // window.open(res);
                    this.spinner.hide();
                    //toc.enlargePdf = false;
                    toc.pc_status = 2;
                } else {
                    this.spinner.hide();
                    alert('Nothing converted!!!');
                }


            }, err => console.log(err))
        return subject.asObservable();
    }

    pdfsubject = new Subject();
    test_generatePDF =  async function(toc, index) {
        var extension = toc.extension;
        var folder = toc.folder;
        var chapter = toc.chapter_name;
        var chapternum = toc.chapter_val;
        var pid = toc.pc_project_id;
        var cid = toc.pc_id;
        var ccount = toc.convert_count;
        let _this = this;
        let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
        this.spinner.show();
        this.dataservice.generatePDFFile(this.APIUrl + "/convertpdf", {
                "ccount": ccount,
                "pid": pid,
                "cid": cid,
                "uid": userid,
                "folder": folder,
                "cfolder": chapter,
                "htmltype": 2,
                "extension": extension,
                "uploadURL": this.uploadURL+localStorage.getItem('projectstandard')+'/'
            }).subscribe((res) => {
                res = res.text();
                var ccount1 = parseInt(ccount) + 1;
                var n = ccount1.toString();
                localStorage.setItem('convert_count', n);
                if (res.indexOf('/') > -1) {
                    //this.autoSave();
                    //window.open(res);
                    _this.spinner.hide();
                    //toc.enlargePdf = false;
                    toc.pc_status = 2;
                    this.pdfsubject.next('success');
                    //alert("pdf generated successfully")
                    let std = localStorage.getItem('projectstandard');
                    let url = '';
                    if(std && std == 'ETS'){
                        url = _this.APIUrl+'/'+_this.uploadURL+'/'+toc.folder+'/s9ml/'+toc.chapter_name+'/'+toc.chapter_name+'.pdf';
                    }
                    else{
                        url = _this.APIUrl+'/'+_this.uploadURL+localStorage.getItem('projectstandard')+'/'+toc.folder+'/s9ml/'+toc.chapter_name+'/'+toc.chapter_name+'.pdf';
                    }
                    url = url.replace('./', '');
                    window.open(url); 
                } else {
                    this.spinner.hide();
                    alert('Problem while processing, please try again later!');
                }
                return new Promise((resolve,reject)=>{
                    resolve('pdf created')
                })

            })
        //subject.asObservable();
    }


    autoSave() {
        var save_url = this.APIUrl + "/auto_save";
        this.http.post(save_url, {}).subscribe(data => {
            console.log(data);
        });
    }

    uploadFileToUrl(uploadUrl, fd) {
        // var fd = new FormData();
        // fd.append('file', file);
        // fd.append('userid', userid);
        // fd.append('fextension', fextension);


        // let options: RequestOptionsArgs = new RequestOptions();
        // options.headers = new Headers();
        // options.headers.append("Content-Type", "");

        // var deferred = Promise.defer();
        return this.http.post(uploadUrl, fd);
        // .subscribe((response) => {
        //     deferred.resolve(response.json);
        // }, function() {
        //     deferred.reject("Error! @factory.fileUpload");
        // });
        // return deferred.promise;          
    }


    extractFile(filename, destination, project, url, userid, fextension, standard) {
        return this.http.post(url, {
            'filename': filename,
            'destination': destination,
            'project': project,
            'userid': userid,
            'fextension': fextension,
            'standard': standard
        });
    }

    validateepub(destination, project, url, userid, standard) {
        return this.http.post(url, {
            'destination': destination,
            'project': project,
            'userid': userid,
            'standard': standard
        });
    }
    createMainfest(project, url, userid, fextension) {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension
        });
    }

    fontReplacements(project, url, userid, fextension) {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension
        });
    }

    createHtmlFiles(project, url, userid, fextension) {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension
        });
    }

    removeLinks(project, url, userid, fextension) {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension
        });
    }

    cssChanges(project, url, userid, fextension, base_url="") {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension,
            'baseUrl':base_url
        });
    }

    fontRgbtoCmyk(project, url, userid, fextension) {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension
        });
    }
    createcssfiles(project, url, userid, fextension) {
        return this.http.post(url, {
            'project': project,
            'userid': userid,
            'fextension': fextension
        });
    }

    saveStandard(project, url, userid, fextension, std) {
         return this.http.post(url, {
            'project': project,
            'std': std
        });
    }
}