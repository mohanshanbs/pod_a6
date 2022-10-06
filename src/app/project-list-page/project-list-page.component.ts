import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router, NavigationEnd, ActivatedRoute, NavigationExtras, NavigationStart } from "@angular/router";
import { DOCUMENT } from '@angular/common';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AppConfig } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, RequestOptionsArgs, RequestOptions, Headers } from "@angular/http";
import { ProcessPDFService } from '../featureModules/editor/pod/services/pdf/process-pdf.service';
import { PageSizeComponent } from '../page-size/page-size.component';
import { environment } from '../../environments/environment';
/**
 * @title Table with pagination
 */

@Component({
  selector: 'app-project-list-page',
  templateUrl: './project-list-page.component.html',
  styleUrls: ['./project-list-page.component.scss'],
  providers: [NgbModal, NgbActiveModal]
})
export class ProjectListPageComponent implements OnInit {
  projectListData;
  uploadbutton;
  uploadSuccess;
  myfiles;
  myfilename;
  projectName;
  svgimagelist;
  APIUrl;
  displayedColumns = ['project_name', 'project_type', 'username', 'project_created_at', 'actions'];
  //displayedColumns had 'chapters' to add conversion column in the array
  dataSource;
  projectCount;
  data: string;
  fileName: string;
  statusMsg: string;
  isError;
  project_id;
  isCompleted;
  loginuserrole;
  successmsg;
  errmsg;
  closeResult;
  searchname;
  standardChecked;
  startUpload;
  optStandard: string;
  epubStandard: string[] = ['McGraw Hill', 'Standard 1', 'Standard 2', 'ETS'];
 // epubStandard: string[] = ['Standard 1', 'ETS'];
  isEtsType = false;

  routerSegments: Array<any> = [];
  routePath: any;
  noRecords = false;
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  constructor(private http: HttpClient, private modalService: NgbModal, private activemodal: NgbActiveModal, public appConfig: AppConfig, private router: Router, private activatedRoute: ActivatedRoute, private processpdfservice: ProcessPDFService, private cd: ChangeDetectorRef, @Inject(DOCUMENT) private document: Document) {
    this.APIUrl = appConfig.config.apiURL;
    this.fileName = 'UPLOAD FILE';
    localStorage.setItem('chapterval', '');
    localStorage.setItem('pageno', '');
    this.standardChecked = false;
    this.startUpload = false;
    this.optStandard = "";
  }

