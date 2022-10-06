import { Component, OnInit, AfterViewInit, Inject, HostListener,Renderer2,ViewChild,ElementRef} from '@angular/core';
import { Http } from "@angular/http";
import { HttpHeaders } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/platform-browser";
import { Router, NavigationEnd, ActivatedRoute,NavigationExtras,NavigationStart } from "@angular/router";
import { ProjectDataService } from '../services/project-data.service';
import { EditorService } from "../services/editor.service";
import { ProcessPDFService } from '../services/pdf/process-pdf.service';
import { AppConfig } from '../../../../app-config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { _ } from 'underscore';


@Component({
  selector: "app-editproject-page",
  templateUrl: "./editproject-page.component.html",
  styleUrls: ["./editproject-page.component.scss"],
})
export class EditprojectPageComponent implements OnInit {
  APIUrl;
  chapterFile = "http://172.24.175.33/princeXML_new/";
  tocContent;
  error = true;
  chaptersList;
  pdfSrc;
  pageVariable: any;
  projectName;
  chapterCount;
  editIcon = false;
  project_id = "";
  tocData = {};
  viewer;
  contentdocument: any;
  firstload: number = 1;
  selectedElement;
  selectedToc;
  indexval;
  uploadURL:any;
  chapter:any;
  pageno:any;
  pagenoval:any;
  loginuserrole; 
  tocdetail:any;
  tocdetails: any;
  chapterDetails: any;
  currentChapter: any;
  routerSegments: Array<any> = [];
  routePath: any;
  editaccess;
  projectCount;
  constructor(private http: Http, private sanitizer: DomSanitizer, @Inject(DOCUMENT) private document: any, private dataservice: ProjectDataService, private editorservice: EditorService, private router: Router,private processpdfservice: ProcessPDFService,public appConfig: AppConfig,private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute) {
    this.APIUrl=appConfig.config.apiURL;
    this.uploadURL = this.appConfig.config.uploadsURL;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
	  //console.log(event)
        if (event.url.indexOf("editor") != -1) {
          this.viewer = false;
        } else {
          this.viewer = true;
        }
      }
    });	
  }

