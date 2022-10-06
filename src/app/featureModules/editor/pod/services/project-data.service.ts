import { Injectable } from '@angular/core';
import { Http, RequestOptionsArgs, RequestOptions,Headers} from '@angular/http';

import { Observable,BehaviorSubject,Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConfig } from '../../../../app-config';
@Injectable({
  providedIn: "root"
})
export class ProjectDataService {
    APIUrl;
    baseUrl;
    pdfServiceURL;
    
    chapter_ext=[]; 
    chapters_array=[]; 
    chapters_obj={}; 
    pdfstatus; 
    tocContent;  
    chaptersList; 
    chapterCount; 
    projectName;
    redirectotlogin;
    constructor(private http:Http, private sanitizer:DomSanitizer,public appConfig: AppConfig) {
      this.APIUrl=appConfig.config.apiURL;
      this.baseUrl=appConfig.config.baseURL;
      this.pdfServiceURL=appConfig.config.pdfServiceURL;
    }

  getProjectData(project) {
      var projectDetailsUrl = this.APIUrl + "/getprojectdetails";        
      let userid = JSON.parse(localStorage.getItem("currentUser")).userid;
      var subject = new Subject<string>();
      this.http.post(projectDetailsUrl, { project_id: project.id }).subscribe(data => {
        localStorage.setItem('projectstandard', data.json().project_standard);
        subject.next(data.text());
      });
      return subject.asObservable();        
  }

  getTocData(folder, extension) {
    var uploadUrltoc = this.APIUrl + "/tocfile";
    var subject = new Subject<string>();
    this.http.post(uploadUrltoc, { dirname: folder, extension: extension }).subscribe(res => {
      var resdata = res.text();
      subject.next(resdata);
    });
    return subject.asObservable();
  }

  checkpdfexists(folder, chap, url): Observable<any> {
    return this.http.post(url, { folder: folder, chapter: chap });
  }

  createhtmlfileepub(folder, chapter, url, chapternum, standard): Observable<any> {
    return this.http.post(url, {
      folder: folder,
      chapter: chapter,
      chapternum: chapternum,
      standard: standard
    });
    
  }

  createhtmlfile(folder,chapter,url,htmlfinal,csslinks="",twocolumn=false,extension="",poptips=false,pagewidth,pageheight): Observable<any> {  
    return this.http.post(url, {  
      folder: folder,  
      chapter: chapter,  
      htmlfinal: htmlfinal,  
      csslinks: csslinks,  
      twocolumn:twocolumn,  
      extension:extension,  
      poptips: poptips,  
      pagewidth: pagewidth,  
      pageheight: pageheight  
    });  
  }
  
  createtitlehtmlfile(folder, url): Observable<any> {
    return this.http.post(url, { folder: folder });
  }

  getProjectDetails(pd_url, project_id): Observable<any> {
    return this.http.post(pd_url, { project_id: project_id });
  }

  gethtmldata(folder, chapter, url, extension, type,twocolumn=false,poptips=false): Observable<any> {
    return this.http.post(url, {
      folder: folder,
      chapter: chapter,
      extension: extension,
      type: type,
      twocolumn: twocolumn,
      poptips: poptips
    });
  }
  test_generatePDF= async (url,data)=>{
    console.log('promise off')
    

    
      console.log('service completed')
      return new Promise(async (resolve,reject)=>{
        await this.http.post(url, data).subscribe(()=>{

        console.log('promise on',data)
         resolve(data)
        })
      })
    
      // await this.http.post(url, data).subscribe(()=>{
      //   let test = new Promise((resolve,reject)=>{

      //     console.log('await')
      //     resolve(data)
      //   })
      //    test.then((data)=>{
      //     console.log('send')
      //   })
      // })
    
  }

  generatePDFFile(url,data):Observable<any>{ 
    
      // var headers = new Headers();
      // headers.append('Content-Type','application/x-www-form-urlencoded');
      // headers.append('Content-Type','application/json');
      // let options = new RequestOptions({ headers: headers });

      // return this.http.post(this.pdfServiceURL+url, data,options);  
      return this.http.post(url, data)
  }

  // endProcess(){
  //     var table_chapter = angular.element( document.querySelector( '#chapter-table' ) )[0];
  //     var table_a_tags=table_chapter.getElementsByTagName('a');
  //     for (var ai = 0; ai < table_a_tags.length; ai++) {
  //       table_a_tags[ai].classList.remove('inactiveLink');
  //     }
  //     return;
  // }