  ngOnInit() {
    let keyToremove = ["chapterDetails", "tocstatus", "chapterid", "chapterTOC"];
    keyToremove.forEach(k =>
      localStorage.removeItem(k));

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        //   console.log("end url",event.url);
        localStorage.setItem('routerEndurl', event.url);
      }
    });
    this.activatedRoute.url.subscribe(urlsegments => {
      // console.log(urlsegments);
      urlsegments.forEach(segment => {
        this.routerSegments.push(segment.path);
        //   console.log(segment.path);
      });
    });
    this.routePath = this.routerSegments.join('/');
    //   console.log(this.routePath,"  <- segments is");
    this.getProjectList();
    this.uploadbutton = true;
    this.uploadSuccess = false;
    this.myfilename = "No file choosen";
    this.document.body.classList.add('wrapCont');
    this.document.body.classList.remove('open-toc');
    this.loginuserrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
    localStorage.setItem('editaccess', '1');
  }

  /*Standard check and upload*/
  proceedUpload() {
    this.standardChecked = true;
    this.optStandard = this.optStandard.replace(/ /g, '');
    if(this.optStandard == "ETS"){
      this.isEtsType = true;
    }
  }
  changeStandard() {
    this.standardChecked = false;
    this.isEtsType = false;
  }
  /*Function to switch to view/edit page of projects*/
  showMenu(curElement: any) {
    /*let navExtra : NavigationExtras = {queryParams:this.chapterDetails,skipLocationChange: true,replaceUrl: true};*/
    // modal to selectorct the page size 
    console.log('pagesize: ', curElement);
    if (!curElement.project_pagesize) {
      const modalRef = this.modalService.open(PageSizeComponent, {
        backdrop: 'static',
        keyboard: false
      });
      modalRef.result.then((result) => {
        if (result) {
          var userid = curElement.project_user_id;
          var projectid = curElement.project_id;
          var savepagesizeUrl = this.APIUrl + "/savepagesize";
          this.http.post(savepagesizeUrl, { userid: userid, projectid: projectid, size: result }).
            subscribe((data: any) => {

              var response = data;
              console.log(response);
              if (response.status) {
                localStorage.setItem('pagesize', result);
                this.router.navigate(['/editproject', curElement.project_id]);
              }
            })
        }
      });
    } else {
      localStorage.setItem('pagesize', curElement.project_pagesize);
      this.router.navigate(['/editproject', curElement.project_id]);
      // window.open('http://localhost/courseplayer_ereader/?epub=/pod/'+curElement.project_path)
    }
  }
  openEbook(curElement: any) {
    window.open(window.location.protocol + '//' + environment.pod_port + '/pod/courseplayer_ereader/?epub=' + curElement.project_path.replace('/uploads/', '/books/'))
  }

  /*Event to get the project list*/
  getProjectList() {
    var projectlistUrl = this.APIUrl + "/projectslist";
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    let userrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
    this.http.post(projectlistUrl, { userid: userid, userrole: userrole, list: 'allprojects' }).
      subscribe((data: any) => {
        //console.log(data);
        var response = data;
        this.projectListData = response;
        //console.log(response);
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.projectListData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.projectCount = response.length;
        if (this.projectCount == 0) {
          this.noRecords = true;
        }
      })
  }

  // Shwow Toggle menu
  getProjectusername(userid) {
    console.log(userid)
    this.http.post(this.APIUrl + "/getusername", { userid: userid }).
      subscribe((data: any) => {
        var response = data;
        console.log(response)
        return response.username;
      })
  }

  /*List non svg images*/
  svgList(svglist, project) {
    let svglisturl = this.APIUrl + "/getnonsvgimages";
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;

    this.http.post(svglisturl, { 'userid': userid, 'project': project }).
      subscribe((data: any) => {
        var response = data;
        this.svgimagelist = response;
      });
    this.modalService.open(svglist).result.then((result) => { }, (reason) => { });
  }



  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  getFiles(eventsss) {
    this.myfiles = eventsss.target.files;
    this.myfilename = this.myfiles[0].name;
  }

  uploadFile() {
    let uploadUrl = this.APIUrl + "/uploadeps";
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    let inputFormData = new FormData();
    inputFormData.append('file', this.myfiles);
    inputFormData.append('userid', userid);
    inputFormData.append('project', this.projectName);

    let options: RequestOptionsArgs = new RequestOptions();
    options.headers = new Headers();
    options.headers.append("Content-Type", "");

    this.http.post(uploadUrl, inputFormData).
      subscribe((data: any) => {
        var response = data;
        console.log("Upload response -> ", response);
      })
  }


  /*Delete modal window*/
  open(deletecontent, project_id, projectName, ptype) {

    this.statusMsg = "";
    this.fileName = 'UPLOAD FILE';
    this.isError = false;
    this.isCompleted = true;
    this.project_id = project_id;
    this.projectName = projectName;
    //console.log(deletecontent)    

    this.modalService.open(deletecontent).result.then((result) => {
      console.log(result)
      if (result == 'delete') {
        var uploadUrl = this.APIUrl + "/deleteproject";
        this.http.post(uploadUrl, { project_id: this.project_id, project: this.projectName, projecttype: ptype }).
          subscribe((data: any) => {
            console.log(data);
            var response = data;
            this.successmsg = response.msg;
            setTimeout(() => this.successmsg = '', 5000);
            this.getProjectList();
          })
      } else { }
    }, (reason) => {

    });

  }
  getChaptersDetails(project) {
    console.log(project)
  }

  showActions(project) {
    project.action = project.action == true ? false : true;
    this.projectListData.forEach(element => {
      if (element.project_id != project.project_id) {
        element.action = false;
      }
    });
  }
  AddProject(addproject) {
    this.standardChecked = false;
    this.startUpload = false;
    this.optStandard = "";
    this.statusMsg = "";
    this.searchname = "";
    this.getProjectList();
    this.fileName = 'UPLOAD FILE';
    this.modalService.open(addproject, { backdrop: 'static' }).result.then((result) => {
      console.log(result)
      this.router.navigateByUrl('/projectslist');
    }, (reason) => {
      this.router.navigateByUrl('/projectslist');
    });
  }

  reload() {
    this.noRecords = false;
    this.getProjectList();
  }

  uploadProject(event) {
    this.startUpload = true;
    var self = this;
    var file = event.target.files[0];
    this.fileName = event.target.files[0].name;
    let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
    var extn = this.fileName.substr(this.fileName.lastIndexOf('.') + 1);

    var base = location.href.split('#');
    let baseUrl = location.origin;

    var formData = new FormData();
    formData.append('name', event.target.files[0].name);
    formData.append('file', event.target.files[0]);
    formData.append('userid', userid);
    formData.append('fextension', extn);
    formData.append('std', this.optStandard);
    var uploadUrl = this.APIUrl + "/savedata";
    
    var fileUpload = this.processpdfservice;
    if(this.optStandard == 'ETS'){
      document.getElementById('step11').classList.add("fu-process");
      fileUpload.uploadFileToUrl(uploadUrl, formData)
        .subscribe((res) => {
          if (res.json().error) {
            this.statusMsg = res.json().error;
            this.isError = true;
            this.isCompleted = false;
          } else {
            document.getElementById('step11').classList.remove("fu-process");
            document.getElementById('step11').classList.add("fu-success");
  
            var extractUrl = this.APIUrl + "/extractuploadedfile";
            
            document.getElementById('step12').classList.add("fu-process");
            fileUpload.extractFile(res.json().filename, res.json().destination, res.json().project, extractUrl, userid, extn, this.optStandard)
              .subscribe((exres) => {
                document.getElementById('step12').classList.remove("fu-process");
                document.getElementById('step12').classList.add("fu-success");
                document.getElementById('step13').classList.add("fu-process");
                fileUpload.validateepub(res.json().destination, res.json().project, this.APIUrl + "/validateepub", userid, this.optStandard)
                  .subscribe((vfres) => {
                    if (vfres.status != 200) {
                      this.statusMsg = "Epub dosen't meet the standard!";;
                      this.isError = true;
                      this.isCompleted = false;
                      throw { 'msg': 'invalid epub' };
                    }
                    document.getElementById('step13').classList.add("fu-success");
                    this.isCompleted = true;
                    this.statusMsg = 'All changes has been completed successfully';
                    this.cd.detectChanges();
                    this.noRecords = false;
                    this.reload();

                  }, error => {
                    this.statusMsg = "Problem while processing, Please try again later!";
                    this.isError = true;
                    this.isCompleted = false;
                  });

              }, error => {
                this.statusMsg = "Problem while processing, Please try again later!";
                this.isError = true;
                this.isCompleted = false;
              });
          }
        }, error => {
          this.statusMsg = "Problem while processing, Please try again later!";
          this.isError = true;
          this.isCompleted = false;
        });
  
    }
    else{
      document.getElementById('step1').classList.add("fu-process");
      fileUpload.uploadFileToUrl(uploadUrl, formData)
        .subscribe((res) => {
          if (res.json().error) {
            this.statusMsg = res.json().error;
            this.isError = true;
            this.isCompleted = false;
          } else {
            document.getElementById('step1').classList.remove("fu-process");
            document.getElementById('step1').classList.add("fu-success");
  
            if (extn == 'epub') {
              var extractUrl = this.APIUrl + "/extractuploadedfileepub";
            } else {
              var extractUrl = this.APIUrl + "/extractuploadedfile";
            }
            document.getElementById('step2').classList.add("fu-process");
            fileUpload.extractFile(res.json().filename, res.json().destination, res.json().project, extractUrl, userid, extn, this.optStandard)
              .subscribe((exres) => {
                document.getElementById('step2').classList.remove("fu-process");
                document.getElementById('step2').classList.add("fu-success");
  
                document.getElementById('step21').classList.add("fu-process");
                fileUpload.validateepub(res.json().destination, res.json().project, this.APIUrl + "/validateepub", userid, this.optStandard)
                  .subscribe((vfres) => {
                    if (vfres.json() == 0) {
                      this.statusMsg = "Epub dosen't meet the standard!";;
                      this.isError = true;
                      this.isCompleted = false;
                      throw { 'msg': 'invalid epub' };
                    }
                    document.getElementById('step21').classList.add("fu-success");
                    var url = this.APIUrl + "/createmainfest";
                    document.getElementById('step3').classList.add("fu-process");
                    fileUpload.createMainfest(exres.json().project, url, userid, extn)
                      .subscribe((mfres) => {
                        document.getElementById('step3').classList.remove("fu-process");
                        document.getElementById('step3').classList.add("fu-success");
                        // var url = this.APIUrl+"/createcssfiles";
                        document.getElementById('step4').classList.add("fu-process");
                        // fileUpload.createHtmlFiles(exres.json().project,url,userid,extn)
                        // .subscribe((cssres) => {
                        //     if (cssres.json().msg!='none') {
                        //         console.log("css files converted!!!");                                    
                        //       }
                        if (extn == 'epub') {
                          var url = this.APIUrl + "/createhtmlfilesepub";
                          fileUpload.createHtmlFiles(exres.json().project, url, userid, extn)
                            .subscribe((chfres) => {
                              if (chfres.json().msg != 'none') {
                                document.getElementById('step4').classList.remove("fu-process");
                                document.getElementById('step4').classList.add("fu-success");
                              }
                              var url = this.APIUrl + "/removelinksepub";
                              document.getElementById('step5').classList.add("fu-process");
                              fileUpload.removeLinks(exres.json().project, url, userid, extn)
                                .subscribe((rlres) => {
                                  document.getElementById('step5').classList.remove("fu-process");
                                  document.getElementById('step5').classList.add("fu-success");
                                  var url = this.APIUrl + "/fontreplacementsepub";
                                  document.getElementById('step6').classList.add("fu-process");
                                  fileUpload.fontReplacements(exres.json().project, url, userid, extn)
                                    .subscribe((ccres) => {
                                      //     var url = this.APIUrl+"/csschangesepub";
                                      //   document.getElementById('step6').classList.add("fu-process");
                                      //   fileUpload.cssChanges(exres.json().project,url,userid,extn)
                                      //   .subscribe((ccres) => {
                                      document.getElementById('step6').classList.remove("fu-process");
                                      document.getElementById('step6').classList.add("fu-success");
                                      var url = this.APIUrl + "/fontrgbtocmyk";
                                      fileUpload.fontRgbtoCmyk(exres.json().project, url, userid, extn)
                                        .subscribe((rcres) => {
                                          var url = this.APIUrl + "/csschangesepub";
                                          document.getElementById('step7').classList.add("fu-process");
                                          fileUpload.cssChanges(exres.json().project, url, userid, extn, baseUrl)
                                            .subscribe((frres) => {
                                              document.getElementById('step7').classList.remove("fu-process");
                                              document.getElementById('step7').classList.add("fu-success");
  
                                              document.getElementById('step8').classList.add("fu-process");
                                              var std = this.optStandard;
                                              var url = this.APIUrl + "/saveStandard";
                                              fileUpload.saveStandard(exres.json().project, url, userid, extn, std)
                                                .subscribe((frres) => {
                                                  document.getElementById('step8').classList.add("fu-success");
                                                  this.isCompleted = true;
                                                  this.statusMsg = 'All changes has been completed successfully';
                                                  this.cd.detectChanges();
                                                  this.noRecords = false;
                                                  this.reload();
                                                }, error => {
                                                  this.statusMsg = "Problem while processing, Please try again later!";
                                                  this.isError = true;
                                                  this.isCompleted = false;
                                                });
                                            }, error => {
                                              this.statusMsg = "Problem while processing, Please try again later!";
                                              this.isError = true;
                                              this.isCompleted = false;
                                            });
                                        }, error => {
                                          this.statusMsg = "Problem while processing, Please try again later!";
                                          this.isError = true;
                                          this.isCompleted = false;
                                        });
                                    }, error => {
                                      this.statusMsg = "Problem while processing, Please try again later!";
                                      this.isError = true;
                                      this.isCompleted = false;
                                    });
                                }, error => {
                                  this.statusMsg = "Problem while processing, Please try again later!";
                                  this.isError = true;
                                  this.isCompleted = false;
                                });
                            }, error => {
                              this.statusMsg = "Problem while processing, Please try again later!";
                              this.isError = true;
                              this.isCompleted = false;
                            });
  
                        } else {
                          var url = this.APIUrl + "/createhtmlfiles";
                          fileUpload.createHtmlFiles(exres.json().project, url, userid, extn)
                            .subscribe((chfres) => {
                              if (chfres.json().msg != 'none') {
                                document.getElementById('step4').classList.remove("fu-process");
                                document.getElementById('step4').classList.add("fu-success");
                              }
                              var url = this.APIUrl + "/removelinks";
                              document.getElementById('step5').classList.add("fu-process");
                              fileUpload.removeLinks(exres.json().project, url, userid, extn)
                                .subscribe((rlres) => {
                                  document.getElementById('step5').classList.remove("fu-process");
                                  document.getElementById('step5').classList.add("fu-success");
                                  var url = this.APIUrl + "/csschanges";
                                  document.getElementById('step6').classList.add("fu-process");
                                  fileUpload.cssChanges(exres.json().project, url, userid, extn)
                                    .subscribe((ccres) => {
                                      document.getElementById('step6').classList.remove("fu-process");
                                      document.getElementById('step6').classList.add("fu-success");
                                      var url = this.APIUrl + "/fontrgbtocmyk";
                                      fileUpload.fontRgbtoCmyk(exres.json().project, url, userid, extn)
                                        .subscribe((rcres) => {
                                          var url = this.APIUrl + "/fontreplacements";
                                          document.getElementById('step7').classList.add("fu-process");
                                          fileUpload.fontReplacements(exres.json().project, url, userid, extn)
                                            .subscribe((frres) => {
                                              document.getElementById('step7').classList.remove("fu-process");
                                              document.getElementById('step7').classList.add("fu-success");
                                              this.isCompleted = true;
                                              this.statusMsg = 'All changes has been completed successfully';
                                              this.cd.detectChanges();
                                              this.noRecords = false;
                                              this.reload();
                                            }, error => {
                                              this.statusMsg = "Problem while processing, Please try again later!";
                                              this.isError = true;
                                              this.isCompleted = false;
                                            });
                                        }, error => {
                                          this.statusMsg = "Problem while processing, Please try again later!";
                                          this.isError = true;
                                          this.isCompleted = false;
                                        });
                                    }, error => {
                                      this.statusMsg = "Problem while processing, Please try again later!";
                                      this.isError = true;
                                      this.isCompleted = false;
                                    });
                                }, error => {
                                  this.statusMsg = "Problem while processing, Please try again later!";
                                  this.isError = true;
                                  this.isCompleted = false;
                                });
                            }, error => {
                              this.statusMsg = "Problem while processing, Please try again later!";
                              this.isError = true;
                              this.isCompleted = false;
                            });
                        }
                        // },error => {
                        //     this.statusMsg="Problem while processing, Please try again later!";
                        //     this.isError=true;
                        //     this.isCompleted=false;
                        // });
  
                      }, error => {
                        this.statusMsg = "Problem while processing, Please try again later!";
                        this.isError = true;
                        this.isCompleted = false;
                      });
                  }, error => {
                    this.statusMsg = "Problem while processing, Please try again later!";
                    this.isError = true;
                    this.isCompleted = false;
                  });
              }, error => {
                this.statusMsg = "Problem while processing, Please try again later!";
                this.isError = true;
                this.isCompleted = false;
              });
  
          }
        }, error => {
          this.statusMsg = "Problem while processing, Please try again later!";
          this.isError = true;
          this.isCompleted = false;
        });
    }

  }
}

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
