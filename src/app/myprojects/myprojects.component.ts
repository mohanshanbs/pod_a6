import { Component, OnInit, ViewChild, ChangeDetectorRef, Inject } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router, NavigationEnd, ActivatedRoute, NavigationExtras, NavigationStart } from "@angular/router";
import { DOCUMENT } from '@angular/common';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { AppConfig } from '../app-config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, RequestOptionsArgs, RequestOptions, Headers } from "@angular/http";
import { ProcessPDFService } from '../featureModules/editor/pod/services/pdf/process-pdf.service';

/**
 * @title Table with pagination
 */

@Component({
    selector: 'app-myprojects',
    templateUrl: './myprojects.component.html',
    styleUrls: ['./myprojects.component.scss']
})

export class MyprojectsComponent implements OnInit {
    projectListData; uploadbutton; uploadSuccess; myfiles; myfilename; projectName;
    svgimagelist;
    APIUrl;
    displayedColumns = ['project_name', 'project_type', 'chapters', 'project_created_at', 'actions'];
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
    routerSegments: Array<any> = [];
    routePath: any;
    noRecords = false;
    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    constructor(private http: HttpClient, private modalService: NgbModal, public appConfig: AppConfig, private router: Router, private activatedRoute: ActivatedRoute, private route: ActivatedRoute, private processpdfservice: ProcessPDFService, private cd: ChangeDetectorRef, @Inject(DOCUMENT) private document: Document) {
        this.APIUrl = appConfig.config.apiURL;
        this.fileName = 'UPLOAD FILE';
        localStorage.setItem('chapterval', '');
        localStorage.setItem('pageno', '');
    }

    /*Event to get the project list*/
    getProjectList() {
        var projectlistUrl = this.APIUrl + "/myprojectslist";
        let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
        let userrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
        this.http.post(projectlistUrl, { userid: userid, userrole: userrole, list: 'myprojects' }).
            subscribe((data: any) => {
                //   console.log(data);
                var response = data;
                this.projectListData = response;
                this.dataSource = new MatTableDataSource<PeriodicElement>(this.projectListData);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
                this.projectCount = response.length;

                if (this.projectCount == 0) {
                    this.noRecords = true;
                } else {
                    localStorage.setItem('editaccess', response[0].assigned_user_edit);
                }
            })
    }

    // Shwow Toggle menu
    showMenu(curElement: any) {
        /*let navExtra : NavigationExtras = {queryParams:this.chapterDetails,skipLocationChange: true,replaceUrl: true};*/
        let isEdit = curElement.assigned_user_edit;
        localStorage.setItem('isEditable', JSON.stringify(isEdit));
        this.router.navigate(['/editproject', curElement.project_id]);
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

    ngOnInit() {
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

    }
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
    open(deletecontent, project_id, projectName) {
        this.statusMsg = "";
        this.fileName = 'UPLOAD FILE';
        this.isError = false;
        this.project_id = project_id;
        this.projectName = projectName;
        this.modalService.open(deletecontent).result.then((result) => {
            console.log(this.projectName)
            if (result == 'delete') {
                var uploadUrl = this.APIUrl + "/deleteproject";
                this.http.post(uploadUrl, { project_id: this.project_id, project: this.projectName }).
                    subscribe((data: any) => {
                        console.log(data);
                        var response = data;
                        this.successmsg = response.msg;
                        setTimeout(() => this.successmsg = '', 5000);
                        this.getProjectList();
                    })
            } else {
            }
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
    reload() {
        this.getProjectList();
    }
    uploadProject(event) {
        var file = event.target.files[0];
        this.fileName = event.target.files[0].name;
        let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
        var extn = this.fileName.substr(this.fileName.lastIndexOf('.') + 1);

        var formData = new FormData();
        formData.append('name', event.target.files[0].name);
        formData.append('file', event.target.files[0]);
        formData.append('userid', userid);
        formData.append('fextension', extn);
        var uploadUrl = this.APIUrl + "/savedata";

        var fileUpload = this.processpdfservice;
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
                    fileUpload.extractFile(res.json().filename, res.json().destination, res.json().project, extractUrl, userid, extn, '')
                        .subscribe((exres) => {
                            document.getElementById('step2').classList.remove("fu-process");
                            document.getElementById('step2').classList.add("fu-success");
                            var url = this.APIUrl + "/createmainfest";
                            document.getElementById('step3').classList.add("fu-process");
                            fileUpload.createMainfest(exres.json().project, url, userid, extn)
                                .subscribe((mfres) => {
                                    document.getElementById('step3').classList.remove("fu-process");
                                    document.getElementById('step3').classList.add("fu-success");
                                    if (extn == 'epub') {
                                        var url = this.APIUrl + "/createhtmlfilesepub";
                                        document.getElementById('step4').classList.add("fu-process");
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
                                                        var url = this.APIUrl + "/csschangesepub";
                                                        document.getElementById('step6').classList.add("fu-process");
                                                        fileUpload.cssChanges(exres.json().project, url, userid, extn)
                                                            .subscribe((ccres) => {
                                                                document.getElementById('step6').classList.remove("fu-process");
                                                                document.getElementById('step6').classList.add("fu-success");
                                                                var url = this.APIUrl + "/fontrgbtocmyk";
                                                                fileUpload.fontRgbtoCmyk(exres.json().project, url, userid, extn)
                                                                    .subscribe((rcres) => {
                                                                        var url = this.APIUrl + "/fontreplacementsepub";
                                                                        document.getElementById('step7').classList.add("fu-process");
                                                                        fileUpload.fontReplacements(exres.json().project, url, userid, extn)
                                                                            .subscribe((frres) => {
                                                                                document.getElementById('step7').classList.remove("fu-process");
                                                                                document.getElementById('step7').classList.add("fu-success");
                                                                                this.isCompleted = true;
                                                                                this.statusMsg = 'All changes has been completed successfully';
                                                                                this.cd.detectChanges(); this.reload();
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
                                        document.getElementById('step4').classList.add("fu-process");
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
                                                                                this.cd.detectChanges(); this.reload();
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

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}