  componentToHex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return rgb && rgb.length === 4 ? "#" + ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : "";
  }

  getPropValue(ele, styleProp) {
    if(ele) {
      var y = document.defaultView.getComputedStyle(ele, null).getPropertyValue(styleProp);
    if (y.indexOf("rgb(") > -1 || y.indexOf("rgba(") > -1) {
      y = this.componentToHex(y);
    }
    return y;
    } else {
      return;
    }
  }

    defaultStyles(){
        var styles = ["color", "font-family", "font-size", "line-height", "white-space", "padding", "display", "float", "border", "border-top", "border-right", "border-bottom", "border-left", "border-color", "border-width", "border-style", "padding-top", "padding-right", "padding-bottom", "padding-left","width", "height", "font-weight", "margin-top", "margin-left", "margin-bottom", "margin-right", "text-decoration","background-color","background-image","font-style","position","text-align","vertical-align","top","left","bottom","right","word-wrap"];
        return styles;
    }

    removeAncestor(el) {
        var par=el.parentElement;
        el.parentElement.removeChild(el);
        if(par){
            //this.clean(par);
            par.innerHTML=par.innerHTML.trim();
            if(par.childNodes.length<=1 && par.innerHTML=='' && par.nodeName!='TD'){
                this.removeAncestor(par);
            }else{
                // debugger;
                return true;
            }
        }else{
            return true;
        }           
    }


  getchapterstatus(project,val,folder,extension) {
     var statusUrl = this.APIUrl + "/getchapterdetails";
     var subject = new Subject<string>();
     this.http.post(statusUrl,{"project_id" : project.id }).subscribe(data => {
       var dataJson = data.json();
       dataJson.forEach(element => {
         element.chapter_name = element.pc_name;
     element.convert_count = element.convert_count;
     element.reader_count = element.reader_count;
     element.date=element.last_updated_time;
         element.folder = folder;
         element.extension = extension;
       });
       subject.next(dataJson);
     })
     return subject.asObservable();
  }

    getstandard(project,val,folder,extension) {
         return this.http.post(this.APIUrl + "/getstandard", {"project_id" : project.id, "folder" : folder });
    }

    clean(node){
        for(var n = 0; n < node.childNodes.length; n ++){
            var child = node.childNodes[n];
            if(child.nodeType === 8 || (child.nodeType === 3 && !/\S/.test(child.nodeValue)) || child.nodeName.toLowerCase() == '#comment'){
                if(node.className.indexOf('line') <= -1){
                    node.removeChild(child);
                    n --;
                }           
            }
            else if(child.nodeType === 1)
            {
                this.clean(child);
            }
        }
    }


    cloneAttributes(element, sourceNode) {
      let attr;
      let attributes = Array.prototype.slice.call(sourceNode.attributes);
      while(attr = attributes.pop()) {
        // console.log(attr);
        if(attr.nodeName!='id'){
          element.setAttribute(attr.nodeName, attr.nodeValue);
        }       
      }
      return true;
    }
    createbreakuphtmlfile(folder,chapter,htmlhead,htmlbody): Observable<any> {
      var url = this.APIUrl + "/savebreakuphtml";  
      return this.http.post(url, {folder: folder, chapter: chapter, htmlhead: htmlhead, htmlbody: htmlbody}); 
    }
    readbreakuphtmlfile(folder,chapter): Observable<any> {
      var url = this.APIUrl + "/readbreakuphtml";  
      return this.http.post(url, {folder: folder, chapter: chapter}); 
    }
    checkbreakuphtmlfile(folder,chapter): Observable<any> {
      var url = this.APIUrl + "/checkbreakuphtml";  
      return this.http.post(url, {folder: folder, chapter: chapter}); 
    }
    savebreakup(folder,chapter,htmlhead,htmlbody): Observable<any> {
      var url = this.APIUrl + "/savebreakup";  
      return this.http.post(url, {folder: folder, chapter: chapter}); 
    }
    savestartpage(folder,chapter,pageno): Observable<any> {
      var url = this.APIUrl + "/savestartpage";  
      return this.http.post(url, {folder: folder, chapter: chapter, pageno: pageno}); 
    }

    getBreakJsonData(chapterName): Observable<any> {
      let url = this.APIUrl + "/getRedisJsonData";  
      return this.http.post(url, {chapterName: chapterName}); 
    }

}