ngOnInit() {
   
      this.spinner.show();
      this.activatedRoute.params.subscribe(params => {
      if(localStorage.getItem('tocstatus') && localStorage.getItem('chapterid')){
        this.chaptersList = JSON.parse(localStorage.getItem('tocstatus'));
        let currentChapterid = localStorage.getItem('chapterid');
        this.currentChapter = _.where(this.chaptersList,{'pc_id':Number(currentChapterid)})[0];
        this.currentChapter.select = true;
  	    //console.log(this.currentChapter.convert_count);
        this.projectName=this.chaptersList[0].folder;
  	     this.chapterCount=this.chaptersList.length;
        // this.pdfSrc = this.uploadURL + this.currentChapter.folder + "/s9ml/" + this.currentChapter.chapter_name + "/" + this.currentChapter.chapter_name + ".pdf";
        this.spinner.hide();
      } else {
        this.getProjectDetails(params);
      }
  	
    });
    this.activatedRoute.url.subscribe(urlsegments => {
      //console.log(urlsegments);
      urlsegments.forEach(segment => {
        this.routerSegments.push(segment.path);
        //console.log(segment.path);
      });
    });
    this.routePath = this.routerSegments.join('/');
    //console.log(this.routePath,"  <- segments is");
    this.document.body.classList.remove('wrapCont');  
    this.document.body.classList.add('open-toc');
    this.loginuserrole=(JSON.parse(localStorage.getItem('currentUser'))).userrole; 
    this.pageVariable=1;
  	
    //this.chapter=localStorage.getItem('chapterval');
  	this.pageVariable=localStorage.getItem('pageno');    
  	this.editaccess=localStorage.getItem('editaccess');
  	//console.log(this.editaccess);
}
  getContentList(content, type) {
    return new Promise((resolve, reject) => {
      this.tocContent = this.sanitizer.bypassSecurityTrustHtml(content);
      var elem = document.getElementById("tocContentHide");
      var contentsList;
      if (type == "epub") {
        contentsList = window.document.getElementsByTagName("content");
      } else {
        contentsList = window.document.getElementsByTagName("exhibit");
      }
      setTimeout(() => {
        resolve(contentsList);
      }, 100);
    });
  }
  downloadPdf(toc,indexval) {
      var url = this.uploadURL+toc.folder+'/s9ml/'+toc.chapter_name+'/'+toc.chapter_name+'.pdf';
      window.open(url);
   }
  getProjectDetails  (project) {
   
    this.project_id = project.id;
     this.dataservice.getProjectData(project).subscribe(data => {
      let response = JSON.parse(data);
      let extension = response.project_type;
      let folder = response.project_name;
      this.projectName = folder;
      this.dataservice.getTocData(folder, extension).subscribe(toc => {
        this.getContentList(toc, extension).then(val => {
          this.dataservice.getchapterstatus(project,val,folder,extension).subscribe(tocstatus => {
            localStorage.setItem('tocstatus',JSON.stringify(tocstatus));
            this.chaptersList = tocstatus;
            this.chapterCount = this.chaptersList.length;
    		  	let arr=[], ival;
      			if (this.chapterDetails && this.chapterDetails.chapter_name !="" && typeof this.chapterDetails.chapter_name !="undefined") {
        			this.chaptersList.forEach(function(value,index) {
          			if (value.chapter_name == this.chapterDetails.chapter_name) {
          				value.select = true;
                        arr=value;
          				ival=index;
                  localStorage.setItem('chapterid', value.pc_id);
				  localStorage.setItem('convert_count',value.convert_count);
          			}
        			});
              this.pdfSrc = this.uploadURL + this.chapterDetails.folder + "/s9ml/" + this.chapterDetails.chapter_name + "/" + this.chapterDetails.chapter_name + ".pdf";
              this.editorservice.sendToc(arr);
              this.selectedToc = arr;
              this.spinner.hide();
              this.showEditor(this.currentChapter,ival);
      			} else {
              let currentChapter = _.where(tocstatus,{'pc_status':2});
      				if(currentChapter && currentChapter.length) {
                this.currentChapter = currentChapter[0];
              } else {
                this.currentChapter = this.chaptersList[0];
                alert("Pdf is not available!");
              }
              this.currentChapter.select = true;
      				ival=0;
              this.pdfSrc = this.uploadURL + this.currentChapter.folder + "/s9ml/" + this.currentChapter.chapter_name + "/" + this.currentChapter.chapter_name + ".pdf";
              this.editorservice.sendToc(this.currentChapter);
              this.selectedToc = this.currentChapter;
              localStorage.setItem('chapterDetails',JSON.stringify(toc));
              this.chapterDetails = JSON.parse(localStorage.getItem('chapterDetails'));
              localStorage.setItem('chapterid', this.currentChapter.pc_id);
              localStorage.setItem('convert_count',this.currentChapter.convert_count);
              
              //setTimeout(() => {
                this.viewer = false;
                this.showEditor(this.currentChapter,ival)
              //}, 2000);
      			}
      			this.indexval=ival;
            this.spinner.hide();
          });
        });
      });
    });
  }

  pageNavigate(nav) {
   
    if (nav == 1) {
      this.pageVariable += 1;
    } else {
      this.pageVariable -= 1;
    }
	this.pagenoval=this.pageVariable;
	localStorage.setItem('pageno', this.pagenoval);
	
  }
 
  createHtml(toc,index) {
  var self = this;
  let promise = new Promise(function(resolve, reject) {
	self.processpdfservice.generateHtml(toc,index,1,true,false).subscribe(
	data => {
	self.tocdetails=data;
	// console.log(data);
	toc.html=true;
	resolve(true);
	
	})
		
    });
    return promise;
  }
  
  createPDF(toc,index) {
    var self = this;
    let promise = new Promise(function(resolve, reject) {
	self.processpdfservice.generatePDF(toc,index).subscribe(
    data => {
      self.tocdetails=data;
    // console.log(data);
    toc.html=true;
    resolve(true);
	
	})
	});
    return promise;
  }

  
  showPdf(toc,index) {
    localStorage.setItem('chapterTOC',JSON.stringify(toc));
  this.spinner.show();
    this.firstload += 1;
	  let obj = this.routePath;
	  let navigationExtras: NavigationExtras = {
  		queryParams: { 'chaptername': toc.chapter_name,'pageno': this.pageVariable},
  		skipLocationChange: true,
  		replaceUrl: true,
  		//queryParamsHandling: 'preserve'
    };
    this.pageVariable = 1;
    this.selectedToc = toc;
    localStorage.setItem('chapterDetails',JSON.stringify(toc));
    this.chapterDetails = JSON.parse(localStorage.getItem('chapterDetails'));
	this.currentChapter= JSON.parse(localStorage.getItem('chapterDetails'));
	  localStorage.setItem('chapterid', toc.pc_id);	
	//localStorage.setItem('pageno', '1');
    this.chaptersList.forEach(function(value) {
      if (value.chapter_name == toc.chapter_name) { 
        value.select = true;
      } else {
        value.select = false;
      }
    });
    if (this.viewer) {
       var self = this;
       if(toc.pc_status == 1){
        this.processpdfservice.generatePDF(toc,index);
       } else if(toc.pc_status == 0) {
        this.createHtml(toc,index).then(function(resolvestatus) {
		    // console.log(resolvestatus);
          if(resolvestatus){
		  self.createPDF(toc,index).then(function(resstatus) {
          if(resstatus){
		  self.pdfSrc = self.uploadURL + toc.folder + "/s9ml/" + toc.chapter_name + "/" + toc.chapter_name + ".pdf";
		   
		}		
		},this)
		}		
		});
		
       }
    } else {
      var self = this;
      if(toc.pc_status == 0) {
        this.createHtml(toc,index).then(function(resolvestatus) {
          if(resolvestatus){
            self.editorservice.sendToc(toc);
          }
        });
       } else {
        this.editorservice.sendToc(toc);
       }
    }
	
    if(toc.pc_status==2) {
      this.pdfSrc = this.uploadURL + toc.folder + "/s9ml/" + toc.chapter_name + "/" + toc.chapter_name + ".pdf";
    }
    
  }
  readyfn()
  {
  this.spinner.hide();
  }
  
  openEdit() {
    this.editIcon = this.editIcon == true ? false : true;
  }

  showEditor(toc,index) {
    this.viewer = false;
	if(localStorage.getItem('convert_count'))
	{
	toc.convert_count=localStorage.getItem('convert_count');
	}
	this.spinner.hide();
    localStorage.setItem('chapterTOC',JSON.stringify(toc));
    let navExtra : NavigationExtras = {queryParams:toc,skipLocationChange: true,replaceUrl: true};
    this.router.navigate([this.routePath+'/editor'],navExtra);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd ) {
        let curURL = event.url.split('?')[0];
        // console.log("end url",curURL);
        localStorage.setItem('routerEndurl', curURL);
      }
    });
	}   
}