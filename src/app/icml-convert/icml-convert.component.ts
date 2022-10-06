import {
    Component,
    OnInit,
    Renderer2,
    Inject,
    ViewChild
} from '@angular/core';
import {
    HttpClient, HttpHeaders
} from '@angular/common/http';
import {
    HttpModule,
    Http,
    RequestOptionsArgs,
    RequestOptions,
    Headers
} from "@angular/http";
import {
    Observable,
    BehaviorSubject,
    Subject
} from 'rxjs';
import {
    AppConfig
} from '../app-config';

import { ProcessPDFService } from '../featureModules/editor/pod/services/pdf/process-pdf.service';
import { Router, NavigationEnd, ActivatedRoute, NavigationExtras, NavigationStart } from "@angular/router";
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';

@Component({
    selector: 'app-icml-convert',
    templateUrl: './icml-convert.component.html',
    styleUrls: ['./icml-convert.component.scss']
})
export class IcmlConvertComponent implements OnInit {

    APIUrl;
    HOSTUrl;
    baseUrl;
    pdfServiceURL;
    fileName;
    uploadedProjectID;
    displayedColumns = ['chapters'];
    dataSource;
    noRecords: boolean = false;
    showChapterList: boolean = false;
    chapterCount;
    chapterListData;
    projectName;
    pageList;
    icmlchapter;
    columnheader;
    constructor(
        private http: HttpClient,
        public appConfig: AppConfig,
        private uploadservice: ProcessPDFService,
        private router: Router,
        private activatedRoute: ActivatedRoute) {
        this.APIUrl = appConfig.config.apiURL;
        this.HOSTUrl = appConfig.config.hostURL;
    }

    ngOnInit() {
        this.noRecords = false;
        this.showChapterList = true;
        this.activatedRoute.params.subscribe(params => {
            this.projectName = params.pname;
        });
        //this.projectName = 'Chapter01-05';
        this.cleardirectory();
        this.dataSource = new MatTableDataSource<PeriodicElement>([]);
        this.getChapterDetails();
    }
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    cleardirectory() {
        var directoryurl = this.APIUrl + "/cleardirectory";
        this.http.post(directoryurl, {}).
            subscribe((data: any) => {
                var response = data;
            });
    }

    uploadProject(event) {

        var self = this;
        var file = event.target.files[0];
        this.fileName = event.target.files[0].name;
        //let userid = '1';
        let userid = (JSON.parse(localStorage.getItem('currentUser'))).userid;
        //let userrole = (JSON.parse(localStorage.getItem('currentUser'))).userrole;
        var extn = this.fileName.substr(this.fileName.lastIndexOf('.') + 1);

        var base = location.href.split('#');
        let baseUrl = location.origin;


        var formData = new FormData();
        formData.append('name', event.target.files[0].name);
        formData.append('file', event.target.files[0]);
        formData.append('userid', userid);
        formData.append('fextension', extn);

        var fileUpload = this.uploadservice;
        var uploadUrl = this.APIUrl + "/savedata";
        fileUpload.uploadFileToUrl(uploadUrl, formData).subscribe((res) => {
            if (res.json().error) {
            } else {
                if (extn == 'epub') {
                    var extractUrl = this.APIUrl + "/extractuploadedfileepub";
                } else {
                    var extractUrl = this.APIUrl + "/extractuploadedfile";
                }
                fileUpload.extractFile(res.json().filename, res.json().destination, res.json().project, extractUrl, userid, extn, '')
                    .subscribe((exres) => {
                        this.getChapterDetails();
                    }, error => {

                    });
            }
        }, error => {
        });

    }
    getChapterDetails() {
        this.columnheader = 'Chapters';
        var chapterlistUrl = this.APIUrl + "/getChapters";
        this.http.post(chapterlistUrl, {
            project_name: this.projectName
        }).
            subscribe((data: any) => {
                var response = data;
                this.chapterListData = JSON.parse(JSON.stringify(response.chapter_list));
                this.showChapterList = true;
                this.chapterCount = response.length;
                this.dataSource = new MatTableDataSource<PeriodicElement>(this.chapterListData);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            })
    }

    showChapterHtml(ele) {
        this.columnheader = 'Pages';
        var value_ele;
        var pageArr = [];
        var htmlList = this.APIUrl + "/getChapterHtmls";
        this.icmlchapter = ele;
        this.http.post(htmlList, {
            chapter_name: ele,
            project_name: this.projectName
        }).
            subscribe((data: any) => {
                var response = data;
                for (var i = 0; i < response.html_list.length; i++) {
                    value_ele = response.html_list[i];
                    if ((value_ele.split('.')[1]).toString().toLowerCase() === 'html') {
                        pageArr.push(value_ele)
                    }
                }
                this.pageList = JSON.parse(JSON.stringify(pageArr));
                this.dataSource = new MatTableDataSource<PeriodicElement>(this.pageList);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;

            });
    }

    pageSelected(ele) {
        var selectedpage = this.APIUrl + "/copyfiles";
        this.http.post(selectedpage, {
            project_name: this.projectName,
            chapter_name: this.icmlchapter,
            page_name: ele
        }).
            subscribe((data:any) => {
                var response = data;
                if (response.status) {
                    //this.document.location.href = this.HOSTUrl + '/icml_css_1/index.html?page=' + ele+'?chapter='+this.icmlchapter ;
                    this.router.navigate(['/projectslist/conversionprocess', this.icmlchapter + '&' + ele]);
                }
            });

    }

    tableSelect(ele) {
        if (this.columnheader === 'Chapters') {
            this.showChapterHtml(ele);

        } else if (this.columnheader === 'Pages') {
            this.pageSelected(ele);
        }
    }
    selectChapter() {
        this.columnheader = 'Chapters';
        this.dataSource = new MatTableDataSource<PeriodicElement>(this.chapterListData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

}

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}