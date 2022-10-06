/*Library and components declaration*/
import { Component, OnInit, AfterViewInit, Inject, HostListener, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { Http, RequestOptionsArgs, RequestOptions, Headers } from "@angular/http";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/platform-browser';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ProjectDataService } from '../services/project-data.service';
import { EditorService } from '../services/editor.service';
import { ProcessPDFService } from '../services/pdf/process-pdf.service';
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { AppConfig } from '../../../../app-config';
import { htmlEncode } from 'node_modules/js-htmlencode';
import * as jquery from 'jquery';
import { ignoreElements } from 'rxjs/operators';
import { pdfEditorService } from '../services/pdfEditor.service';
import { Subscription } from 'rxjs';
import { _ } from 'underscore';
import { MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material';
import { NgbModal, NgbActiveModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { modelDialogComponent } from '../model-dialog/model-dialog.component';
import { NgxSpinnerService } from 'ngx-spinner';
export interface DialogData {
	createlink: string;
}

/*Component template declaration*/
@Component({
	selector: 'app-editchapter-page',
	templateUrl: './editchapter-page.component.html',
	styleUrls: ['./editchapter-page.component.scss'],
	providers: [NgbModal, NgbActiveModal]
},

)

/*Method initiazation*/
export class EditchapterPageComponent implements OnInit, AfterViewInit {
	createlink: string;
	APIUrl;
	selectedElement;
	actionBold; actionItalic; actionUnderline; actionStrike; actionSub; actionSuper; actionPageBreak; actionOl; actionUl; actionH1; actionIndent; actionH2; actionCreateLink; actionUnLink;
	activePage;
	editorView = true;
	contentLoad = false;
	editorData;
	editIcon;
	currentNavigationPage = 1;
	positionValue;
	headers: Headers = new Headers({ 'Content-Type': 'application/json' });
	options: RequestOptions = new RequestOptions({ headers: this.headers });
	nodeElems: any;
	nodeEditors: any;
	iframe: any;
	editorFramewindow: any;
	contentdocument: any;
	ttIdx: number;
	elemKey: number = 0;
	uploadURL: any;
	navcondition = false;
	pageVariable: number = 0;
	currentChaptertoc: any;
	routerSegments: Array<any> = [];
	routePath: any;
	chapterName: any;
	@HostListener('window:resize', ['$event'])
	onResize(event) {
		if (screen.width === window.innerWidth) {
			this.editorView = true;
		} else {
			this.editorView = false;
		}
	}
	private listener: Subscription;
	public sectionArray: any = [];
	public sectionCount: any = 0;
	public jsonData: any;
	public editorserviceval: any;

	constructor(private http: HttpClient,
		private sanitizer: DomSanitizer,
		private modalService: NgbModal, private activemodal: NgbActiveModal,
		@Inject(DOCUMENT) private document: any,
		private dataservice: ProjectDataService,
		private activatedRouter: ActivatedRoute,
		private editorservice: EditorService,
		private processpdfservice: ProcessPDFService,
		public appConfig: AppConfig,
		private router: Router,
		public renderer: Renderer2,
		public dialog: MatDialog,
		private spinner: NgxSpinnerService,
		public pdfEditor: pdfEditorService) {
		this.APIUrl = appConfig.config.apiURL;
		this.uploadURL = this.appConfig.config.uploadsURL;
		this.editorserviceval = this.editorservice.FileData.subscribe(tocDetails => {
			this.contentLoad = true;
			this.getHtmlFile(tocDetails);
			this.ttIdx = 0;
		});
	}
	public editorServiceObject: any;
	public editorUniqId: any;
	/*Component Initilization*/
	ngOnInit() {
		this.chapterName = JSON.parse(localStorage.getItem('chapterTOC'));
		this.activatedRouter.url.subscribe(urlsegments => {
			// console.log(urlsegments);
			urlsegments.forEach(segment => {
				this.routerSegments.push(segment.path);
				//   console.log(segment.path);
			});
		});
		this.routePath = this.routerSegments.join('/');
		//   console.log(this.routePath,"  <- segments is");
		this.positionValue = 0;
		this.activatedRouter.queryParams.subscribe(params => {
			// console.log(JSON.parse(localStorage.getItem('chapterTOC')),"  child page params ->  ",params);
			if ((params == null || params == undefined || _.isEmpty(params)) && (localStorage.getItem('chapterTOC'))) {
				this.currentChaptertoc = JSON.parse(localStorage.getItem('chapterTOC'));
			}
			else {
				this.currentChaptertoc = params;
			}

			this.pdfEditor.renderer = this.renderer;
			this.listener = this.pdfEditor.Observables()
				.subscribe((data) => {
					// console.log(data,"   <- pdfeditor observable method ")
					this.sectionArray = data.sectionArray;
					this.sectionCount = data.sectionCount;
					this.jsonData = data.jsonData;
					this.editorUniqId = data.uniqId;
					this.copySectionData = this.contentdocument.body.innerHTML;

					if (this.sectionCount != 0)
						this.pageWiseHTMLSave()

					// if(this.contentdocument.body.childNodes.length>0){
					// 	while(this.contentdocument.body.firstChild){
					// 		this.contentdocument.body.removeChild(this.contentdocument.body.firstChild)
					// 	}
					// }
					// this.contentdocument.body.appendChild(this.sectionArray[this.sectionCount]);

					// this.copySectionData = Object.assign([],this.contentdocument.body.children);
					// this.editorServiceObject.sectionArray = data.sectionArray;
					// this.editorServiceObject.sectionCount = data.sectionCount;
					// this.editorServiceObject.jsonData = data.jsonData;
				})
		});
	}

	public copySectionData: any;
	ngOnDestroy() {
		this.editorserviceval.unsubscribe();
		this.listener.unsubscribe();
	}

	@ViewChild('iframe') iframeElement: ElementRef;
	/*Method to initialize the properties after view is initialized.*/
	ngAfterViewInit() {
		this.contentLoad = true;
		this.contentdocument = this.iframeElement.nativeElement.contentDocument;
		var csslink = new Promise((resolve, reject) => {
			this.pdfEditor.iframeCssLinks(this.contentdocument, this.currentChaptertoc.folder, resolve, reject);
		})
		csslink.then(() => {
			this.getHtmlFile(this.currentChaptertoc);
			this.contentLoad = false;

		});
		if (this.navcondition == false) {
			this.contentdocument.body.classList.remove('page-even');
			this.contentdocument.body.classList.add('page-odd');
		} else {
			this.contentdocument.body.classList.remove('page-odd');
			this.contentdocument.body.classList.add('page-even');
		}

		// this.ttIdx = 0;	
	}

	getHtmlFile(tocDetails) {
		if (!this.contentdocument) {

			return;
		}
		this.spinner.show();
		this.editorData = tocDetails;
		this.contentdocument.designMode = "on";
		this.contentdocument.body.innerHTML = "";

		this.pdfEditor.getHtmlFile(tocDetails, this.contentdocument, this.sectionCount)
		this.contentLoad = false;

	}


	public stringConcade(str) {
		const re = /\b[\w']+(?:\s+[\w']+){0,0}/g;
		const wordList = str.match(re);
		return wordList;
	}

	/**page navigation */
	pageNavigation(state, nav) {

		this.iframe = document.getElementById("editableFrame");
		this.contentdocument = (<HTMLIFrameElement>this.iframe).contentDocument;
		let _id = JSON.parse(this.contentdocument.getElementsByClassName('dynamicSection')[0].getAttribute('id').split('_')[1]);
		if (state == 'next' && _id < (this.sectionArray.length - 1)) {

			_id++;

			this.contentdocument.body.innerHTML = '';
			if (this.sectionArray[_id].attributes.isChildLoaded == 'true') {
				this.contentdocument.body.appendChild(this.sectionArray[_id]);
			} else {
				this.pdfEditor.startSectionFrameCreation(this.contentdocument, _id, this.jsonData, true, this.editorUniqId);
			}
			if (this.navcondition == true) {
				this.navcondition = false;
			} else {
				this.navcondition = true;
			}

		} else if (state == 'previous' && _id > 0) {

			_id--;

			this.contentdocument.body.innerHTML = '';
			if (this.sectionArray[_id].attributes.isChildLoaded == 'true') {
				this.contentdocument.body.appendChild(this.sectionArray[_id]);
			} else {
				this.pdfEditor.startSectionFrameCreation(this.contentdocument, _id, this.jsonData, true, this.editorUniqId);
			}
			if (this.navcondition == true) {
				this.navcondition = false;
			} else {
				this.navcondition = true;
			}
		}

		if (this.navcondition == false) {
			this.contentdocument.body.classList.remove('page-even');
			this.contentdocument.body.classList.add('page-odd');
		} else {
			this.contentdocument.body.classList.remove('page-odd');
			this.contentdocument.body.classList.add('page-even');
		}
	}


	/** Appending parent to DOM*/
	public pushElem: any;
	public storeArray = [];
	SectionAppendChild(elem, tagElement) {
		const newElement = this.renderer.createElement(elem);
		let oldElement;
		if (this.storeArray.length == 0) {
			this.storeArray.push(newElement);
			this.renderer.appendChild(newElement, tagElement)
			this.pushElem = newElement
		} else {
			oldElement = this.storeArray[0];
			this.storeArray = [];
			this.renderer.appendChild(newElement, oldElement);
			this.storeArray.push(newElement);
			this.pushElem = newElement;
		}
		return this.pushElem;
	}
	/**ends */
	/**Get parents code */
	getParents(a, count) {
		var parents = [];
		while (a) {
			parents.unshift(a);
			if (a.parentNode) {
				if (a.parentNode.id == 'section_' + count) {
					break;
				}
				//this.renderer.appendChild(a.parentNode,a)
				a = a.parentNode;
			}
		}
		return parents;
	}
	/** code ends */

	public dialogRef: any;
	textFormat(type, status) {
		var tag;
		let formatType = type.toUpperCase();
		//const contentWindow = this.editorFramewindow.contentWindow;
		const contentWindow = this.iframeElement.nativeElement.contentWindow;

		if (contentWindow.getSelection) {
			this.selectedElement = contentWindow.getSelection().toString();
			var selection = contentWindow.getSelection();
			var range = selection.getRangeAt(0);
			if (formatType == "BOLD") {
				this.actionBold = status == true ? false : true;
				contentWindow.document.execCommand('bold', false, null);
			} else if (formatType == "ITALIC") {
				this.actionItalic = status == true ? false : true;
				contentWindow.document.execCommand('italic', false, null);
			} else if (formatType == "UNDERLINE") {
				this.actionUnderline = status == true ? false : true;
				contentWindow.document.execCommand('underline', false, null);
			} else if (formatType == "STRIKE") {
				this.actionStrike = status == true ? false : true;
				contentWindow.document.execCommand('strikeThrough', false, null);
			} else if (formatType == "SUPERSCRIPT") {
				this.actionSuper = status == true ? false : true;
				contentWindow.document.execCommand('superscript', false, null);
			} else if (formatType == "SUBSCRIPT") {
				this.actionSub = status == true ? false : true;
				contentWindow.document.execCommand('subscript', false, null);
			} else if (formatType == "H1") {
				this.actionH1 = status == true ? false : true;
				var highlight = contentWindow.getSelection().getRangeAt(0).toString();
				contentWindow.document.execCommand('insertHTML', false, "<h1>" + highlight + "</h1>");
			} else if (formatType == "H2") {
				this.actionH2 = status == true ? false : true;
				var highlight = contentWindow.getSelection().getRangeAt(0).toString();
				contentWindow.document.execCommand('insertHTML', false, "<h2>" + highlight + "</h2>");
			} else if (formatType == "CREATELINK") {
				this.actionCreateLink = status == true ? false : true;

				this.dialogRef = this.dialog.open(modelDialogComponent, {
					height: '200px',
					width: '400px',
					data: { page: "createlink", createlink: "http://" }
				});
				this.dialogRef.afterClosed().subscribe(result => {
					if (result.status == "save") {
						this.createlink = result.createlink;
						if (this.createlink != "") {
							var highlight = contentWindow.getSelection().getRangeAt(0).toString();
							contentWindow.document.execCommand('insertHTML', false, '<a href="' + this.createlink + '" target="_blank">' + highlight + '</a>');
						}

					}

				});


			} else if (formatType == "UNLINK") {
				this.actionUnLink = status == true ? false : true;
				contentWindow.document.execCommand('unlink', false, false);
			} else if (formatType == "INDENT") {
				this.actionIndent = status == true ? false : true;
				contentWindow.document.execCommand('indent', false, null);
			} else if (formatType == "ORDEREDLIST") {
				this.actionOl = status == true ? false : true;
				var highlight = contentWindow.getSelection().getRangeAt(0).toString();
				var parentChild = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.localName;
				if (parentChild == "ol" || parentChild == "ul") {
					var node = document.createElement("LI"); // Create a <li> node
					var textnode = document.createTextNode(highlight); // Create a text node
					node.appendChild(textnode);
					contentWindow.document.execCommand('delete');  // Delete the highlighted text
					contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.appendChild(node);
				} else {
					contentWindow.document.execCommand('insertorderedlist', false, null);
				}
			}
			else if (formatType == "UNORDEREDLIST") {
				this.actionUl = status == true ? false : true;
				var highlight = contentWindow.getSelection().getRangeAt(0).toString();
				var parentChild = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.localName;
				if (parentChild == "ol" || parentChild == "ul") {
					var node = document.createElement("LI"); // Create a <li> node
					var textnode = document.createTextNode(highlight); // Create a text node
					node.appendChild(textnode);
					contentWindow.document.execCommand('delete');  // Delete the highlighted text
					contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.appendChild(node);

				} else {
					contentWindow.document.execCommand('insertUnorderedList', false, null);
				}
			}
			else if (formatType == "INSERTHTML") {
				var highlight = contentWindow.getSelection().getRangeAt(0).toString();
				var lengthHighlight = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.attributes;

				if (lengthHighlight.length == 1 && (lengthHighlight[0].ownerElement.localName == "span" && lengthHighlight[0].ownerElement.className == "page-break")) {
					contentWindow.document.execCommand('insertHTML', false, '<span>' + highlight + '</span>');
				} else {
					contentWindow.document.execCommand('insertHTML', false, '<span class="page-break">' + highlight + '</span>');
				}

				this.actionPageBreak = status == true ? false : true;
			}

		}
	}

	createPageElement() {
		let parent = this.renderer.createElement('div');
		this.renderer.setAttribute(parent, 'id', 'parent');
		let _This = this;
		let sec_obj = Object.assign({}, this.sectionArray)
		let count: number = 0;
		for (var prop in sec_obj) {
			count++;
			let page = _This.renderer.createElement('div');
			_This.renderer.setAttribute(page, 'id', 'page_' + count);
			_This.renderer.setAttribute(page, 'class', 'paginator');
			if (prop == "0") {
				page.innerHTML = sec_obj[prop].innerHTML;
			} else {
				for (let i in sec_obj[prop].childNodes) {
					if (i == '0')
						continue

					page.innerHTML += sec_obj[prop].childNodes[i].innerHTML == undefined ? '' : sec_obj[prop].childNodes[i].innerHTML;
					console.log(i)
				}
			}

			parent.appendChild(page);
		}
		return parent
	}
	pageWiseHTMLSave() {
		this.spinner.show();
		let url = this.router.url;
		let strarr = url.split('/');
		console.log(strarr.indexOf("editor"));
		console.log(strarr[3] + "-" + strarr[4])
		if (strarr.indexOf("editor") != -1 && strarr[4] != "editor") {
			let obj = 'projectslist/' + '/editproject' + '/' + strarr[3] + '/' + strarr[4];
		} else {
			let obj = 'projectslist/' + '/editproject' + '/' + strarr[3];
		}
		/** below code to change HTML css to pdf css - starts */
		let head = this.renderer.createElement('div')
		// head.innerHTML =  this.contentdocument.head.innerHTML;
		let TOc_copy = Object.assign({}, this.editorData)
		let uploadsURL = "./pod_assets/uploads/";
		let _This = this;
		// head.innerHTML.replace(uploadsURL + TOc_copy.folder + '/assets/css','../../..')
		let contentWindow = Object.assign(this.contentdocument.head);
		let yy = Array.from(contentWindow.children)
		_.each(contentWindow.children, (x) => {
			if (x.nodeName.toLowerCase() == 'script') {
				head.innerHTML += x.outerHTML
			} else if (x.nodeName.toLowerCase() == 'link') {
				let link = _This.renderer.createElement('link');
				this.renderer.setAttribute(link, 'rel', 'stylesheet')
				let path = x.href;
				let new_path: any = '';
				let crop: any = '';

				do {
					let value = Math.round(path.indexOf('assets/') + 7) || Math.round(path.indexOf('pod_assets/') + 11);
					path = path.substr(value)

				} while (path.indexOf('pod_assets/') > 0 || path.indexOf('assets/') > 0)

				new_path = path.substring(Math.round(path.lastIndexOf('/') + 1), path.indexOf('.css')) == 'iframe' ? '../../../../' + path : '../../assets/' + path;
				this.renderer.setAttribute(link, 'href', new_path)
				head.innerHTML += link.outerHTML
			} else {
				head.innerHTML += x.outerHTML
			}
		})


		// let head = this.renderer.createElement('div');
		let htmlcontent = this.createPageElement();

		let headerContent = head.innerHTML;

		let find = this.uploadURL + this.editorData.folder;
		let regex = new RegExp(find, "g");
		let relativepathContent = htmlcontent.innerHTML.replace(regex, "../..");
		let _this = this;
		this.http.post(this.APIUrl + '/createPageHtml', { 'str': htmlEncode(relativepathContent), 'headercontent': htmlEncode(headerContent), 'toc': TOc_copy, 'count': (this.sectionCount - 1) }).subscribe((data: any) => {
			console.log(data, " saveedithtml    ");
			_this.spinner.hide();
		});
		// this.spinner.hide();				

	}

	alertForSave() {
		window.onbeforeunload = (ev) => {
			var dialogText = 'Changes that you made may not be saved.';
			ev.returnValue = dialogText;
			return dialogText;
		};
	}
	public section_json: any = [];
	public startSection: any;
	public editableObject: any = [];
	public existingElement: any = [];
	public newElement: any = [];
	saveChapter() {
		/** temporary code - need to change in future */
		this.pageWiseHTMLSave();

		// this.processpdfservice.generatePDF(this.editorData,'').subscribe(savedPdf =>{
		// 	let currentChapterid = (localStorage.getItem('chapterTOC')) ? JSON.parse(localStorage.getItem('chapterTOC')).pc_project_id : null;
		// 	(currentChapterid && currentChapterid != null) ? this.router.navigate(['/editproject',currentChapterid]) : this.router.navigate(['projectslist']);
		// });
		/**ends */

		// var url=this.router.url;
		// var strarr=url.split('/');  
		// console.log(strarr.indexOf("editor"));
		// console.log(strarr[3]+"-"+strarr[4])   		
		// if (strarr.indexOf("editor") != -1 && strarr[4]!="editor") {
		//    var obj='projectslist/'+'/editproject'+'/'+strarr[3]+'/'+strarr[4];
		// }else{
		// var obj='projectslist/'+'/editproject'+'/'+strarr[3];
		// }		
		// /** below code to change HTML css to pdf css - starts */
		// var links=this.contentdocument.head.getElementsByTagName('link');			
		// for (var c = 0; c < links.length; c++) {
		// 	var csslink = links[c].href;
		// 	if(csslink.indexOf('_HTML.css')>0){
		// 		csslink = csslink.split("_HTML.css")[0]+".css";								
		// 		var relativeHeader = csslink.split("pod_assets/uploads/"+this.editorData.folder)[1];
		// 		csslink = "../.."+relativeHeader;				
		// 		links[c].parentNode.removeChild(links[c]);	c--;			
		// 		const appendcsslink  = document.createElement('link');
		// 		appendcsslink.rel = 'stylesheet';
		// 		appendcsslink.href = csslink;
		// 		this.contentdocument.head.appendChild(appendcsslink);
		// 	}else if(csslink.indexOf("pod_assets/editorFiles") > 0 ){
		// 		links[c].parentNode.removeChild(links[c]);	c--;
		// 	}	
		// }
		// var scripts = this.contentdocument.head.getElementsByTagName('script');
		// var cc = scripts.length;
		// while (cc--) {
		// 	scripts[cc].parentNode.removeChild(scripts[cc]);
		// }
		// /** above code to change HTML css to pdf css - ends */
		// var arr=[]

		// // var promise = new Promise((resolve,reject)=>{
		// // 	this.EditorToHtmlPdf(resolve,reject);
		// // })  
		// //promise.then(()=>{

		// 	var getContent = this.nonEditableHTMLContent == '' || this.nonEditableHTMLContent == undefined?this.newSaveEditor():this.nonEditableHTMLContent.innerHTML;
		// 	var htmlcontent = this.nonEditableHTMLContent == '' || this.nonEditableHTMLContent == undefined?getContent.innerHTML:this.nonEditableHTMLContent.innerHTML;
		// 	var headerContent = this.contentdocument.head.innerHTML;
		// 	var find = this.uploadURL+this.editorData.folder;
		// 	var regex = new RegExp(find, "g");
		// 	var relativepathContent = htmlcontent.replace(regex, "../..");				
		// 	var blob = new Blob([htmlcontent], {type: "text/html"});
		// 	const formData: FormData = new FormData();   
		// 	formData.append('filecontent',blob);
		// 	formData.append('chapter',this.editorData);
		// 	//console.log(htmlcontent);	
		// 	var blobUrl = window.URL.createObjectURL(blob);
		// 	//console.log(relativepathContent); 
		// 	let options: RequestOptionsArgs = new RequestOptions();
		// 	options.headers = new Headers();
		// 	options.headers.append("Content-Type", 'multipart/form-data;boundary='+Math.random());
		// 	options.headers.append('Accept', 'application/json');

		// 	this.http.post(this.APIUrl+'/createPageHtml',{'str':htmlEncode(relativepathContent),'headercontent':htmlEncode(headerContent),'toc':this.editorData}).subscribe(data => {
		// 		console.log(data," saveedithtml    ");    
		// 		this.processpdfservice.generatePDF(this.editorData,'').subscribe(savedPdf =>{
		// 			let currentChapterid = (localStorage.getItem('chapterTOC')) ? JSON.parse(localStorage.getItem('chapterTOC')).pc_project_id : null;
		// 			(currentChapterid && currentChapterid != null) ? this.router.navigate(['/editproject',currentChapterid]) : this.router.navigate(['projectslist']);
		// 		});

		// 	});	
		// //})
	}
	/**deleting unwanted quill editor elements */
	deletingQuillElements(element) {
		let value = function () {
			let count: number = 0;
			while (element.childNodes.length > 1) {
				if (element.childNodes[count].classList.contains('ql-clipboard') || element.childNodes[count].classList.contains('ql-tooltip')) {
					element.childNodes[count].parentNode.removeChild(element.childNodes[count]);
				} else {
					count++;
				}

			}
			let x = element;
			// let parent = this.renderer.createElement('div')
			// if(x.childNodes.length<=1 && x.children[0].classList.contains('ql-editor')){
			// 	if(x.children[0].children.length>1){
			// 		while(x.children[0].children.firstChild){
			// 			let span = document.createElement('span')	
			// 			span.innerHTML = x.children[0].children.firstChild.innerHTML
			// 			parent.appendChild(span);
			// 			x.children[0].children.removeChild(x.children[0].children.firstChild)
			// 		}
			// 	}
			// }
			// if(x.childNodes.length == 0){
			// 	while(parent.children.length>0){
			// 		x.appendChild(parent.children.firstChild)
			// 	}
			// }
			return x;
		}
		return value;
	}
	EditorToHtmlPdf(resolve, reject) {
		let sectionTemp = this.renderer.createElement('section');
		this.sectionArray.forEach((x) => {
			if (sectionTemp.childNodes.length > 1) {
				while (sectionTemp.firstChild) {
					sectionTemp.removeChild(sectionTemp.firstChild)
				}
			}

			while (x.childNodes.length > 0) {
				sectionTemp.appendChild(x.childNodes[0]);
			}
			this.existingElement = sectionTemp.getElementsByClassName('ql-container ql-bubble');
			this.newElement = sectionTemp.getElementsByClassName('newlyAddedElement');

			if (this.existingElement.length > 0) {
				for (var i = 0; i < this.existingElement.length; i++) {
					let val = this.deletingQuillElements(this.existingElement[i])
					this.editableObject.push({ type: 'existing', element: val() })
				}
			}
			if (this.newElement.length > 0) {
				for (var i = 0; i < this.newElement.length; i++) {
					this.editableObject.push({ type: 'new', element: this.newElement[i], parentNode: this.newElement[i].parentNode })
				}
			}
		})
		if (this.editableObject.length > 0) {
			if (sectionTemp.childNodes.length > 0) {
				while (sectionTemp.firstChild) {
					sectionTemp.removeChild(sectionTemp.firstChild)
				}
			}
			this.startSection = '';
			this.startSection = sectionTemp;
			for (var tkey in this.jsonData) {
				this.pdfEditor.createSectionElements(this.jsonData[tkey], this.startSection, 0, true, false, function (section, _This) {
					_This.startSection = section != '' ? section : '';
				});
			}
			if (this.editableObject.length > 0) {
				this.editableObject.forEach((x) => {
					if (x.type == 'existing') {
						let uniqId = x.element.getAttribute('uniqId');
						let elem1 = this.startSection.querySelector('[unidIdCount=' + uniqId + ']')
						elem1.replaceWith(x.element)
					} else {

						let uniqId = x.parentNode.getAttribute('uniqId');
						let elem1 = this.startSection.querySelector('[unidIdCount=' + uniqId + ']');
						x.element.classList.remove('newlyAddedElement');
						let indxAt = Array.from(x.parentNode.children).indexOf(x.element);
						elem1.insertBefore(x.element, elem1.childNodes[indxAt]);
					}

				})
			}
		} else {
			if (sectionTemp.childNodes.length > 0) {
				while (sectionTemp.firstChild) {
					sectionTemp.removeChild(sectionTemp.firstChild)
				}
			}
			this.startSection = '';
			this.startSection = sectionTemp;
			for (var tkey in this.jsonData) {
				this.pdfEditor.createSectionElements(this.jsonData[tkey], this.startSection, 0, true, false, function (section, _This) {
					_This.startSection = section != '' ? section : '';
				});
			}
		}
		let new_modifiedJSON = this.pdfEditor.createJson(this.startSection, '', '', true, true);
		this.contentdocument.body.innerHTML = '';
		let section = this.renderer.createElement('section');
		this.renderer.addClass(section, 'new_section_final');
		this.startSection = section;
		for (var tkey in new_modifiedJSON) {
			this.pdfEditor.createSectionElements(new_modifiedJSON[tkey], this.startSection, 0, true, false, function (section, _This) {
				_This.startSection = section != '' ? section : '';
			});
		}
		while (this.startSection.childNodes.length > 0) {
			this.contentdocument.body.appendChild(this.startSection.childNodes[0]);
		}
		resolve('completed')
		console.log('editableObj', this.contentdocument.body);
	}


	saveDialog(state) {
		this.dialogRef.close(state)
	}
	closeDialog(state) {
		this.dialogRef.close(state)
	}
	public nonEditableHTMLContent: any;
	newSaveEditor() {
		let sectionTemp = this.renderer.createElement('section');
		if (sectionTemp.childNodes.length > 0) {
			while (sectionTemp.firstChild) {
				sectionTemp.removeChild(sectionTemp.firstChild)
			}
		}
		this.startSection = '';
		this.startSection = sectionTemp;
		for (var tkey in this.jsonData) {
			this.pdfEditor.createSectionElements(this.jsonData[tkey], this.startSection, 0, true, false, function (section, _This) {
				_This.startSection = section != '' ? section : '';
			});
		}
		this.nonEditableHTMLContent = '';
		this.nonEditableHTMLContent = this.startSection;
		console.log('nonEditable', this.nonEditableHTMLContent)
		//resolve('completed')
		//console.log('editableObj',this.contentdocument.body);
	}

	/**save changes before pdf view */
	editorSave() {

		this.dialogRef = this.dialog.open(modelDialogComponent, {
			height: '400px',
			width: '600px',
			data: { page: "editorsave" }
		});

		this.dialogRef.afterClosed().subscribe(result => {
			if (result.status == 'save') {
				if (this.nonEditableHTMLContent == '' || this.nonEditableHTMLContent == undefined)
					this.newSaveEditor()

				let OverAllnodes = this.sectionArray[this.sectionCount];
				let _Id = this.editorUniqId;
				let eachLoop = function (nodes, _This) {
					//nodes.forEach((x)=>{

					// })
					_.each(nodes, function (x) {
						if (x.classList.contains('frameBorders'))
							return;

						let uniqId = x.getAttribute('uniqId');
						let duplicateElement = _This.sectionArray[_This.sectionCount].querySelectorAll('[unidIdCount=' + uniqId + ']')
						if (duplicateElement.length > 1) {
							// _.each(duplicateElement,function(y,count){
							// 	let uniqId = y.getAttribute('uniqId');
							// 	//let elem1 = this.nonEditableHTMLContent.querySelector('[unidIdCount='+uniqId+']')

							// 	if(!y.hasAttribute('uniqId')){
							// 			_Id++;

							// 			y.setAttribute('uniqId','element_'+_Id);
							// 			y.setAttribute('setfocus','element_'+_Id);
							// 			y.setAttribute('unididcount','element_'+_Id);


							// 			let parent_uniqId = y.parentNode.getAttribute('uniqId');
							// 			let parentNode = _This.nonEditableHTMLContent.querySelector('[unidIdCount='+parent_uniqId+']');
							// 			let indxAt = Array.from(y.parentNode.childNodes).indexOf(y);
							// 			parentNode.insertBefore(y,parentNode.childNodes[indxAt]);
							// 	}else{
							// 		let replace_element = _This.nonEditableHTMLContent.querySelectorAll('[unidIdCount='+uniqId+']')
							// 		if(uniqId == replace_element.getAttribute(uniqId) && !replace_element.classList.contains('newlyAddedElement')){
							// 			let removeAt = Array.from(replace_element.parentNode.childNodes).indexOf(replace_element);
							// 			replace_element.parentNode.removeChild(replace_element.parentNode.childNodes[removeAt]);

							// 			let uniqId = y.parentNode.getAttribute('uniqId');
							// 			y.classList.add('newlyAddedElement');
							// 			let parentNode = _This.nonEditableHTMLContent.querySelector('[unidIdCount='+uniqId+']');
							// 			let indxAt = Array.from(y.parentNode.childNodes).indexOf(x);
							// 			parentNode.insertBefore(y,parentNode.childNodes[indxAt]);
							// 		}else{
							// 			_.each(y.attributes,function(j){
							// 				_Id++;	
							// 				if(j.nodeName == 'uniqid' || j.nodeName == 'setfocus' || j.nodeName == 'unididcount')
							// 					y.setAttribute(j.nodeName,j.value.substring(0,j.value.indexOf('_'))+'_'+_Id);
							// 			})
							// 			let parent_uniqId = y.parentNode.getAttribute('uniqId');
							// 			let parentNode = _This.nonEditableHTMLContent.querySelector('[unidIdCount='+parent_uniqId+']');
							// 			let indxAt = Array.from(y.parentNode.childNodes).indexOf(y);
							// 			parentNode.insertBefore(y,parentNode.childNodes[indxAt]);
							// 		}
							// 	}
							// })
						} else {
							let replace_element = uniqId != null || uniqId != '' ? _This.nonEditableHTMLContent.querySelectorAll('[unidIdCount=' + uniqId + ']') : ''
							//console.log('uniqId',uniqId+'++++++++'+'replace_element',replace_element);
							//console.log('elements',$(str)[0]);
							if (replace_element.length > 0) {
								let str = x.outerHTML;
								replace_element[0].replaceWith($(str)[0])
							} else {
								_Id++;
								x.setAttribute('uniqId', 'element_' + _Id);
								x.setAttribute('setfocus', 'element_' + _Id);
								x.setAttribute('unididcount', 'element_' + _Id);
								let str = x.outerHTML;
								let parent_uniqId = x.parentNode.getAttribute('uniqId');
								let parentNode = _This.nonEditableHTMLContent.querySelector('[unidIdCount=' + parent_uniqId + ']');
								let indxAt = Array.from(x.parentNode.childNodes).indexOf(x);
								console.log('parentNode', parentNode + '++++++++' + 'indxAt', indxAt);
								parentNode.removeChild(parentNode.childNodes[indxAt]);
								parentNode.insertBefore($(str)[0], parentNode.childNodes[indxAt]);
							}
						}

						if (x.children.length > 0) {
							eachLoop(x.children, _This);
						}
					})
				}
				eachLoop(OverAllnodes.children, this);
				this.editorUniqId = _Id;
			} else {
				if (this.contentdocument.body.childNodes.length > 0) {
					while (this.contentdocument.body.firstChild) {
						this.contentdocument.body.removeChild(this.contentdocument.body.firstChild)
					}
				}
				this.sectionArray[this.sectionCount] = $(this.copySectionData)[0];
				this.contentdocument.body.appendChild($(this.copySectionData)[0]);
			}

		})

		// this.editorServiceObject.sectionArray = data.sectionArray;
		// this.editorServiceObject.sectionCount = data.sectionCount;
		// this.editorServiceObject.jsonData = data.jsonData;


	}

	editorNavigate(navigation) {
		var ref: any;
		ref = this.contentdocument.getElementsByTagName('BODY')[0];
		if (navigation == 1) {
			this.currentNavigationPage += 1;
		} else {
			this.currentNavigationPage -= 1;
		}
		//console.log(this.currentNavigationPage);
		//this.positionValue  = this.iframe.clientHeight*this.currentNavigationPage;
		this.positionValue = this.iframeElement.nativeElement.clientHeight * this.currentNavigationPage;
		ref.style.position = "absolute";
		ref.style.top = "-" + this.positionValue + "px";
	}
}
