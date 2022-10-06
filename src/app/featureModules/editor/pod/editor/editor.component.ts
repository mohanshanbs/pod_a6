import {
  Component,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';
import {
  observable,
  Subject
} from 'rxjs'
import {
  ProjectDataService
} from '../services/project-data.service';
import {
  editorHttpService
} from './editorFrame-services/editorHttp.service';
import {
  editorDomService
} from './editorFrame-services/editorDom.service';
import {
  editorJsonService
} from './editorFrame-services/editorJson.service';
import {
  EditorSaveService
} from './editorFrame-services/editorSave.service'
import {
  htmlEncode,
  htmlDecode
} from 'js-htmlencode';
import {
  Subscription
} from 'rxjs'
import {
  AppConfig
} from '../../../../app-config';
import {
  NgxSpinnerService
} from 'ngx-spinner';
import {
  DOCUMENT
} from "@angular/platform-browser";
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  NavigationExtras,
  NavigationStart
} from "@angular/router";
import {
  DomSanitizer
} from '@angular/platform-browser';
//import * as _ from 'underscore';
import * as _ from 'underscore';
import {
  ProcessPDFService
} from '../services/pdf/process-pdf.service';
import {
  ColorEvent
} from 'ngx-color';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalOptions,
  ModalDismissReasons
} from '@ng-bootstrap/ng-bootstrap';
import {
  ModalboxComponent
} from '../../../../modalbox/modalbox.component';
import {
  MatPaginator,
  MatTableDataSource,
  MatSort,
  MAT_DIALOG_DATA,
  MatProgressSpinnerModule,
  MatDialog
} from '@angular/material';
import { environment } from '../../../../../environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EditHtmlDialogComponent } from './edit-html-dialog/edit-html-dialog.component';
import { EditStyleDialogComponent } from './edit-style-dialog/edit-style-dialog.component';
import { async } from 'rxjs/internal/scheduler/async';
import { DataTablesModule } from 'angular-datatables';

export interface DialogData {
  animal: string;
  name: string;
}

declare let MathJax: any;
@Component({
  selector: 'editor-html',
  templateUrl: './editor.component.html',
  styleUrls: ['./../../../../convert-chapters/convert-chapters.component.scss'],
  providers: [editorDomService],

})

export class EditorComponent implements AfterViewInit, OnInit {
  APIUrl;
  jsonformlogin;
  projectstandard;
  test_sectionarray;
  cellWidth;
  lineheight: number;
  matherrormsg = '';
  lineheightElement;
  cell;
  mathinput;
  targetnode;
  chapterFile = "http://172.24.175.33/princeXML_new/";
  tocContent;
  error = true;
  chaptersList;
  pdfSrc;
  pageVariable: any;
  projectName;
  chapterCount;
  editIcon = false;
  enableSave = true;
  checkgo: boolean = false;
  breakupJsonStatus: number = 0;
  project_id = "";
  tocData = {};
  viewer;
  contentdocument: any;
  firstload: number = 1;
  selectedElement;
  selectedToc;
  indexval;
  uploadURL: any;
  chapter: any;
  pageno: any;
  pagenoval: any;
  userrole;
  editableFramepreview: any;
  projectEditable: any;
  tocdetail: any;
  tocdetails: any;
  chapterDetails: any;
  previous_chapterDetails: any;
  currentChapter: any;
  routerSegments: Array<any> = [];
  routePath: any;
  projectCount;
  isReadOnly = true;
  enable_icon: boolean = false;
  isSave: boolean = false;
  saveflag: boolean = false;
  chapterinfo: any;
  button_disable: boolean = true;
  page_model: any = {
    sectionArray: [],
    iframeBody: '',
    sectionCount: 0,
    json: '',
    deleteArray: [],
    isRecursive: ''
  };
  trig: string = '';
  colors = ['#000000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB', '#EB9694', '#FAD0C3', '#FEF3BD', '#C1E1C5', '#BEDADC', '#C4DEF6', '#BED3F3', '#D4C4FB']
  public dialogRef: any;
  // public IsEditOption: any;
  eventArray: any = [];
  actionBold;
  actionBlock;
  actionP;
  actionItalic;
  actionUnderline;
  actionStrike;
  actionSub;
  actionSuper;
  actionPageBreak;
  actionOl;
  actionUl;
  actionH1;
  actionIndent;
  actionStyle;
  actionH2;
  actionCreateLink;
  actionTC;
  rightAllign;
  leftAllign;
  actionUnLink;
  centerAllign;
  foreColor;
  colorPicker: boolean = false;
  activePage;
  isShowPageTitle: boolean = true;
  isTypeList: boolean;
  public contentDoc: any = '';
  public test_contentDoc: any = '';
  private htmlString: any = '';
  closeResult = '';
  isPageFirst: boolean = true;
  jumppage: number = 1;
  active: boolean = false;
  currentX;
  currentY;
  initialX;
  initialY;
  xOffset = 0;
  yOffset = 0;
  dragItem;
  fontsize: number;
  letterspace: number;
  pdfunderprocess: boolean = false;
  imagesize: number;
  imagepadding: number;
  imagemargin: number;
  imagemargin_l: number;
  imagemargin_r: number;
  imagemargin_t: number;
  imagemargin_b: number;
  img_style;
  mathpaddingTop: number;
  mathpaddingRight: number;
  mathpaddingBottom: number;
  mathpaddingLeft: number;
  startPageNumber: number;
  dataSource;
  displayedColumns = ['tocname', 'pagenumber', 'poptips_container', 'htmlstatus'];
  showMattable: boolean = true;
  showPreview: boolean = false;
  page_number;
  pop_tips;
  two_column;
  actionTHC;
  actionfloatLeft;
  actionfloatRight;
  myForm!: FormGroup;
  isExist = false;
  globalparent = 0;

  jsonArray: any = [
    // {
    //   "mjx-container": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "jax": "",
    //           "tabindex": "",
    //           "ctxtmenu_counter": "",
    //           "style": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "mjx-container",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "svg": [
    //         {
    //           "attributes": [
    //             {
    //               "xmlns": "",
    //               "width": "",
    //               "height": "",
    //               "role": "",
    //               "focusable": "",
    //               "viewBox": "",
    //               "xmlns:xlink": "",
    //               "aria-hidden": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "svg",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "defs": [
    //             {
    //               "attributes": [
    //                 {
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "defs",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "path": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "d": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "path",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "path": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "d": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "path",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "g": [
    //             {
    //               "attributes": [
    //                 {
    //                   "stroke": "",
    //                   "fill": "",
    //                   "stroke-width": "",
    //                   "transform": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "g",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "g": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "data-mml-node": "",
    //                       "id": "",
    //                       "class": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "g",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "g": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "data-mml-node": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "g",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "g": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "data-mml-node": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "g",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "g": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "data-mml-node": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "g",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "g": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "data-mml-node": "",
    //                                       "transform": "",
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "0",
    //                                       "marginTop": "0",
    //                                       "uniqid": "26",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "g",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "use": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "data-c": "",
    //                                           "xlink:href": "",
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "use",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "g": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "data-mml-node": "",
    //                                       "transform": "",
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "g",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "use": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "data-c": "",
    //                                           "xlink:href": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "use",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "use": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "data-c": "",
    //                                           "xlink:href": "",
    //                                           "transform": "",
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "use",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "rect": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "width": "",
    //                                       "height": "",
    //                                       "x": "",
    //                                       "y": "",
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "rect",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 }
    //                               ]
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "mjx-assistive-mml": [
    //         {
    //           "attributes": [
    //             {
    //               "unselectable": "",
    //               "display": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "mjx-assistive-mml",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "math": [
    //             {
    //               "attributes": [
    //                 {
    //                   "xmlns": "",
    //                   "class": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "math",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "mstyle": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "displaystyle": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "mstyle",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "mstyle": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "displaystyle": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "mstyle",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "mfrac": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "mfrac",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "mn": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "mn",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "1"
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "mn": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "mn",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": "12"
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "12"
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "table": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "style": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "table",
    //           "data-uuid": "",
    //           "identifier": "div table",
    //           "data": "",
    //           "key": ""
    //         }
    //       ]
    //     },
    //     {
    //       "tbody": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "tbody",
    //               "data-uuid": "",
    //               "identifier": "div table tbody",
    //               "data": "",
    //               "key": ""
    //             }
    //           ]
    //         },
    //         {
    //           "tr": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "tr",
    //                   "data-uuid": "",
    //                   "identifier": "div table tbody tr",
    //                   "data": "",
    //                   "key": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "td": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "td",
    //                       "data-uuid": "",
    //                       "identifier": "div table tbody tr td",
    //                       "data": "",
    //                       "key": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "td": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "td",
    //                       "data-uuid": "",
    //                       "identifier": "div table tbody tr td",
    //                       "data": "",
    //                       "key": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "header": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "header",
    //           "data-uuid": "",
    //           "identifier": "header",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "header p",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "h1": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "h1",
    //               "data-uuid": "",
    //               "identifier": "header h1",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "div": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "div",
    //               "data-uuid": "",
    //               "identifier": "header div",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "span": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "span",
    //                   "data-uuid": "",
    //                   "identifier": "header div span",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         },
    //         {
    //           "span": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "span",
    //                   "data-uuid": "",
    //                   "identifier": "header div span",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ":"
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "figure": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "figure",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "img": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "img",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "data": ""
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "figcaption": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "figcaption",
    //               "data-uuid": "13",
    //               "identifier": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "section": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "section",
    //           "data-uuid": "",
    //           "identifier": "section",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "header": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "header",
    //               "data-uuid": "17",
    //               "identifier": "section header",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "h4": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "h4",
    //                   "data-uuid": "",
    //                   "identifier": "section header h4",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "section p",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "ol": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "ol",
    //               "data-uuid": "",
    //               "identifier": "section ol",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "section ol li",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": ""
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "section ol li p",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "section ol li p span",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "img": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": ""
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "img",
    //                               "data-uuid": "",
    //                               "identifier": "section ol li p span img",
    //                               "data": ""
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": ""
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "section ol li p span span",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "id": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": ""
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "Label Name",
    //                                   "type": "span",
    //                                   "data-uuid": "",
    //                                   "identifier": "section ol li p span span span",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": ""
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "section ol li p span",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "section ol li",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": ""
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "section ol li p",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "section ol li p span",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "img": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": ""
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "img",
    //                               "data-uuid": "",
    //                               "identifier": "section ol li p span img",
    //                               "data": ""
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": ""
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "section ol li p img span span",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "id": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": ""
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "Label Name",
    //                                   "type": "span",
    //                                   "data-uuid": "33",
    //                                   "identifier": "span span",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": ""
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "34",
    //                           "identifier": "p span",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "li",
    //                   "data-uuid": "35",
    //                   "identifier": "ol li",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": ""
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "p",
    //                       "data-uuid": "36",
    //                       "identifier": "li p",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "37",
    //                           "identifier": "p span",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "img": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": ""
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "img",
    //                               "data-uuid": "38",
    //                               "identifier": "span img",
    //                               "data": ""
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": ""
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "span",
    //                               "data-uuid": "39",
    //                               "identifier": "span span",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "id": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": ""
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "Label Name",
    //                                   "type": "span",
    //                                   "data-uuid": "40",
    //                                   "identifier": "span span",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": ""
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "41",
    //                           "identifier": "p span",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "section": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "style": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "section",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "strong": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "strong",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "aside": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "aside",
    //           "data-uuid": "50",
    //           "identifier": "section aside",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "section": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": ""
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "section",
    //               "data-uuid": "51",
    //               "identifier": "aside section",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "header": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "header",
    //                   "data-uuid": "52",
    //                   "identifier": "section header",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "h4": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": ""
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "h4",
    //                       "data-uuid": "53",
    //                       "identifier": "header h4",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "strong": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": ""
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "strong",
    //                           "data-uuid": "54",
    //                           "identifier": "h4 strong",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "text": ""
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "55",
    //                   "identifier": "section p",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": ""
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "56",
    //                   "identifier": "section p",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "aside": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "aside",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "section": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "section",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "header": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "header",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "h4": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "h4",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "strong": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "strong",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "text": ""
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "header": [
    //     {
    //       "attributes": [
    //         {
    //           "id": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "header",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "h1": [
    //         {
    //           "attributes": [
    //             {
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "h1",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "span": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "span",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "img": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "img",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         },
    //         {
    //           "span": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "span",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "figure": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "style": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "figure",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "img": [
    //         {
    //           "attributes": [
    //             {
    //               "src": "",
    //               "alt": "",
    //               "id": "",
    //               "class": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "img",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "h2": [
    //     {
    //       "attributes": [
    //         {
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "h2",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "text": ""
    //     }
    //   ]
    // },
    // {
    //   "section": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "style": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "section",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "header": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "header",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "h2": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "h2",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "img": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "img",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "figure": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "figure",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "img": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "img",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         },
    //         {
    //           "em": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "em",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         },
    //         {
    //           "sup": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "sup",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "span": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "span",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "style": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "section": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "section",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "strong": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "strong",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "text": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         },
    //         {
    //           "span": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "span",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "span": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "span",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "text": ""
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "section": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "section",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "p": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "p",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "strong": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "strong",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "text": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "text": ""
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "aside": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "Label Name",
    //               "type": "aside",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "section": [
    //             {
    //               "attributes": [
    //                 {
    //                   "class": "",
    //                   "id": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "Label Name",
    //                   "type": "section",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "header": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "header",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "h4": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "style": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "h4",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "class": "",
    //                       "id": "",
    //                       "style": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "Label Name",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "id": "",
    //                           "style": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "Label Name",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "strong": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "id": "",
    //                               "style": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "Label Name",
    //                               "type": "strong",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "text": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "text": ""
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "blockquote": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "blockquote",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "cite": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "cite",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "header": [
    //     {
    //       "attributes": [
    //         {
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "header",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "h3": [
    //         {
    //           "attributes": [
    //             {
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "h3",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "header": [
    //     {
    //       "attributes": [
    //         {
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "header",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "h1": [
    //         {
    //           "attributes": [
    //             {
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "h1",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     }
    //   ]
    // },
    // {
    //   "p": [
    //     {
    //       "attributes": [
    //         {
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "Label Name",
    //           "type": "p",
    //           "data-uuid": "",
    //           "identifier": "p",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "text": ""
    //     }
    //   ]
    // },
    // {
    //   "section": [
    //     {
    //       "attributes": [
    //         {
    //           "role": "",
    //           "aria-label": "",
    //           "class": "",
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "section",
    //           "data-uuid": "",
    //           "identifier": "",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     },
    //     {
    //       "header": [
    //         {
    //           "attributes": [
    //             {
    //               "id": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "header",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "h4": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "h4",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "img": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "src": "",
    //                       "role": "",
    //                       "class": "",
    //                       "id": "",
    //                       "alt": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "img",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "text": "Learning Objectives"
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "p": [
    //         {
    //           "attributes": [
    //             {
    //               "id": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": " ",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "p",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "text": ""
    //         }
    //       ]
    //     },
    //     {
    //       "mjx-container": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "jax": "",
    //               "tabindex": "",
    //               "ctxtmenu_counter": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "mjx-container",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "svg": [
    //             {
    //               "attributes": [
    //                 {
    //                   "xmlns": "",
    //                   "width": "",
    //                   "height": "",
    //                   "role": "",
    //                   "focusable": "",
    //                   "viewBox": "",
    //                   "xmlns:xlink": "",
    //                   "aria-hidden": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "svg",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "defs": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "defs",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "g": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "stroke": "",
    //                       "fill": "",
    //                       "stroke-width": "",
    //                       "transform": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "g",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "g": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "data-mml-node": "",
    //                           "id": "",
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "g",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "g": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "data-mml-node": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "g",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "g": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "data-mml-node": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "g",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "g": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "data-mml-node": "",
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "g",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "g": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "data-mml-node": "",
    //                                           "transform": "",
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "0",
    //                                           "marginTop": "0",
    //                                           "uniqid": "26",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "g",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     },
    //                                     {
    //                                       "use": [
    //                                         {
    //                                           "attributes": [
    //                                             {
    //                                               "data-c": "",
    //                                               "xlink:href": "",
    //                                               "computedStyles": "",
    //                                               "offsetHeight": "",
    //                                               "marginTop": "",
    //                                               "uniqid": "",
    //                                               "key": "",
    //                                               "is_component": "false"
    //                                             }
    //                                           ],
    //                                           "componentData": [
    //                                             {
    //                                               "description": "",
    //                                               "displayField": "",
    //                                               "type": "use",
    //                                               "data-uuid": "",
    //                                               "identifier": "",
    //                                               "key": "",
    //                                               "data": ""
    //                                             }
    //                                           ]
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "g": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "data-mml-node": "",
    //                                           "transform": "",
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "g",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     },
    //                                     {
    //                                       "use": [
    //                                         {
    //                                           "attributes": [
    //                                             {
    //                                               "data-c": "",
    //                                               "xlink:href": "",
    //                                               "offsetHeight": "",
    //                                               "marginTop": "",
    //                                               "uniqid": "",
    //                                               "key": "",
    //                                               "is_component": "false"
    //                                             }
    //                                           ],
    //                                           "componentData": [
    //                                             {
    //                                               "description": "",
    //                                               "displayField": "",
    //                                               "type": "use",
    //                                               "data-uuid": "",
    //                                               "identifier": "",
    //                                               "key": "",
    //                                               "data": ""
    //                                             }
    //                                           ]
    //                                         }
    //                                       ]
    //                                     },
    //                                     {
    //                                       "use": [
    //                                         {
    //                                           "attributes": [
    //                                             {
    //                                               "data-c": "",
    //                                               "xlink:href": "",
    //                                               "transform": "",
    //                                               "computedStyles": "",
    //                                               "offsetHeight": "",
    //                                               "marginTop": "",
    //                                               "uniqid": "",
    //                                               "key": "",
    //                                               "is_component": "false"
    //                                             }
    //                                           ],
    //                                           "componentData": [
    //                                             {
    //                                               "description": "",
    //                                               "displayField": "",
    //                                               "type": "use",
    //                                               "data-uuid": "",
    //                                               "identifier": "",
    //                                               "key": "",
    //                                               "data": ""
    //                                             }
    //                                           ]
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "rect": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "width": "",
    //                                           "height": "",
    //                                           "x": "",
    //                                           "y": "",
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "rect",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 }
    //                               ]
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "mjx-assistive-mml": [
    //             {
    //               "attributes": [
    //                 {
    //                   "unselectable": "",
    //                   "display": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "mjx-assistive-mml",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "math": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "xmlns": "",
    //                       "class": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "math",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "mstyle": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "displaystyle": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "mstyle",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "mstyle": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "displaystyle": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "mstyle",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "mfrac": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "mfrac",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "mn": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "mn",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "text": "1"
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "mn": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "mn",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": "12"
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "text": "12"
    //                                 }
    //                               ]
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "mjx-container": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "jax": "",
    //               "display": "",
    //               "tabindex": "",
    //               "ctxtmenu_counter": "",
    //               "style": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "mjx-container",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "svg": [
    //             {
    //               "attributes": [
    //                 {
    //                   "xmlns": "",
    //                   "width": "",
    //                   "height": "",
    //                   "role": "",
    //                   "focusable": "",
    //                   "viewBox": "",
    //                   "xmlns:xlink": "",
    //                   "aria-hidden": "",
    //                   "style": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "svg",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "defs": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "defs",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "path": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "id": "",
    //                           "d": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "path",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             },
    //             {
    //               "g": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "stroke": "",
    //                       "fill": "",
    //                       "stroke-width": "",
    //                       "transform": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "g",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "g": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "data-mml-node": "",
    //                           "fill": "",
    //                           "stroke": "",
    //                           "id": "",
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "g",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "g": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "data-mml-node": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "g",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "g": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "data-mml-node": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "g",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "g": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "data-mml-node": "",
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "g",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "g": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "data-mml-node": "",
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "g",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     },
    //                                     {
    //                                       "g": [
    //                                         {
    //                                           "attributes": [
    //                                             {
    //                                               "data-mml-node": "",
    //                                               "computedStyles": "",
    //                                               "offsetHeight": "",
    //                                               "marginTop": "",
    //                                               "uniqid": "",
    //                                               "key": "",
    //                                               "is_component": "false"
    //                                             }
    //                                           ],
    //                                           "componentData": [
    //                                             {
    //                                               "description": "",
    //                                               "displayField": "",
    //                                               "type": "g",
    //                                               "data-uuid": "",
    //                                               "identifier": "",
    //                                               "key": "",
    //                                               "data": ""
    //                                             }
    //                                           ]
    //                                         },
    //                                         {
    //                                           "g": [
    //                                             {
    //                                               "attributes": [
    //                                                 {
    //                                                   "data-mml-node": "",
    //                                                   "transform": "",
    //                                                   "computedStyles": "",
    //                                                   "offsetHeight": "",
    //                                                   "marginTop": "",
    //                                                   "uniqid": "",
    //                                                   "key": "",
    //                                                   "is_component": "false"
    //                                                 }
    //                                               ],
    //                                               "componentData": [
    //                                                 {
    //                                                   "description": "",
    //                                                   "displayField": "",
    //                                                   "type": "g",
    //                                                   "data-uuid": "",
    //                                                   "identifier": "",
    //                                                   "key": "",
    //                                                   "data": ""
    //                                                 }
    //                                               ]
    //                                             },
    //                                             {
    //                                               "g": [
    //                                                 {
    //                                                   "attributes": [
    //                                                     {
    //                                                       "data-mml-node": "",
    //                                                       "computedStyles": "",
    //                                                       "offsetHeight": "",
    //                                                       "marginTop": "",
    //                                                       "uniqid": "",
    //                                                       "key": "",
    //                                                       "is_component": "false"
    //                                                     }
    //                                                   ],
    //                                                   "componentData": [
    //                                                     {
    //                                                       "description": "",
    //                                                       "displayField": "",
    //                                                       "type": "g",
    //                                                       "data-uuid": "",
    //                                                       "identifier": "",
    //                                                       "key": "",
    //                                                       "data": ""
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "g": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-mml-node": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "g",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     },
    //                                                     {
    //                                                       "g": [
    //                                                         {
    //                                                           "attributes": [
    //                                                             {
    //                                                               "data-mml-node": "",
    //                                                               "computedStyles": "",
    //                                                               "offsetHeight": "",
    //                                                               "marginTop": "",
    //                                                               "uniqid": "",
    //                                                               "key": "",
    //                                                               "is_component": "false"
    //                                                             }
    //                                                           ],
    //                                                           "componentData": [
    //                                                             {
    //                                                               "description": "",
    //                                                               "displayField": "",
    //                                                               "type": "g",
    //                                                               "data-uuid": "",
    //                                                               "identifier": "",
    //                                                               "key": "",
    //                                                               "data": ""
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         },
    //                                                         {
    //                                                           "use": [
    //                                                             {
    //                                                               "attributes": [
    //                                                                 {
    //                                                                   "data-c": "",
    //                                                                   "xlink:href": "",
    //                                                                   "transform": "",
    //                                                                   "computedStyles": "",
    //                                                                   "offsetHeight": "",
    //                                                                   "marginTop": "",
    //                                                                   "uniqid": "",
    //                                                                   "key": "",
    //                                                                   "is_component": "false"
    //                                                                 }
    //                                                               ],
    //                                                               "componentData": [
    //                                                                 {
    //                                                                   "description": "",
    //                                                                   "displayField": "",
    //                                                                   "type": "use",
    //                                                                   "data-uuid": "",
    //                                                                   "identifier": " ",
    //                                                                   "key": "",
    //                                                                   "data": ""
    //                                                                 }
    //                                                               ]
    //                                                             }
    //                                                           ]
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "g": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-mml-node": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "g",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     },
    //                                                     {
    //                                                       "use": [
    //                                                         {
    //                                                           "attributes": [
    //                                                             {
    //                                                               "data-c": "",
    //                                                               "xlink:href": "",
    //                                                               "computedStyles": "",
    //                                                               "offsetHeight": "",
    //                                                               "marginTop": "",
    //                                                               "uniqid": "",
    //                                                               "key": "",
    //                                                               "is_component": "false"
    //                                                             }
    //                                                           ],
    //                                                           "componentData": [
    //                                                             {
    //                                                               "description": "",
    //                                                               "displayField": "",
    //                                                               "type": "use",
    //                                                               "data-uuid": "",
    //                                                               "identifier": "",
    //                                                               "key": "",
    //                                                               "data": ""
    //                                                             }
    //                                                           ]
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 }
    //                                               ]
    //                                             }
    //                                           ]
    //                                         },
    //                                         {
    //                                           "g": [
    //                                             {
    //                                               "attributes": [
    //                                                 {
    //                                                   "data-mml-node": "",
    //                                                   "transform": "",
    //                                                   "computedStyles": "",
    //                                                   "offsetHeight": "",
    //                                                   "marginTop": "",
    //                                                   "uniqid": "",
    //                                                   "key": "",
    //                                                   "is_component": "false"
    //                                                 }
    //                                               ],
    //                                               "componentData": [
    //                                                 {
    //                                                   "description": "",
    //                                                   "displayField": "",
    //                                                   "type": "g",
    //                                                   "data-uuid": "",
    //                                                   "identifier": "",
    //                                                   "key": "",
    //                                                   "data": ""
    //                                                 }
    //                                               ]
    //                                             },
    //                                             {
    //                                               "g": [
    //                                                 {
    //                                                   "attributes": [
    //                                                     {
    //                                                       "data-mml-node": "",
    //                                                       "computedStyles": "",
    //                                                       "offsetHeight": "",
    //                                                       "marginTop": "",
    //                                                       "uniqid": "",
    //                                                       "key": "",
    //                                                       "is_component": "false"
    //                                                     }
    //                                                   ],
    //                                                   "componentData": [
    //                                                     {
    //                                                       "description": "",
    //                                                       "displayField": "",
    //                                                       "type": "g",
    //                                                       "data-uuid": "",
    //                                                       "identifier": "",
    //                                                       "key": "",
    //                                                       "data": ""
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "use": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "data-c": "",
    //                                                           "xlink:href": "",
    //                                                           "transform": "",
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "use",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     }
    //                                                   ]
    //                                                 }
    //                                               ]
    //                                             }
    //                                           ]
    //                                         },
    //                                         {
    //                                           "rect": [
    //                                             {
    //                                               "attributes": [
    //                                                 {
    //                                                   "width": "",
    //                                                   "height": "",
    //                                                   "x": "",
    //                                                   "y": "",
    //                                                   "computedStyles": "",
    //                                                   "offsetHeight": "",
    //                                                   "marginTop": "",
    //                                                   "uniqid": "",
    //                                                   "key": "",
    //                                                   "is_component": "false"
    //                                                 }
    //                                               ],
    //                                               "componentData": [
    //                                                 {
    //                                                   "description": "",
    //                                                   "displayField": "",
    //                                                   "type": "rect",
    //                                                   "data-uuid": "",
    //                                                   "identifier": "",
    //                                                   "key": "",
    //                                                   "data": ""
    //                                                 }
    //                                               ]
    //                                             }
    //                                           ]
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 }
    //                               ]
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "mjx-assistive-mml": [
    //             {
    //               "attributes": [
    //                 {
    //                   "unselectable": "",
    //                   "display": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "mjx-assistive-mml",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "math": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "xmlns": "",
    //                       "display": "",
    //                       "mathcolor": "",
    //                       "mathvariant": "",
    //                       "class": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "math",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "mstyle": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "displaystyle": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "mstyle",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "mstyle": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "displaystyle": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "mstyle",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "mrow": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "mrow",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "mstyle": [
    //                                 {
    //                                   "attributes": [
    //                                     {
    //                                       "displaystyle": "",
    //                                       "computedStyles": "",
    //                                       "offsetHeight": "",
    //                                       "marginTop": "",
    //                                       "uniqid": "",
    //                                       "key": "",
    //                                       "is_component": "false"
    //                                     }
    //                                   ],
    //                                   "componentData": [
    //                                     {
    //                                       "description": "",
    //                                       "displayField": "",
    //                                       "type": "mstyle",
    //                                       "data-uuid": "",
    //                                       "identifier": "",
    //                                       "key": "",
    //                                       "data": ""
    //                                     }
    //                                   ]
    //                                 },
    //                                 {
    //                                   "mfrac": [
    //                                     {
    //                                       "attributes": [
    //                                         {
    //                                           "computedStyles": "",
    //                                           "offsetHeight": "",
    //                                           "marginTop": "",
    //                                           "uniqid": "",
    //                                           "key": "",
    //                                           "is_component": "false"
    //                                         }
    //                                       ],
    //                                       "componentData": [
    //                                         {
    //                                           "description": "",
    //                                           "displayField": "",
    //                                           "type": "mfrac",
    //                                           "data-uuid": "",
    //                                           "identifier": "",
    //                                           "key": "",
    //                                           "data": ""
    //                                         }
    //                                       ]
    //                                     },
    //                                     {
    //                                       "mrow": [
    //                                         {
    //                                           "attributes": [
    //                                             {
    //                                               "computedStyles": "",
    //                                               "offsetHeight": "",
    //                                               "marginTop": "",
    //                                               "uniqid": "",
    //                                               "key": "",
    //                                               "is_component": "false"
    //                                             }
    //                                           ],
    //                                           "componentData": [
    //                                             {
    //                                               "description": "",
    //                                               "displayField": "",
    //                                               "type": "mrow",
    //                                               "data-uuid": "",
    //                                               "identifier": "",
    //                                               "key": "",
    //                                               "data": ""
    //                                             }
    //                                           ]
    //                                         },
    //                                         {
    //                                           "msup": [
    //                                             {
    //                                               "attributes": [
    //                                                 {
    //                                                   "computedStyles": "",
    //                                                   "offsetHeight": "",
    //                                                   "marginTop": "",
    //                                                   "uniqid": "",
    //                                                   "key": "",
    //                                                   "is_component": "false"
    //                                                 }
    //                                               ],
    //                                               "componentData": [
    //                                                 {
    //                                                   "description": "",
    //                                                   "displayField": "",
    //                                                   "type": "msup",
    //                                                   "data-uuid": "",
    //                                                   "identifier": "",
    //                                                   "key": "",
    //                                                   "data": ""
    //                                                 }
    //                                               ]
    //                                             },
    //                                             {
    //                                               "mrow": [
    //                                                 {
    //                                                   "attributes": [
    //                                                     {
    //                                                       "computedStyles": "",
    //                                                       "offsetHeight": "",
    //                                                       "marginTop": "",
    //                                                       "uniqid": "",
    //                                                       "key": "",
    //                                                       "is_component": "false"
    //                                                     }
    //                                                   ],
    //                                                   "componentData": [
    //                                                     {
    //                                                       "description": "",
    //                                                       "displayField": "",
    //                                                       "type": "mrow",
    //                                                       "data-uuid": "",
    //                                                       "identifier": "",
    //                                                       "key": "",
    //                                                       "data": ""
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "mtext": [
    //                                                     {
    //                                                       "attributes": [
    //                                                         {
    //                                                           "computedStyles": "",
    //                                                           "offsetHeight": "",
    //                                                           "marginTop": "",
    //                                                           "uniqid": "",
    //                                                           "key": "",
    //                                                           "is_component": "false"
    //                                                         }
    //                                                       ],
    //                                                       "componentData": [
    //                                                         {
    //                                                           "description": "",
    //                                                           "displayField": "",
    //                                                           "type": "mtext",
    //                                                           "data-uuid": "",
    //                                                           "identifier": "",
    //                                                           "key": "",
    //                                                           "data": ""
    //                                                         }
    //                                                       ]
    //                                                     },
    //                                                     {
    //                                                       "text": "Net income"
    //                                                     }
    //                                                   ]
    //                                                 }
    //                                               ]
    //                                             },
    //                                             {
    //                                               "mtext": [
    //                                                 {
    //                                                   "attributes": [
    //                                                     {
    //                                                       "computedStyles": "",
    //                                                       "offsetHeight": "",
    //                                                       "marginTop": "",
    //                                                       "uniqid": "",
    //                                                       "key": "",
    //                                                       "is_component": "false"
    //                                                     }
    //                                                   ],
    //                                                   "componentData": [
    //                                                     {
    //                                                       "description": "",
    //                                                       "displayField": "",
    //                                                       "type": "mtext",
    //                                                       "data-uuid": "",
    //                                                       "identifier": "",
    //                                                       "key": "",
    //                                                       "data": "1"
    //                                                     }
    //                                                   ]
    //                                                 },
    //                                                 {
    //                                                   "text": "1"
    //                                                 }
    //                                               ]
    //                                             }
    //                                           ]
    //                                         }
    //                                       ]
    //                                     },
    //                                     {
    //                                       "mrow": [
    //                                         {
    //                                           "attributes": [
    //                                             {
    //                                               "computedStyles": "",
    //                                               "offsetHeight": "",
    //                                               "marginTop": "",
    //                                               "uniqid": "",
    //                                               "key": "",
    //                                               "is_component": "false"
    //                                             }
    //                                           ],
    //                                           "componentData": [
    //                                             {
    //                                               "description": "",
    //                                               "displayField": "",
    //                                               "type": "mrow",
    //                                               "data-uuid": "",
    //                                               "identifier": "",
    //                                               "key": "",
    //                                               "data": ""
    //                                             }
    //                                           ]
    //                                         },
    //                                         {
    //                                           "mtext": [
    //                                             {
    //                                               "attributes": [
    //                                                 {
    //                                                   "computedStyles": "",
    //                                                   "offsetHeight": "",
    //                                                   "marginTop": "",
    //                                                   "uniqid": "",
    //                                                   "key": "",
    //                                                   "is_component": "false"
    //                                                 }
    //                                               ],
    //                                               "componentData": [
    //                                                 {
    //                                                   "description": "",
    //                                                   "displayField": "",
    //                                                   "type": "mtext",
    //                                                   "data-uuid": "",
    //                                                   "identifier": "",
    //                                                   "key": "",
    //                                                   "data": ""
    //                                                 }
    //                                               ]
    //                                             },
    //                                             {
    //                                               "text": "Total assets"
    //                                             }
    //                                           ]
    //                                         }
    //                                       ]
    //                                     }
    //                                   ]
    //                                 }
    //                               ]
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     {
    //       "ol": [
    //         {
    //           "attributes": [
    //             {
    //               "class": "",
    //               "id": "",
    //               "computedStyles": "",
    //               "offsetHeight": "",
    //               "marginTop": "",
    //               "uniqid": "",
    //               "key": "",
    //               "is_component": "false"
    //             }
    //           ],
    //           "componentData": [
    //             {
    //               "description": "",
    //               "displayField": "",
    //               "type": "ol",
    //               "data-uuid": "",
    //               "identifier": "",
    //               "key": "",
    //               "data": ""
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": " ",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "span",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "3-1"
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": "To recognize the role of key personnel associated with the courts."
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": " ",
    //                       "is_component": "true"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "span",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "3-2"
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": "To know the organization of the state and federal court systems."
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": " ",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "span",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "3-3"
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": "To understand the power of judicial review and the philosophies of judicial restraint and judicial activism."
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": " ",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "span",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "3-4"
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": "To appreciate and contrast the background and judicial alignment of the justices of the U.S. Supreme Court."
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         },
    //         {
    //           "li": [
    //             {
    //               "attributes": [
    //                 {
    //                   "id": "",
    //                   "computedStyles": "",
    //                   "offsetHeight": "",
    //                   "marginTop": "",
    //                   "uniqid": "",
    //                   "key": "",
    //                   "is_component": "false"
    //                 }
    //               ],
    //               "componentData": [
    //                 {
    //                   "description": "",
    //                   "displayField": "",
    //                   "type": "li",
    //                   "data-uuid": "",
    //                   "identifier": "",
    //                   "key": "",
    //                   "data": ""
    //                 }
    //               ]
    //             },
    //             {
    //               "p": [
    //                 {
    //                   "attributes": [
    //                     {
    //                       "id": "",
    //                       "computedStyles": "",
    //                       "offsetHeight": "",
    //                       "marginTop": "",
    //                       "uniqid": "",
    //                       "key": "",
    //                       "is_component": "false"
    //                     }
    //                   ],
    //                   "componentData": [
    //                     {
    //                       "description": "",
    //                       "displayField": "",
    //                       "type": "p",
    //                       "data-uuid": "",
    //                       "identifier": "",
    //                       "key": "",
    //                       "data": ""
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "span": [
    //                         {
    //                           "attributes": [
    //                             {
    //                               "class": "",
    //                               "computedStyles": "",
    //                               "offsetHeight": "",
    //                               "marginTop": "",
    //                               "uniqid": "",
    //                               "key": "",
    //                               "is_component": "false"
    //                             }
    //                           ],
    //                           "componentData": [
    //                             {
    //                               "description": "",
    //                               "displayField": "",
    //                               "type": "span",
    //                               "data-uuid": "",
    //                               "identifier": "",
    //                               "key": "",
    //                               "data": ""
    //                             }
    //                           ]
    //                         },
    //                         {
    //                           "span": [
    //                             {
    //                               "attributes": [
    //                                 {
    //                                   "class": "",
    //                                   "computedStyles": "",
    //                                   "offsetHeight": "",
    //                                   "marginTop": "",
    //                                   "uniqid": "",
    //                                   "key": "",
    //                                   "is_component": "false"
    //                                 }
    //                               ],
    //                               "componentData": [
    //                                 {
    //                                   "description": "",
    //                                   "displayField": "",
    //                                   "type": "span",
    //                                   "data-uuid": "",
    //                                   "identifier": "",
    //                                   "key": "",
    //                                   "data": ""
    //                                 }
    //                               ]
    //                             },
    //                             {
    //                               "text": "3-5"
    //                             }
    //                           ]
    //                         }
    //                       ]
    //                     }
    //                   ]
    //                 },
    //                 {
    //                   "span": [
    //                     {
    //                       "attributes": [
    //                         {
    //                           "class": "",
    //                           "computedStyles": "",
    //                           "offsetHeight": "",
    //                           "marginTop": "",
    //                           "uniqid": "",
    //                           "key": "",
    //                           "is_component": "false"
    //                         }
    //                       ],
    //                       "componentData": [
    //                         {
    //                           "description": "",
    //                           "displayField": "",
    //                           "type": "span",
    //                           "data-uuid": "",
    //                           "identifier": "",
    //                           "key": "",
    //                           "data": ""
    //                         }
    //                       ]
    //                     },
    //                     {
    //                       "text": "To analyze a sample case from the U.S. Supreme Court, including the majority, concurring, and dissenting opinions."
    //                     }
    //                   ]
    //                 }
    //               ]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    
    // ETS
    {
      "h2": [
        {
          "attributes": [
            {
              "id": "",
              "computedStyles": "",
              "offsetHeight": "",
              "marginTop": "",
              "uniqid": "",
              "key": "",
              "is_component": "true"
            }
          ],
          "componentData": [
            {
              "description": "",
              "displayField": "",
              "type": "h2",
              "data-uuid": "",
              "identifier": "h2",
              "key": "",
              "data": ""
            }
          ]
        },
        {
          "text": ""
        }
      ]
    },
    // {
    //   "p": [
    //     {
    //       "attributes": [
    //         {
    //           "id": "",
    //           "computedStyles": "",
    //           "offsetHeight": "",
    //           "marginTop": "",
    //           "uniqid": "",
    //           "key": "",
    //           "is_component": "true"
    //         }
    //       ],
    //       "componentData": [
    //         {
    //           "description": "",
    //           "displayField": "",
    //           "type": "p",
    //           "data-uuid": "",
    //           "identifier": "p",
    //           "key": "",
    //           "data": ""
    //         }
    //       ]
    //     }
    //   ]
    // },
    {
      "div": [
        {
          "attributes": [
            {
              "id": "",
              "computedStyles": "",
              "offsetHeight": "",
              "marginTop": "",
              "uniqid": "",
              "key": "div img",
              "is_component": "true"
            }
          ],
          "componentData": [
            {
              "description": "",
              "displayField": "",
              "type": "div",
              "data-uuid": "",
              "identifier": "img",
              "key": "div img",
              "data": ""
            }
          ]
        },
        {
          "img": [
            {
              "attributes": [
                {
                  "id": "",
                  "computedStyles": "",
                  "offsetHeight": "",
                  "marginTop": "",
                  "uniqid": "",
                  "key": "",
                  "is_component": "false"
                }
              ],
              "componentData": [
                {
                  "description": "",
                  "displayField": "",
                  "type": "img",
                  "data-uuid": "",
                  "identifier": "",
                  "key": "",
                  "data": ""
                }
              ]
            }
          ]
        },
      ]
    },
    {
      "div": [
        {
          "attributes": [
            {
              "class": "",
              "id": "",
              "computedStyles": "",
              "offsetHeight": "",
              "marginTop": "",
              "uniqid": "",
              "is_component": "true"
            }
          ],
          "componentData": [
            {
              "description": "",
              "displayField": "Label Name",
              "type": "div",
              "data-uuid": "",
              "identifier": "div",
              "key": "",
              "data": ""
            }
          ]
        },
        {
          "p": [
            {
              "attributes": [
                {
                  "id": "",
                  "computedStyles": "",
                  "offsetHeight": "",
                  "marginTop": "",
                  "uniqid": "",
                  "key": "",
                  "is_component": "false"
                }
              ],
              "componentData": [
                {
                  "description": "",
                  "displayField": "",
                  "type": "p",
                  "data-uuid": "",
                  "identifier": "div p",
                  "key": "",
                  "data": ""
                }
              ]
            },
            {
              "b": [
                {
                  "attributes": [
                    {
                      "id": "",
                      "computedStyles": "",
                      "offsetHeight": "",
                      "marginTop": "",
                      "uniqid": "",
                      "key": "",
                      "is_component": "false"
                    }
                  ],
                  "componentData": [
                    {
                      "description": "",
                      "displayField": "",
                      "type": "b",
                      "data-uuid": "",
                      "identifier": "div p b",
                      "key": "",
                      "data": ""
                    }
                  ]
                },
                {
                  "span": [
                    {
                      "attributes": [
                        {
                          "id": "",
                          "computedStyles": "",
                          "offsetHeight": "",
                          "marginTop": "",
                          "uniqid": "",
                          "key": "",
                          "is_component": "false"
                        }
                      ],
                      "componentData": [
                        {
                          "description": "",
                          "displayField": "",
                          "type": "span",
                          "data-uuid": "",
                          "identifier": "div p b span",
                          "key": "",
                          "data": ""
                        }
                      ]
                    },
                    {
                      "text": ""
                    }
                  ]
                },
                {
                  "text": ""
                }
              ]
            }
          ]
        }
      ]
    },
  ]

  selectedJson: any = [];
  fields: any = [];
  previewList: any = [];
  objectName: any;
  html_body_json: any = [];
  changedData: any = [];
  isUserEdit = false;
  component_event: any = [];
  selectedJsonList: any = [];
  progressBar = false;
  tempIndex: any = [];
  current_element: any;
  breakElementFlag = false;
  rootContentDoc: any = '';
  redisResponseData: any;
  contentDocData: any = '';
  optStandard = '';
  hideStartPage = false;

  updatedStyleList: any = [];

  @ViewChild('iframe') public iframeElement: ElementRef;
  @ViewChild('iframetest') public iframeElement_test: ElementRef;
  // @ViewChild('iframepreview') public iframeElement_preview: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(public http: HttpClient,
    private sanitizer: DomSanitizer,
    public renderer: Renderer2,
    public dataservice: ProjectDataService,
    public editorHttpService: editorHttpService,
    public editorDomService: editorDomService,
    public editorJsonService: editorJsonService,
    public editorSaveService: EditorSaveService,
    private appConfig: AppConfig,
    private spinner: NgxSpinnerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private processpdfservice: ProcessPDFService,
    private _snackBar: MatSnackBar,
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private formBuilder: FormBuilder
  ) {

    //super(editorHttpService, editorDomService, editorJsonService, renderer)
    this.APIUrl = appConfig.config.apiURL;
    this.uploadURL = this.appConfig.config.uploadsURL;
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.indexOf("editor") != -1) {
          this.viewer = false;
        } else {
          this.viewer = true;
        }
      }
    });
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      inputField: [[], null],
      imageField: [[], null]
    });

    localStorage.setItem('breakuphtml', '');
    this.userrole = JSON.parse(localStorage.getItem('currentUser')).userrole;

    this.projectEditable = JSON.parse(localStorage.getItem('isEditable'));
    (this.userrole == 1 || this.userrole == 2 || this.projectEditable) ? this.isReadOnly = false : this.isReadOnly = true

    // restrict edit 
    document.getElementById('editableFrame').className = "restrictUser";

    if (localStorage.getItem('tocstatus') && localStorage.getItem('chapterid')) {
      this.chapterlist();
    }
    this.onloadChapter();
    this.editorDomService.checkcellwidth.subscribe((data) => {
      this.cellWidth = parseInt(data.cellwidth);
      this.cell = data.cell;
      (this.cell != undefined) ? this.cell['style']['width'] = this.cellWidth + '%' : undefined;
      this.cdRef.detectChanges();
    });

    this.editorDomService.checkimagestyle.subscribe((data) => {
      this.imagesize = Number((data.imagesize).split('px')[0]);
      this.imagepadding = Number((data.imagepadding).split('px')[0]);
      //this.imagemargin = Number((data.image_margin).split('px')[0]);
      this.imagemargin_l = Number((data.mar_left).split('px')[0] || '0');
      this.imagemargin_r = Number((data.mar_right).split('px')[0] || '0');
      this.imagemargin_t = Number((data.mar_top).split('px')[0] || '0');
      this.imagemargin_b = Number((data.mar_bottom).split('px')[0] || '0');

      this.img_style = data.element;
      this.cdRef.detectChanges();
    });

    this.editorDomService.checklineheight.subscribe((data) => {
      //this.lineheight = (parseFloat((data.checklineheight).split('px')[0])/16);  
      //this.lineheight = Number(this.lineheight.toFixed(2)); 
      this.fontsize = parseFloat((data.fontsize).split('px')[0]);
      this.letterspace = parseFloat((data.letterspacing).split('px')[0]);
      this.lineheight = (parseFloat((data.checklineheight).split('px')[0]) / this.fontsize);
      this.fontsize = Number(this.fontsize.toFixed(2));
      this.lineheight = Number(this.lineheight.toFixed(2));
      this.letterspace = Number(this.letterspace.toFixed(2));
      this.lineheightElement = data.element;
      this.cdRef.detectChanges();
    })
    this.editorDomService.matheditorinput.subscribe((data) => {
      this.mathinput = data.matheditorinput;
      this.targetnode = data.targetnode;
      this.matherrormsg = '';
      if ((data.padding).split(' ').length > 1) {
        this.mathpaddingTop = parseFloat(((data.padding).split(' ')[0]).split('px')[0]);
        this.mathpaddingRight = parseFloat(((data.padding).split(' ')[1]).split('px')[0]);
        this.mathpaddingBottom = parseFloat(((data.padding).split(' ')[2]).split('px')[0]);
        this.mathpaddingLeft = parseFloat(((data.padding).split(' ')[3]).split('px')[0]);
      } else {
        this.mathpaddingTop = 0;
        this.mathpaddingRight = 0;
        this.mathpaddingBottom = 0;
        this.mathpaddingLeft = 0;
      }

      this.cdRef.detectChanges();
    })
    this.editorDomService.load('MathJax');
    this.processpdfservice.pdfsubject.subscribe((data) => {
      if (data) {
        this.pdfunderprocess = false;
      } else {
        this.pdfunderprocess = true;
      }
      this.cdRef.detectChanges();
    })

    this.editorDomService.chapterSub.subscribe((data) => {
      if (data) {
        this.chapterinfo = data.chapterinfo;
      }
    })

    if (localStorage.getItem('viewer') && localStorage.getItem('viewer') == 'true') {
      this.showMattable = false;
    }

    // this.optStandard = localStorage.getItem('projectstandard');
    // if (this.optStandard == "ETS") {
    //   this.hideStartPage = true;
    // }

    localStorage.removeItem('selectedJsonList');
    localStorage.removeItem('pageModel');
    // localStorage.removeItem('component_event');

    let id = this.editorDomService.sendId
      .subscribe(item => this.findHtmlElement(item.id, item.event ? item.event : item, item.tagName));

    //// select individual element (ETS)
    // this.editorDomService.selectIndividualElement
    //   .subscribe(item => this.ngZone.run(() => {
    //     this.openStyleDialog(item);
    //   }));

  }

  ngDoCheck(){
    // Hide startPageNo field based on standard
    this.optStandard = localStorage.getItem('projectstandard');
    if (this.optStandard == "ETS") {
      this.hideStartPage = true;
    }
    else{
      this.hideStartPage = false;
    }

    // Hide edit button in viewer based on userRole OR project editAccess.
    this.projectEditable = JSON.parse(localStorage.getItem('isEditable'));
    (this.userrole == 1 || this.userrole == 2 || this.projectEditable) ? this.isReadOnly = false : this.isReadOnly = true
  }

  //////////////////////////       component json edit       ////////////////////////////

  async enableEditOption() {
    this.changedData = [];
    this.component_event = [];
    this.selectedJsonList = [];
    this.isUserEdit = true;
    document.getElementById('editableFrame').classList.remove("restrictUser");

    localStorage.setItem('pageModel', JSON.stringify(this.processSectionArrayData(this.page_model.sectionArray, 'set')));
  }

  processSectionArrayData(data, execType) {
    let secArray = [];
    for (let i = 0; i < data.length; i++) {
      if (execType == 'set') {
        secArray.push(JSON.stringify(data[i].outerHTML));
      }
      else if (execType == 'get') {
        let elem = $(JSON.parse(data[i]))[0];
        secArray.push(elem);

       if(elem && elem.children[0]){
        let isbelongTo = elem.children[0].children[0] ? elem.children[0].children[0] : elem.children[0];
        let attr = (isbelongTo.getAttribute('isbelongto') == "" || isbelongTo.getAttribute('isbelongto') == null) ? isbelongTo.children[0].getAttribute('isbelongto') == "" ?
          isbelongTo.children[0].children[0].getAttribute('isbelongto') : isbelongTo.children[0].getAttribute('isbelongto')
          : isbelongTo.getAttribute('isbelongto');
        if (this.contentDoc.body.getAttribute('isbelongto') == attr) {
          this.contentDoc.body.innerHTML = elem.innerHTML;
        }
       }

      }
    }

    return secArray;
  }

  /* Close edit option and revert all temporary changes in the viewer screen(html) */
  async closeEditOption() {
    // this.selectedJsonList = [];
    // this.selectedJsonList = localStorage.getItem('selectedJsonList') ? JSON.parse(localStorage.getItem('selectedJsonList')) : [];
    for (let i = 0; i < this.selectedJsonList.length; i++) {
      await this.updateJsonData(this.html_body_json, this.selectedJsonList[i], false);
    }

    this.page_model.sectionArray = this.processSectionArrayData(JSON.parse(localStorage.getItem('pageModel')), 'get');

    this.changedData = [];
    this.component_event = [];
    this.selectedJsonList = [];

    this.isUserEdit = false;
    this.breakElementFlag = false;
    localStorage.removeItem('pageModel');
    // document.getElementById('editableFrame').className = "restrictUser";
    document.getElementById('editableFrame').classList.add("restrictUser");
    document.getElementById('editableFrame').classList.add("page-odd");

  }

  
  /* ETS - Style editor dialog. It helps to edit the text element style(font-family, font-size, color, backgroundColor, 
    font weight, italic, textDecoration and text alignment) and image element(image size and image position) */
  openStyleDialog(elem){
    const dialogRef = this.dialog.open(EditStyleDialogComponent, {
      width: '20%',
      data: { "element": elem}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        let isExist = false;
        if (this.updatedStyleList.length > 0) {
          this.updatedStyleList.forEach(oldItem => {
            if (oldItem.id == result.id) {
              oldItem.styleList = result.styleList;
              isExist = true;
            }
          })
        }
        if (!isExist) {
          this.updatedStyleList.push(result);
        }
      }
    });
  }

  /* It helps to edit the text element style(font-family, font-size, color, backgroundColor, 
    font weight, italic, textDecoration and text alignment) and image element(image size and image position) */
  openDialog(id) {
    // let index = this.component_event.length - 1;
    let data = Object.assign(this.fields);
    let _this = this;
    let isExist = false;

    this.selectedJsonList = localStorage.getItem('selectedJsonList') ? JSON.parse(localStorage.getItem('selectedJsonList')) : [];
    if (this.selectedJsonList.length > 0 && data.length > 0) {
      this.selectedJsonList.forEach(element => {
        if (element[0].attributes[0].id == data[0].attributes[0].id) {
          // element = data;
          isExist = true;
        }
      });
    }
    if (!isExist) {
      localStorage.removeItem('selectedJsonList');
      this.selectedJsonList.push(data);
      localStorage.setItem('selectedJsonList', JSON.stringify(this.selectedJsonList));
    }

    const dialogRef = this.dialog.open(EditHtmlDialogComponent, {
      width: '60%',
      data: { "fields": data, "event": this.current_element, "id": id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let defaultPageHeight: number = parseFloat((localStorage.getItem('pagesize')).split(',')[1]) * 96 - 60; //vishnu
        this.rootContentDoc = this.iframeElement.nativeElement.contentDocument; //vishnu
        this.checkHeightAfterUpdate(defaultPageHeight, this.rootContentDoc);    //vishnu    

        this.selectedJson = (result['changedJson'] != undefined) ? result['changedJson'] : this.selectedJson;

        if (result['changedData'] != undefined && result['changedData'].length > 0) {
          let tempData = result['changedData'];
          this.updateJsonData(_this.html_body_json, result['changedJson'], false);

          tempData.forEach(tempItem => {
            let isExist = false;
            if (this.changedData.length > 0) {
              this.changedData.forEach(oldItem => {
                if (oldItem.id == tempItem.id || oldItem.data_uuid == tempItem.data_uuid || (tempItem.innerHtml && oldItem.innerHtml && (oldItem.innerHtml['id'] == tempItem.innerHtml['id']))) {
                  oldItem.data = tempItem.data;
                  isExist = true;
                }
              })
            }
            if (!isExist) {
              this.changedData.push(tempItem);
            }
          })

        }
      }
    });

  }

  // vishnu - 21.01.22 - start
  async checkHeightAfterUpdate(viewerHeight, rootElement) {
    var sectionHeight = 0;
    if (!rootElement.querySelector("[page_section='true']")) {
      rootElement.body.innerHTML = '<section page_section="true" style="height: 10.5in;">' + rootElement.body.innerHTML + '</section>';
    }

    sectionHeight = rootElement.querySelector("[page_section='true']").style.height;
    rootElement.querySelector("[page_section='true']").style.height = '';
    let rootElementOffsetHeight = rootElement.querySelector("[page_section='true']").offsetHeight;
    if (rootElementOffsetHeight > viewerHeight) {
      this.breakElementFlag = true;
    }
    rootElement.querySelector("[page_section='true']").style.height = sectionHeight;
    console.log("Break Element Flag ---------------------------- ", this.breakElementFlag);

  }
  // vishnu - 21.01.22 - end

  /*  Revert all temporary changes from json */
  async updateJsonData(jsonData, data, found) {
    if (!found) {
      for (let i = 0; i < jsonData.length; i++) {
        let obj = Object.keys(jsonData[i])[0];
        if (obj == "attributes") {
          if (jsonData[i][obj][0].id == data[0].attributes[0].id) {
            // jsonData = data;
            Object.assign(jsonData, data)
            found = true;
            i = jsonData.length;
          }
        }
        else if (obj != "text" && obj != "img") {
          await this.updateJsonData(jsonData[i][obj], data, found);
        }
      }
    }
  }

  /* ETS - update all temporary changes (In json) */
  async updateJson(data, updatedJson, id){
    for (let i = 0; i < data.length; i++) {
      let obj = Object.keys(data[i])[0];
      if (obj == "attributes") {
        if(data[i][obj][0]['id'] == id){
          let cus_obj = Object.keys(updatedJson)[0];
          data = updatedJson[cus_obj];
          return
        }
      }
      else if(obj != "text"){
        await this.updateJson(data[i][obj], updatedJson, id);
      }
    }
  }

  /*  Finally save all temporary changes in html and json  */
  async saveAllHtmlChanges() {
    // for ETS standard
    if(this.projectstandard == "ETS"){
      // let content_Doc = this.iframeElement_test.nativeElement.contentDocument;
      // for(let i = 0; i < this.updatedStyleList.length; i++){
      //   if(content_Doc.getElementById(this.updatedStyleList[i].id)){
      //     content_Doc.getElementById(this.updatedStyleList[i].id).style = this.updatedStyleList[i].styleList;

      //     let data: any = await this.editorJsonService.createJSON(content_Doc.getElementById(this.updatedStyleList[i].id), 'custom', ''); 
      //     data = JSON.parse(data)[0]; 

      //     await this.updateJson(this.html_body_json, data, this.updatedStyleList[i].id);
      //   }
      // }

      
      this.page_model.json = this.html_body_json;
      this.progressBar = true;   
      if (this.breakElementFlag) {
        await this.getpagebreakup(false);
        setTimeout(() => {
          this.onSaveHtml(false);
        }, 4000);
      }
      else {
        await this.getHTMLservice(true);
      }
    }
    else{   // Other Standard
      this.page_model.json = this.html_body_json;
      this.progressBar = true;

      if (this.breakElementFlag) {
        await this.getpagebreakup(false);
        setTimeout(() => {
          this.onSaveHtml(false);
        }, 4000);
      }
      else {
        await this.getHTMLservice(true);
      }
    }
    

    this.isUserEdit = false;
    localStorage.removeItem('pageModel');
    document.getElementById('editableFrame').classList.add("restrictUser");
    document.getElementById('editableFrame').classList.add("page-odd");
  }

  ////  table column duplicate
  async removeDuplicateTableHeader(table_array) {
    for (let i = 0; i < table_array.length; i++) {
      for (let j = i + 1; j < table_array.length; j++) {
        if (table_array[i].id == table_array[j].id && table_array[j].tHead) {
          // // table_array[j].remove(table_array[j].tHead);
          if (table_array[j].tHead.children.length > 0) {
            for (let k = 0; k < table_array[j].tHead.children[0].children.length; k++) {
              table_array[j].tHead.children[0].children[k].innerText = '';
              table_array[j].tHead.children[0].children[k].removeAttribute('text');
              // table_array[j].tHead.children[0].children[k].setAttribute('text', '')
            }
          }
        }
      }
    }
  }

  getDisplayName(data) {
    let displayName = (Object.keys(data)[0]).toLowerCase();
    return displayName;
  }

  // generate uuid and key identifier for json
  async generateHtmlTagId(data, key, componentKey) {
    let temp = data[0].componentData != undefined ? data[0].componentData[0].type : "";
    let identifier = key + " " + temp;
    componentKey = componentKey ? componentKey : data;

    for (let i = 0; i < data.length; i++) {
      let obj = Object.keys(data[i])[0];
      if (obj == "attributes") {
        data[i].componentData[0]['data-uuid'] = data[i].componentData[0].type + "-" + this.createUUID();
        data[i].componentData[0]['identifier'] = identifier.toUpperCase();
      }
      else if (obj == "text") {
        // data[i-1].componentData[0]['data'] = data[i][obj];
        data[0].componentData[0]['data'] = data[i][obj];

        if (componentKey[0].componentData[0]['key'] == '') {
          componentKey[0].componentData[0]['key'] = data[0].componentData[0]['identifier'].toUpperCase();
        }
      }
      else if (obj == "img") {
        data[i][obj][0].componentData[0]['data'] = data[i][obj][0].attributes[0]['src'];

        if (componentKey[0].componentData[0]['key'] == '') {
          componentKey[0].componentData[0]['key'] = data[i][obj][0].componentData[0]['identifier'].toUpperCase();
        }
      }
      else {
        this.generateHtmlTagId(data[i][obj], identifier, componentKey);
      }
    }
  }

  async checkComponent(callFrom, htmlJson, customJson, comp_Data, prevState) {
    comp_Data = comp_Data ? comp_Data : htmlJson;

    for (let i = 0; i < htmlJson.length; i++) {
      if (callFrom == "parent") {
        console.log('---------------- Parent --------------------  ', i);
        this.globalparent = i;
      }
      if(prevState == "parent" && this.projectstandard == 'ETS'){
        this.globalparent = i;
      }

      // if(htmlJson[i].attributes && htmlJson[i].attributes[0] && htmlJson[i].attributes[0].class == "root-container"){
      //   this.globalparent = i;
      // }

      let obj = Object.keys(htmlJson[i])[0];

      if (obj == "attributes") {
        let key1 = htmlJson[i].componentData[0].identifier.toLowerCase();
        let componentClassName = htmlJson[i].attributes[0]['class'];
        // Object value is mjx-container. then set is_component is true.

        if (htmlJson[i].componentData[0].type.toLowerCase() == 'mjx-container') {
          htmlJson[i].attributes[0]['is_component'] = "true";
          htmlJson[i].attributes[0]['key'] = "mjx-container";
        }
        else if (htmlJson[i].componentData[0].type.toLowerCase() == 'table') {
          htmlJson[i].attributes[0]['is_component'] = "true";
          htmlJson[i].attributes[0]['key'] = "table";
        }
        else if(componentClassName && componentClassName.includes("root-container") && htmlJson.length > 1){
          if(Object.keys(htmlJson[1])[0] == "img"){
            htmlJson[i].attributes[0]['is_component'] = "true";
            htmlJson[i].attributes[0]['key'] = "div img";
          }
          else{
            htmlJson[i].attributes[0]['is_component'] = "true";
            htmlJson[i].attributes[0]['key'] = "div p b span";
          }
        }
        else {
          if(htmlJson[i].attributes[0].is_component != "true"){
            for (let k = 0; k < customJson.length; k++) { // custom component array
              let cus_obj = Object.keys(customJson[k])[0];
              let key2 = customJson[k][cus_obj][0].componentData[0]['key'].toLowerCase();
              let startIndex = key1.indexOf(key2);
  
              if (startIndex != -1 && key1.substring(startIndex) == key2) {
                let removeElements = (key1.substring(0, startIndex)).split(' ');
                console.log('passindex' + this.globalparent)
                // if((removeElements.length - key2.split(' ').length) < 3){
                  await this.setKeyAttribute(comp_Data, removeElements, 2, key2, this.globalparent);
                  k = customJson.length;
                // }
              }
            }
          }
        }

      }
      else if (obj != "text") {
        await this.checkComponent('child', htmlJson[i][obj], this.jsonArray, comp_Data, callFrom);
      }
    }
  }

  async setKeyAttribute(htmlJson, removeElements, index, cus_key, htmlIndex) {
    
    for (let i = 0; i < htmlJson.length; i++) {
      let obj = Object.keys(htmlJson[i])[0];
      // console.log(obj,i)
      if (obj != "attributes" && obj != "text" && obj != "img") {
        if (obj == removeElements[index]) {
          await this.setKeyAttribute(htmlJson[i][obj], removeElements, index + 1, cus_key, htmlIndex);
        }
        else if (removeElements.length == index) {
          let temp = cus_key.split(' ')[1];
          // console.log( htmlJson[i][temp][0].attributes[0]['id'], htmlJson[htmlIndex][temp][0].attributes[0]['id'] )
          if (htmlJson[i][temp] != undefined && (temp != 'p' || (htmlJson[i][temp].length > 1 && htmlIndex == i))) { //i == htmlIndex
            // console.log(cus_key, '*******************', htmlJson[i][temp][0].attributes[0]['id'], htmlJson[htmlIndex][temp][0].attributes[0]['id'])
            htmlIndex = (htmlIndex == i) ? htmlIndex : i;
            htmlJson[htmlIndex][temp][0].attributes[0]['key'] = cus_key;
            htmlJson[htmlIndex][temp][0].attributes[0]['is_component'] = "true";
            i = htmlJson.length;
          }
        }
      }
    }
  }

  // generate uuid
  createUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      dt = Math.floor(dt / 16);
      var r = (dt + Math.random() * 16) % 16 | 0;
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  getObjectName(data) {
    this.objectName = (Object.keys(data)[0]).toLowerCase();
    return this.objectName;
  }

  getData(data: any, fieldName: string) {
    let val = data ? data : '';
    this.myForm.value[fieldName].push(val);
  }

  // find selected component
  async findHtmlElement(id, event, tagName) {
    this.current_element = event;
    let isExist = false;
    await this.customJsonProcessing();

    if (this.component_event.length > 0) {
      this.component_event.forEach(async (element) => {
        if (element.id == event.id) {
          // Object.assign(element, this.current_element);
          element = event;
          isExist = true;
        }
      });
    }
    if (!isExist) {
      this.component_event.push(event);
    }

    this.selectedJson = [];
    this.fields = [];
    this.isExist = true;

    for (let i = 0; i < this.html_body_json.length; i++) {
      if (this.selectedJson.length < 1) {
        let obj = Object.keys(this.html_body_json[i])[0];
        if (this.html_body_json[i][obj].length > 1) {
          await this.compareComponent(this.html_body_json[i][obj], this.jsonArray, id, tagName);
        }
      }
    }

    if (this.selectedJson.length > 0) {
      this.ngZone.run(() => {
        this.openDialog(id);
      });
    }
    else {
      console.log("----------------------------------  Component Not Matched   ------------------------------ \n", event);
    }
  }

  async compareComponent(data, customJson, id, tagName) {
    for (let i = 0; i < data.length; i++) {
      if (this.selectedJson.length < 1) {
        let obj = Object.keys(data[i])[0];
        if (obj == "attributes") {
          if (data[i].attributes[0]['id'] == id) {
            if (this.projectstandard == 'ETS') {
              let curr_element = this.current_element;
              this.selectedJson = data;
              this.fields = data;
              i = data.length;
              await this.bindInnerTextData(curr_element, data);
            }
            else {
            let html_key = data[i].attributes[0]['key'].toLowerCase();
            for (let j = 0; j < customJson.length; j++) {
              let cus_obj = Object.keys(customJson[j])[0];
              let cus_key = customJson[j][cus_obj][0].componentData[0]['key'].toLowerCase();

              cus_key = (cus_key.charAt(0) == ' ') ? cus_key.slice(1) : cus_key;
              html_key = (html_key.charAt(0) == ' ') ? html_key.slice(1) : html_key;

              if (html_key == cus_key) {
                let curr_element = this.current_element;
                await this.bindDisplayField(data, customJson[j][cus_obj]);
                await this.bindInnerTextData(curr_element, data);

                this.selectedJson = data;
                this.fields = data;
                j = customJson.length;
              }
              }
            }
          }
          else if ((data[i].componentData[0].type.toLowerCase() == 'mjx-container' || data[i].componentData[0].type.toLowerCase() == 'table') && 
            (tagName == 'mjx-container' || tagName == 'table')) {
            
              for (let k = 0; k < customJson.length; k++) {
              let custObj = Object.keys(customJson[k])[0];
              if (customJson[k][custObj][0].componentData[0].type.toLowerCase() == data[i].componentData[0].type.toLowerCase()) {
                let curr_element = this.current_element;
                await this.bindDisplayField(data, customJson[k][custObj]);
                await this.bindInnerTextData(curr_element, data);

                this.selectedJson = data;
                this.fields = data;
                k = customJson.length;
              }
            }
          }
        }
        else if (obj == "img" && this.projectstandard =="ETS")  {
          if (data[0].attributes[0]['id'] == id) {
          let curr_element = this.current_element;
          this.selectedJson = data;
          this.fields = data;
          i = data.length;
          await this.bindInnerTextData(curr_element, data);
      }
  } 
        else if (obj != "text" && obj != "img") {
          await this.compareComponent(data[i][obj], customJson, id, tagName);
        }
      }
    }
  }

  // async compareComponent(data, customJson, id, tagName) {
  //   for (let i = 0; i < data.length; i++) {
  //     if (this.selectedJson.length < 1) {
  //       let obj = Object.keys(data[i])[0];
  //       if (obj == "attributes") {
  //         if (data[i].attributes[0]['id'] == id) {
  //           let html_key = data[i].attributes[0]['key'].toLowerCase();
  //           for (let j = 0; j < customJson.length; j++) {
  //             let cus_obj = Object.keys(customJson[j])[0];
  //             let cus_key = customJson[j][cus_obj][0].componentData[0]['key'].toLowerCase();

  //             cus_key = (cus_key.charAt(0) == ' ') ? cus_key.slice(1) : cus_key;
  //             html_key = (html_key.charAt(0) == ' ') ? html_key.slice(1) : html_key;

  //             if (html_key == cus_key) {
  //               let curr_element = this.current_element;
  //               await this.bindDisplayField(data, customJson[j][cus_obj]);
  //               await this.bindInnerTextData(curr_element, data);

  //               this.selectedJson = data;
  //               this.fields = data;
  //               j = customJson.length;
  //             }
  //           }
  //         }
  //         else if ((data[i].componentData[0].type.toLowerCase() == 'mjx-container' || data[i].componentData[0].type.toLowerCase() == 'table') && 
  //           (tagName == 'mjx-container' || tagName == 'table')) {
            
  //             for (let k = 0; k < customJson.length; k++) {
  //             let custObj = Object.keys(customJson[k])[0];
  //             if (customJson[k][custObj][0].componentData[0].type.toLowerCase() == data[i].componentData[0].type.toLowerCase()) {
  //               let curr_element = this.current_element;
  //               await this.bindDisplayField(data, customJson[k][custObj]);
  //               await this.bindInnerTextData(curr_element, data);

  //               this.selectedJson = data;
  //               this.fields = data;
  //               k = customJson.length;
  //             }
  //           }
  //         }
  //       }
  //       else if (obj != "text" && obj != "img") {
  //         await this.compareComponent(data[i][obj], customJson, id, tagName);
  //       }
  //     }
  //   }
  // }

  async bindInnerTextData(curr_element, htmlJson) {
    let root_element = curr_element.nodeName.toLowerCase();
    if (this.projectstandard == 'ETS') {
      htmlJson[0].componentData[0]['innerHtmlData'] = curr_element.outerHTML;
    } 
    else {
    if (root_element == 'p' || root_element == 'h1' || root_element == 'h2' || root_element == 'h3' || root_element == 'h4' || root_element == 'h5' || root_element == 'h6'
      || root_element == 'table' || root_element == 'ul' || root_element == 'ol' || root_element == "mjx-container" || root_element == 'td') {
      if (root_element == 'mjx-container' && !curr_element.id) {
        curr_element['id'] = root_element + "-" + this.createUUID();
      }
      htmlJson[0].componentData[0]['innerHtmlData'] = curr_element.outerHTML;
    }
    else {
      for (let i = 0; i < curr_element.children.length; i++) {
        let elem = curr_element.children[i].nodeName.toLowerCase();
        let index = i + 1;
        if (elem == 'p' || elem == 'h1' || elem == 'h2' || elem == 'h3' || elem == 'h4' || elem == 'h5' || elem == 'h6' || elem == 'table' || elem == 'ul' || elem == 'ol' || elem == 'mjx-container' || elem == 'td') {
          index = await this.checkComponentStructure(htmlJson, elem, index, false);
          if (elem == 'mjx-container' && !curr_element.children[i].id) {
            curr_element.children[i]['id'] = elem + "-" + this.createUUID();
          }
          htmlJson[index][elem][0].componentData[0]['innerHtmlData'] = curr_element.children[i].outerHTML;

          // list image icon
          if (elem == 'ol' || elem == 'ul') {
            for (let l = 0; l < curr_element.children[i].children.length; l++) {
              let event = curr_element.children[i].children[l];
              if ((event.innerHTML).includes('src')) {
                await this.setListImageAttribute(event, htmlJson[index][elem][l + 1], l);
              }
            }
          }
          else if (elem == 'table') {
            for (let l = 0; l < curr_element.children[i].children[0].children.length; l++) {
              let event = curr_element.children[i].children[0].children[l];
              let obj = Object.keys(htmlJson[index][elem][1])[0];
              if (obj == 'tbody' && (event.innerHTML).includes('src')) {
                await this.setListImageAttribute(event, htmlJson[index][elem][1][obj][l + 1], l);
              }
            }
          }
        }
        else if (curr_element.children[i].children.length > 0 && htmlJson[i + 1] != undefined && htmlJson[i + 1][elem] != undefined) {
          await this.bindInnerTextData(curr_element.children[i], htmlJson[i + 1][elem]);
        }
      }
    }
  }
}

  async checkComponentStructure(htmlData, elem, index, found) {
    let obj = Object.keys(htmlData[index])[0];
    if (obj == elem) {
      found = true;
    }
    else {
      index += 1;
      await this.checkComponentStructure(htmlData, elem, index, found);
    }
    return index;
  }

  async setListImageAttribute(event, htmlData, index) {
    if (htmlData && event) {
      let obj = Object.keys(htmlData)[0];
      let tagName = event.nodeName.toLowerCase();

      if (tagName == 'img') {
        if (index == 0) {
          htmlData[obj][0].componentData[0]['firstImage'] = true;
        }
        else {
          htmlData[obj][0].componentData[0]['firstImage'] = false;
        }
      }
      else {
        this.setListImageAttribute(event.children[0], htmlData[obj][1], index);
      }
    }
  }

  async bindDisplayField(htmlJson, cusJson) {
    for (let i = 0; i < htmlJson.length; i++) {
      let obj = Object.keys(htmlJson[i])[0];
      if (obj == "text") {
        let displayText = cusJson ? cusJson[0].componentData[0]['displayField'] : '';
        htmlJson[0].componentData[0]['displayField'] = displayText != '' ? displayText : 'Label Name';
      }
      else if (obj == "img") {
        let displayText = (cusJson && cusJson[i] && cusJson[i][obj]) ? cusJson[i][obj][0].componentData[0]['displayField'] : '';
        htmlJson[i][obj][0].componentData[0]['displayField'] = displayText != '' ? displayText : 'Label Name';
      }
      else if (obj != "attributes" && htmlJson[i] != undefined && htmlJson[i][obj] != undefined) {
        let custObj = (cusJson && cusJson[i] && cusJson[i][obj]) ? cusJson[i][obj] : '';
        await this.bindDisplayField(htmlJson[i][obj], custObj);
      }
      // else if (obj != "attributes" && htmlJson[i] != undefined && htmlJson[i][obj] != undefined && cusJson[i] != undefined && cusJson[i][obj] != undefined) {
      //   await this.bindDisplayField(htmlJson[i][obj], cusJson[i][obj]);
      // }
    }
  }

  //////////////////////////       End component json edit          ////////////////////////////

  ngOnDestroy() {
    console.log("yes destroyed");
  }
  ngAfterViewInit() { }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  timeout = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  saved_pageno: number = 0;
  chapter_pagecount: number = 1;
  nodeToDelete: any = '';
  deletedArray: any = [];
  onDeleteNode = function () {
    this.page_model.deleteArray.push(this.nodeToDelete.getAttribute('uniqid'));
    this.nodeToDelete.parentNode.removeChild(this.nodeToDelete)
  }

  getprojectchapters(project) {
    this.dataservice.getProjectData(project).subscribe(data => {
      var response = JSON.parse(data);
      var extension = response.project_type;
      var folder = response.project_name;
      this.projectName = folder;
      this.dataservice.getTocData(folder, extension).subscribe(toc => {
        this.getContentList(toc, extension).then(
          (val) => {
            this.dataservice.getchapterstatus(project, val, folder, extension).subscribe(tocstatus => {
              this.chaptersList = tocstatus;
              this.chapterCount = this.chaptersList.length;
              this.chaptersList[0].select = true;
              this.dataSource = new MatTableDataSource<PeriodicElement>(this.chaptersList);
              this.dataSource.paginator = this.paginator;
            });
          });
      })
    });
  }


  /**1st step to get html file  */
  getHTMLservice = async function (isSave) {
    console.log('gethtmlservice');
    this.progressBar = true;
    let editableFrame = document.getElementById("editableFrame");
    let contentdocumenteditable;
    let projectstandard = localStorage.getItem('projectstandard');
    this.spinner.show();

    if ((!isSave && !this.breakupJsonStatus)) {
      this.page_model.sectionArray = [];
      this.test_sectionarray = [];
      this.page_model.iframeBody = '',
        this.page_model.json = '';
    }

    this.page_model.isRecursive = false;

    try {

      this.chapterDetails = JSON.parse(localStorage.getItem('chapterDetails'));
      this.startPageNumber = (this.chapterDetails.pc_startpage) ? this.chapterDetails.pc_startpage : this.startPageNumber;

      // initial page loading process
      if (!isSave) {
        await this.getpagebreakup(false);
        setTimeout(() => {
          this.addAttributes();
          if (this.test_sectionarray && this.test_sectionarray.length > 0) {

            this.contentDoc.body.setAttribute('isbelongTo', 'page_' + this.saved_pageno);

            let _data: any = {
              sectionArray: this.test_sectionarray
            };
            this.page_model.sectionArray = this.test_sectionarray;

            // this.page_model.json = getJsonData.data.HtmlJsonData;

            this.contentDoc.body.innerHTML = _data.sectionArray ? _data.sectionArray[this.saved_pageno].outerHTML : '';
            this.contentDoc.body.onclick = this.editorDomService.mouseClickEvent;
            this.contentDoc.body.onkeypress = this.editorDomService.onkeyPressEvent;
            this.contentDoc.body.onpaste = this.editorDomService.pasteElement;

            this.contentDoc.head.innerHTML = this.test_contentDoc.head.innerHTML;

            this.headerValue();

            this.spinner.hide();

            this.page_boolean_even = this.contentDoc.body.classList.contains('pagebreak_spi_odd') ? true : false;
            this.isSave = true;

            if (this.break_continous) {
              this.contentDoc.body.innerHTML = ''
              this.page_model.sectionArray = [];
              this.contentDoc.head.innerHTML = '';
              this.changeHtml(this.test_toc, this.test_index)
            } else {
              this.page_model.sectionCount = this.saved_pageno;
              this.button_disable = false;
            }

            this.customJsonProcessing();
          }
          else {
            this.breakupJsonStatus = 0;
          }
        }, 4000);
      }

      setTimeout(async () => {
        // Save process when break element flag is false
        if (isSave && !this.breakElementFlag) {
          let pageNo: any;
          this.spinner.hide();

          this.addAttributes();
          this.page_model.sectionArray = this.test_sectionarray.length > 0 ? this.test_sectionarray : this.page_model.sectionArray;

          // this.test_contentDoc = this.iframeElement_test.nativeElement.contentDocument;
          // this.test_contentDoc.head.innerHTML = '';
          this.test_contentDoc.body.innerHTML = '';
          // this.test_contentDoc.head.innerHTML = this.contentDoc.head.innerHTML;

          this.page_model.sectionArray.forEach((x, index) => {
            if (x.getAttribute('id') == null) {
              let htmlStr = $('<section id="section_' + index + '"' + ' class="rm_mrgn_0 editor-frame dynamicSection">' + x.outerHTML + '</section>')[0];
              x = ''; x = htmlStr;
            }
            if (x.getAttribute('id').split('_')[1] == this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) {
              if(this.contentDoc.body && this.contentDoc.body.innerHTML.includes('dynamicSection')){
                x.innerHTML = this.contentDoc.body.innerHTML;
                this.test_contentDoc.body.innerHTML += this.contentDoc.body.innerHTML;
              }
              else{
                x.innerHTML = this.contentDoc.body.innerHTML;
              this.test_contentDoc.body.innerHTML +=  x.outerHTML;
              }
              
              pageNo = x.getAttribute('id').split('_')[1];
            } else {
              if(x.innerHTML.includes('dynamicSection')){
                this.test_contentDoc.body.innerHTML += x.innerHTML;
              }
              else{
                this.test_contentDoc.body.innerHTML += x.outerHTML;
              } 
            }
          });

          // Html file rewrite
          let test_headdata = this.test_contentDoc.head.innerHTML;

          await this.editorHttpService.createHtml({
            head: htmlEncode(test_headdata),
            body: htmlEncode(this.test_contentDoc.body.innerHTML),
            url: this.uploadURL + localStorage.getItem('projectstandard') + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.pc_name + '.html'
          });
          await this.editorHttpService.createHtml({
            head: htmlEncode(this.test_contentDoc.head.innerHTML),
            body: htmlEncode(this.test_contentDoc.body.innerHTML),
            url: this.uploadURL + localStorage.getItem('projectstandard') + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + 'editorUniqID.html'
          });
          // Html file rewrite - End

          this.contentDoc.body.setAttribute('isbelongTo', 'page_' + this.saved_pageno);

          this.page_boolean_even = this.contentDoc.body.classList.contains('pagebreak_spi_odd') ? true : false;
          this.isSave = true;

          if (this.break_continous) {
            this.contentDoc.body.innerHTML = ''
            this.page_model.sectionArray = [];
            this.contentDoc.head.innerHTML = '';
            this.changeHtml(this.test_toc, this.test_index)
          } else {
            this.page_model.sectionCount = this.saved_pageno;
            this.button_disable = false;
          }

          await this.customJsonProcessing();

          if (document.getElementById('editableFrame_test')) {
            // Set json data into redis
            let breakuphtml = this.iframeElement_test.nativeElement.contentDocument;
            let currentChapter: any = JSON.parse(localStorage.getItem('chapterDetails'));
            let setJsonData: any = {
              head: breakuphtml.head.innerHTML,
              body: breakuphtml.body.innerHTML,
              HtmlJsonData: this.page_model.json
            }

            if (pageNo) {
              this.contentDoc.body.setAttribute('isbelongto', 'page_' + pageNo);
              // this.contentDoc.body.innerHTML = [this.test_contentDoc.body][0].children[pageNo].outerHTML;
            }

            if (setJsonData.head != '' && setJsonData.body != '' && setJsonData.HtmlJsonData != '') {
              this.http.post(this.appConfig.config.apiURL + "/setRedisJsonData", {
                'folderName': currentChapter.folder,
                'chapter_name': currentChapter.chapter_name,
                'chapterFullName': this.projectName + '/' + this.currentChapter.chapter_name,
                'chapterJsonData': setJsonData
              }).toPromise();
            }
            // End - Set json data into redis
          }

          this._snackBar.open('Save process completed successfully', '', {
            duration: 3000,
            verticalPosition: 'top',
            horizontalPosition: this.horizontalPosition = 'center',
            panelClass: ['mat-toolbar', 'mat-primary']    //  mat-primary' to 'mat-accent' or 'mat-warn'
          })

        } // (Initial page generate process and loading) / (Save process when break element flag is true)
        else if ((!isSave && !this.breakupJsonStatus) || (!this.breakupJsonStatus || this.breakElementFlag)) {

          this.addAttributes();
          if (!this.breakupJsonStatus && this.breakElementFlag) {
            this.page_model.sectionArray = [];
          }

          let pathURL = '';
          if (projectstandard == 'ETS') {
            pathURL = this.uploadURL;
          }
          else {
            pathURL = this.uploadURL + projectstandard + '/';
          }

          let responseData = await this.http.get(this.appConfig.config.apiURL + "/readfile", {
            params: {
              'url': pathURL + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.pc_name + '.html'
            }
          }).toPromise();

          let project_path = pathURL + this.projectName;
          project_path = project_path.replace(new RegExp("./pod_assets/uploads/", "g"), "/pod_assets/uploads/");

          let data: any = await this.editorJsonService.createJSONfromHTML(responseData, this.contentDoc, false, this.appConfig.config.hostURL + project_path);

          // // editorHeadJSON & editorBodyJSON file write process
          // for (let x in data) {
          //   await this.editorHttpService.creatJSONservice(data[x].data, this.contentDoc, data[x].fileName, this.uploadURL + projectstandard + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/');
          // }

          for (let x in data) {
            if (data[x].fileName == 'editorHeadJSON') {
              var datajson = (data[x].data) ? JSON.parse(data[x].data) : '';
              await this.editorDomService.appendIframeHeadContent(datajson, this.contentDoc);
            }
            else {
              // this.page_model.json = JSON.parse(data[x].data);
              if (this.contentDocData && this.contentDocData.HtmlJsonData) {
                this.html_body_json = this.contentDocData.HtmlJsonData;
              }

              this.html_body_json = this.html_body_json.length > 0 ? this.html_body_json : JSON.parse(data[x].data);

              //// json compare - venkat

              // await this.customJsonProcessing();
              for (let i = 0; i < this.jsonArray.length; i++) {
                let obj = Object.keys(this.jsonArray[i])[0];
                await this.generateHtmlTagId(this.jsonArray[i][obj], '', false);
              }

              for (let i = 0; i < this.html_body_json.length; i++) {
                let obj = Object.keys(this.html_body_json[i])[0];
                await this.generateHtmlTagId(this.html_body_json[i][obj], '', false);

                if (this.html_body_json[i][obj].length > 1) {
                  await this.checkComponent('parent', this.html_body_json[i][obj], this.jsonArray, '', '');
                }
              }

              this.page_model.json = this.html_body_json;

              //// end json compare - venkat

              let _data: any = '';
              if (!this.breakupJsonStatus) {
                this.test_contentDoc = this.iframeElement_test.nativeElement.contentDocument;
                this.test_contentDoc.head.innerHTML = '';
                this.test_contentDoc.body.innerHTML = '';
                this.test_contentDoc.head.innerHTML = this.contentDoc.head.innerHTML;
              }
              this.page_model.sectionCount = this.saved_pageno;

              if (!isSave) {
                this.chapter_pagecount = 1;
                if (!this.breakupJsonStatus) {
                  _data = await this.editorDomService.appendIframePageWiseContent(this.page_model, this.contentDoc, '', this.test_contentDoc);
                  this.test_contentDoc.body.innerHTML = this.contentDoc.body.innerHTML;
                  this.contentDoc.body.innerHTML = '';
                }
              } else {
                // //if(!this.breakupJsonStatus) {
                this.test_contentDoc.body.innerHTML = this.contentDoc.body.innerHTML;
                this.contentDoc.body.innerHTML = '';
                _data = await this.editorDomService.appendIframePageWiseContent(this.page_model, this.test_contentDoc, '', this.test_contentDoc);
                // //}
              }

              if (this.test_sectionarray && this.test_sectionarray.length > 0) {
                if (!this.breakElementFlag) {
                  _data['sectionArray'] = this.test_sectionarray;
                  this.page_model.sectionArray = this.test_sectionarray;
                }
                // _data = {
                //   sectionArray: this.test_sectionarray
                // };
                // this.page_model.sectionArray = this.test_sectionarray;
              }

              this.contentDoc.body.setAttribute('isbelongTo', 'page_' + this.saved_pageno);
              if (!isSave) {
                //if(!this.breakupJsonStatus){
                //this.contentDoc.body.innerHTML = _data.sectionArray[this.saved_pageno].outerHTML;
                this.contentDoc.body.innerHTML = _data.sectionArray ? _data.sectionArray[this.saved_pageno].outerHTML : '';
                this.contentDoc.body.onclick = this.editorDomService.mouseClickEvent;
                this.contentDoc.body.onkeypress = this.editorDomService.onkeyPressEvent;
                this.contentDoc.body.onpaste = this.editorDomService.pasteElement;
                this.headerValue();

                this.spinner.hide();
              }

              this.page_boolean_even = this.contentDoc.body.classList.contains('pagebreak_spi_odd') ? true : false;
              this.isSave = true;
              if (!this.breakupJsonStatus) {
                // if(this.breakElementFlag){
                //   this.page_model.isRecursive = false;
                // }
                await this.continousPagingFunction(_data);
              }

              if (this.break_continous) {
                this.contentDoc.body.innerHTML = ''
                this.page_model.sectionArray = [];
                this.contentDoc.head.innerHTML = '';
                this.changeHtml(this.test_toc, this.test_index)
              } else {
                this.page_model.sectionCount = this.saved_pageno;
                this.button_disable = false;
              }

            }
          }

          if (document.getElementById('editableFrame_test') && (!this.breakupJsonStatus || this.breakElementFlag)) {
            // Set json data into redis
            let breakuphtml = this.iframeElement_test.nativeElement.contentDocument;
            let currentChapter: any = JSON.parse(localStorage.getItem('chapterDetails'));

            if (!this.contentDocData && this.contentDocData == '') {
              this.contentDocData = {
                head: breakuphtml.head.innerHTML,
                body: breakuphtml.body.innerHTML,
                HtmlJsonData: this.page_model.json
              }
            }
            if (this.contentDocData != '' && this.contentDocData.head != '' && this.contentDocData.body != '' && this.contentDocData.HtmlJsonData != '') {
              await this.http.post(this.appConfig.config.apiURL + "/setRedisJsonData", {
                'folderName': currentChapter.folder,
                'chapter_name': currentChapter.chapter_name,
                'chapterFullName': this.projectName + '/' + this.currentChapter.chapter_name,
                'chapterJsonData': this.contentDocData
              }).toPromise();

              this.breakElementFlag = false;
              this.breakupJsonStatus = 1;
            }
            // End - Set json data into redis

          }
        }


        // this.removeMediaAttribute();
        console.log('1st resolved');
        this.contentDocData = '';

        this.progressBar = false;
        // document.getElementById('editableFrame').classList.add("page-odd");

        let editableFramepreview = this.iframeElement.nativeElement.contentDocument;
        this.editableFramepreview = editableFramepreview;
        /* if (document.getElementById('hiddenfinalhtml') && !this.saveflag) {
            await this.processpdfservice.savefinalhtml(this.currentChapter);
        }*/
        this.createUniqIdHTML();
      }, 4000);


    } catch (error) {
      console.log(error)
    }
  }

  continousPagingFunction = async function (data) {
    if (this.isSave && (this.page_model.sectionArray[this.saved_pageno] != '' && this.page_model.sectionArray[this.saved_pageno] != undefined)) {
      //console.log(this.page_model,"page_model")
      if (this.contentDoc.body.innerHTML == '') {
        if (this.breakElementFlag) {
          this.contentDoc.body.innerHTML = this.test_contentDoc.body.querySelector("[page_section='true']").outerHTML;
        }
        else {
          this.contentDoc.body.innerHTML = this.page_model.sectionArray[this.saved_pageno].innerHTML;
        }
        //  let section_elements = this.contentDoc.body.querySelectorAll('body > *');
        //  Array.prototype.slice.call(section_elements).map((e) => {
        //  e.addEventListener("click", this.editorDomService.mouseClickEvent);
        // })

        //if(!this.showPreview){
        this.spinner.hide();
      }
    }

    if (this.page_model.isRecursive) {

      if (this.page_model.sectionArray.length % 2 == 0) {
        this.test_contentDoc.body.classList.remove('pagebreak_spi_odd')
        this.test_contentDoc.body.classList.add('pagebreak_spi_even')
      } else {
        this.test_contentDoc.body.classList.remove('pagebreak_spi_even')
        this.test_contentDoc.body.classList.add('pagebreak_spi_odd')
      }

      let _data = await this.editorDomService.appendIframePageWiseContent(data, this.test_contentDoc, '', this.test_contentDoc);
      if (this.break_continous)
        return

      await this.continousPagingFunction(_data)
    } else {

      this.test_contentDoc.body.innerHTML = '';

      data.sectionArray.forEach((x) => {
        this.test_contentDoc.body.innerHTML += x.outerHTML;
      })

      this.changetablesize("editableFrame_test");

      if (!this.button_disable) {
        let breakuphtml = this.iframeElement_test.nativeElement.contentDocument;
        let prev = this.previous_chapterDetails;
        this.dataservice.createbreakuphtmlfile(prev.folder, prev.chapter_name, breakuphtml.head.innerHTML, breakuphtml.body.innerHTML).subscribe((res) => { }, error => { });
      }

      if (this.contentDocData && this.contentDocData.body) {
        this.contentDocData.body = this.test_contentDoc.body.innerHTML;
      }
      console.log('completed')
    }

    new Promise((resolve, reject) => {
      resolve(true)
    })

  }

  /** function to create mock html in test iframe */
  // createUniqIdHTML = async function () {
  //   this.test_contentDoc = this.iframeElement_test.nativeElement.contentDocument;
  //   let headdata = this.test_contentDoc.head.innerHTML;
  //   let bodydata = this.test_contentDoc.body.innerHTML;
  //   headdata = headdata.replace(new RegExp("../.././pod_assets/uploads/iframe.css", "g"), "../../../../iframe.css");
  //   headdata = headdata.replace(new RegExp(window.location.protocol + '//' + environment.pod_port + '/pod_assets/uploads/', "g"), "../../../../");
  //   bodydata = bodydata.replace(new RegExp(window.location.protocol + '//' + environment.pod_port + "/pod_assets/uploads/" + localStorage.getItem('projectstandard') + "/" + this.projectName + "/img/", "g"), "../../img/");
  //   await this.editorHttpService.createHtml({
  //     head: htmlEncode(headdata),
  //     body: htmlEncode(bodydata),
  //     url: this.uploadURL + localStorage.getItem('projectstandard') + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.chapter_name + '_print.html'
  //   });
  //   //  this.enable_icon = true;
  //   //  this.test_contentDoc.body.innerHTML = '';
  //   //  this.test_contentDoc.head.innerHTML = '';
  //   //  this.test_contentDoc.head.innerHTML = this.test_contentDoc_head;
  //   //  this.test_contentDoc.body.innerHTML = this.test_contentDoc_body;
  //   //  // this.spinner.hide();
  //   // } catch (error) {
  //   //  console.log(error)
  //   // }
  // }

  createUniqIdHTML = async function () {
    this.test_contentDoc = this.iframeElement_test.nativeElement.contentDocument;
    
    let headdata = this.test_contentDoc.head.innerHTML;
    let bodydata = this.test_contentDoc.body.innerHTML;
   
    let createhtmlurl = '';
    if (localStorage.getItem('projectstandard') == "ETS") {
      // bodydata = bodydata.replace(new RegExp("https://newmedia.spi-global.com/api/pod_assets/uploads//" + this.projectName + "//Items/", "g"), "../../Items/");
      createhtmlurl = this.uploadURL + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.chapter_name + '_print.html';
    }
    else {
      headdata = headdata.replace(new RegExp("../.././pod_assets/uploads/iframe.css", "g"), "../../../../iframe.css");
      headdata = headdata.replace(new RegExp(window.location.protocol + '//' + environment.pod_port + '/pod_assets/uploads/', "g"), "../../../../");
      bodydata = bodydata.replace(new RegExp(window.location.protocol + '//' + environment.pod_port + "/pod_assets/uploads/" + localStorage.getItem('projectstandard') + "/" + this.projectName + "/img/", "g"), "../../img/");
      createhtmlurl = this.uploadURL + localStorage.getItem('projectstandard') + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.chapter_name + '_print.html'
    }

    await this.editorHttpService.createHtml({
      head: htmlEncode(headdata),
      body: htmlEncode(bodydata),
      url: createhtmlurl
    });
  }

    /**page navigation */
    page_boolean_even: boolean = true;
    pageNavigation = async function (state) {
      this.isSave = false;
      this.editorDomService.eventArray && this.editorDomService.eventArray.map((elem) => {
        if (elem && elem.target.style) {
          elem.target.style.border = "";
          elem.target.style.boxShadow = "";
          elem.target.style.padding = ""
          elem.target.style.borderRadius = ""
        }
        if (elem && elem.target && elem.target.parentNode && elem.target.parentNode.style) {
          elem.target.parentNode.style.border = "";
          elem.target.parentNode.style.boxShadow = "";
          elem.target.parentNode.style.padding = ""
          elem.target.parentNode.style.borderRadius = ""
        }
        if (elem && elem.target && elem.target.parentNode && elem.target.parentNode.parentNode && elem.target.parentNode.parentNode.style) {
          elem.target.parentNode.parentNode.style.border = "";
          elem.target.parentNode.parentNode.style.border = "";
          elem.target.parentNode.parentNode.style.boxShadow = "";
          elem.target.parentNode.parentNode.style.padding = ""
          elem.target.parentNode.parentNode.style.borderRadius = ""
        }
      })

      if (this.editorDomService.newLineElement.length > 1) {
        for (var e of this.editorDomService.newLineElement) {
          e.style.border = "";
          e.style.boxShadow = "";
          e.style.padding = "";
          e.style.borderRadius = "";
        }
      }


      let breakElem = [];

      if (this.editorDomService.parentSection.length > 0) {
        for (var i = 0; i < this.editorDomService.parentSection.length; i++) {
          breakElem.push(this.editorDomService.parentSection[i]);
        }
      }

      breakElem.forEach(function (x) {
        if (x.parentNode != null) {
          if (x.parentNode.textContent == null || x.parentNode.textContent == "") {
            x.parentNode.remove();
          }
        }
      });

      let editorSlide = document.getElementById("editor_newframe");
      if (editorSlide) {
        editorSlide.style.display = 'none';
      }
      let editorSlidetable = document.getElementById("editor_newframe_table");
      if (editorSlidetable) {
        editorSlidetable.style.display = 'none';
      }

      let editorSlideimage = document.getElementById("editor_newframe_image");
      if (editorSlideimage) {
        editorSlideimage.style.display = 'none';
      }

      let editorSlidemath = document.getElementById("matheditor_container");
      if (editorSlidemath) {
        editorSlidemath.style.display = 'none';
      }

      let _Id = this.contentDoc.body.hasAttribute('isbelongTo') ? JSON.parse(this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) : '';
      this.page_model.sectionArray[_Id]['innerHTML'] = this.contentDoc.body.innerHTML != undefined ? this.contentDoc.body.innerHTML : '';

      this.asideVisible = !this.asideVisible;
      if (state == 'next' && (_Id <= this.page_model.sectionArray.length - 1)) {

        _Id++;
        if (_Id == 1)
          this.chapter_pagecount = _Id;


        if (!this.page_model.isRecursive && (_Id == this.page_model.sectionArray.length - 1)) {
          this.isPageFirst = false;
        }

        if (!this.page_model.isRecursive && (_Id > this.page_model.sectionArray.length - 1))
          return

        this.spinner.show();


        if (this.page_model.sectionArray[_Id] != '' && this.page_model.sectionArray[_Id] != undefined) {
          if (_Id % 2 == 0) {
            this.contentDoc.body.classList.remove('pagebreak_spi_odd')
            this.contentDoc.body.classList.add('pagebreak_spi_even')
            this.page_boolean_even = false;
          } else {
            this.contentDoc.body.classList.remove('pagebreak_spi_even')
            this.contentDoc.body.classList.add('pagebreak_spi_odd')
            this.page_boolean_even = true;
          }

          this.page_model.sectionCount = _Id
          this.contentDoc.body.innerHTML = '';
          // this.contentDoc.body.onclick = this.editorDomService.mouseClickEvent;
          this.contentDoc.body.innerHTML = this.page_model.sectionArray[_Id].innerHTML;
          this.contentDoc.body.setAttribute('isbelongTo', 'page_' + _Id);
          //this.button_disable=false;
          this.chapter_pagecount++;
          this.jumppage = this.chapter_pagecount;
          this.isShowPageTitle = this.chapter_pagecount === 1 ? true : false;
          this.changetablesize("editableFrame");
          //this.page_model.sectionArray[_Id].innerHTML = this.contentDoc.body.innerHTML;
        } else {
          this._snackBar.open('PAGES ARE STILL IN PROGRESS', '', {
            duration: 3000
          })
        }

      } else if (state == 'previous' && _Id > 0) {

        this.spinner.show();
        _Id--;


        if (this.page_model.sectionArray[_Id] != '' && this.page_model.sectionArray[_Id] != undefined) {
          if (_Id % 2 == 0) {
            this.contentDoc.body.classList.remove('pagebreak_spi_odd')
            this.contentDoc.body.classList.add('pagebreak_spi_even')
            this.page_boolean_even = false;
          } else {
            this.contentDoc.body.classList.remove('pagebreak_spi_even')
            this.contentDoc.body.classList.add('pagebreak_spi_odd')
            this.page_boolean_even = true;
          }
          this.contentDoc.body.innerHTML = '';
          this.page_model.sectionCount = _Id
          // this.contentDoc.body.onclick = this.editorDomService.mouseClickEvent;
          this.contentDoc.body.innerHTML = this.page_model.sectionArray[_Id].innerHTML;
          this.contentDoc.body.setAttribute('isbelongTo', 'page_' + _Id);
          this.chapter_pagecount--;
          this.jumppage = this.chapter_pagecount;
          this.isShowPageTitle = this.chapter_pagecount === 1 ? true : false;
          //this.button_disable=false;
          this.isPageFirst = true;
          console.log(this.isPageFirst);
        }
      } else if (state == 'gopage' && this.jumppage <= this.page_model.sectionArray.length) {
        this.jumppage = parseInt(this.jumppage)
        let jumppage = this.jumppage - 1;
        console.log(jumppage + '-----' + this.page_model.sectionArray.length);
        if (!this.page_model.isRecursive && (jumppage == this.page_model.sectionArray.length - 1)) {
          this.isPageFirst = false;
        } else {
          this.isPageFirst = true;
        }

        if (!this.page_model.isRecursive && (jumppage > this.page_model.sectionArray.length))
          return

        this.spinner.show();


        if (this.page_model.sectionArray[jumppage] != '' && this.page_model.sectionArray[jumppage] != undefined) {
          if (jumppage % 2 == 0) {
            this.contentDoc.body.classList.remove('pagebreak_spi_odd')
            this.contentDoc.body.classList.add('pagebreak_spi_even')
            this.page_boolean_even = false;
          } else {
            this.contentDoc.body.classList.remove('pagebreak_spi_even')
            this.contentDoc.body.classList.add('pagebreak_spi_odd')
            this.page_boolean_even = true;
          }

          this.page_model.sectionCount = jumppage
          this.contentDoc.body.innerHTML = '';
          // this.contentDoc.body.onclick = this.editorDomService.mouseClickEvent;
          this.contentDoc.body.innerHTML = this.page_model.sectionArray[jumppage].innerHTML;
          this.contentDoc.body.setAttribute('isbelongTo', 'page_' + jumppage);
          //this.button_disable=false;
          this.chapter_pagecount = this.jumppage;
          this.isShowPageTitle = this.jumppage === 1 ? true : false;
          this.changetablesize("editableFrame");
          this.page_model.sectionArray[jumppage].innerHTML = this.contentDoc.body.innerHTML;
          //  this.isPageFirst = (this.jumppage > 1) ? false : true;
        } else {
          this._snackBar.open('PAGES ARE STILL IN PROGRESS', '', {
            duration: 3000
          })
        }
      }

      this.spinner.hide();
    }
    checkNode = function (node) {
      if (node.nodeType === 8 || node.nodeName.toLowerCase() == '#comment') {
        node.remove();
      } else if (node.parentNode.nodeType === 1) {
        return this.checkNode(node.parentNode);
      }

      return false;
    }


    /** function on save */
    onSaveHtml = async function (pdf) {
      this.saveflag = true;
      this.spinner.show();
      this.eventArrayHandler();
      this.test_contentDoc = this.iframeElement_test.nativeElement.contentDocument;
      this.contentDocData = '';

      let projectstandard = localStorage.getItem('projectstandard');
      let editorSlide = document.getElementById("editor_newframe");
      if (editorSlide) {
        editorSlide.style.display = 'none';
      }
      let editorSlidetable = document.getElementById("editor_newframe_table");
      if (editorSlidetable) {
        editorSlidetable.style.display = 'none';
      }

      let editorSlideimage = document.getElementById("editor_newframe_image");
      if (editorSlideimage) {
        editorSlideimage.style.display = 'none';
      }

      let editorSlidemath = document.getElementById("matheditor_container");
      if (editorSlidemath) {
        editorSlidemath.style.display = 'none';
      }
      let currentChapter = JSON.parse(localStorage.getItem('chapterDetails'));
      this.breakupJsonStatus = 0;

      // this.dataservice.savebreakup(currentChapter.folder, currentChapter.chapter_name).subscribe((res) => { }, error => { });

      this.test_contentDoc.body.innerHTML = '';
      this.saved_pageno = this.contentDoc.body.hasAttribute('isbelongTo') ? JSON.parse(this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) : '';

      this.page_model.sectionArray.forEach((x, index) => {
        if (x.getAttribute('id') == null) {
          let htmlStr = $('<section id="section_' + index + '"' + ' class="rm_mrgn_0 editor-frame dynamicSection">' + x.outerHTML + '</section>')[0];
          x = ''; x = htmlStr;
        }
        if (x.getAttribute('id').split('_')[1] == this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) {
          x.innerHTML = this.contentDoc.body.querySelector("[page_section='true']").outerHTML; //this.contentDoc.body.innerHTML;
        }

        if (x.getAttribute('id').split('_')[1] == this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) {
          if(this.contentDoc.body && this.contentDoc.body.innerHTML.includes('dynamicSection')){
            x.innerHTML = this.contentDoc.body.innerHTML;
            this.test_contentDoc.body.innerHTML += this.contentDoc.body.innerHTML;
          }
          else{
            x.innerHTML = this.contentDoc.body.innerHTML;
            this.test_contentDoc.body.innerHTML +=  x.outerHTML;
          }
          // pageNo = x.getAttribute('id').split('_')[1];
        } else {
          if(x.innerHTML.includes('dynamicSection')){
            this.test_contentDoc.body.innerHTML += x.innerHTML;
          }
          else{
            this.test_contentDoc.body.innerHTML += x.outerHTML;
          } 
        }
      });

      let setJsonData: any = {
        head: this.test_contentDoc.head.innerHTML,
        body: this.test_contentDoc.body.innerHTML,
        HtmlJsonData: this.page_model.json,
      }

      this.button_disable = true;

      let table_array = this.test_contentDoc.body.getElementsByTagName('table');
      if (table_array && table_array.length > 0) {
        await this.removeDuplicateTableHeader(table_array);
      }

      let data = await this.editorJsonService.createSaveJSON(this.test_contentDoc.body);
      this.page_model.newData = data;
      await this.editorSaveService.appendIframePageWiseContent(this.page_model, this.contentDoc, '', '');
      let project_path = this.uploadURL + projectstandard + '/' + this.projectName;

      // project_path = project_path.replace(new RegExp("./pod_assets/uploads/", "g"), "/pod_assets/uploads/");

      let modified_data = await this.editorJsonService.createJSONfromHTML(this.contentDoc.childNodes[0].innerHTML, this.test_contentDoc, true, this.appConfig.config.hostURL + project_path);
      this.resetJSONHTML(modified_data);

      setJsonData.HtmlJsonData = modified_data ? JSON.parse(modified_data[1].data) : setJsonData.HtmlJsonData;
      this.contentDocData = setJsonData;

      await this.getHTMLservice(true);


      // console.log('data',data)

      // this.button_disable = true;
      // this.saved_pageno = this.contentDoc.body.hasAttribute('isbelongTo') ? JSON.parse(this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) : '';
      // this.page_model.sectionCount = 0;
      // this.spinner.show();
      // let url = this.uploadURL + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + 'editorUniqID.html';

      // let belongs_to: any = this.contentDoc.body.getAttribute('isbelongTo').split('_')[1];
      // this.page_model.sectionArray.forEach((x) => {
      //  if (x.getAttribute('id').split('_')[1] == this.contentDoc.body.getAttribute('isbelongTo').split('_')[1]) {
      //      while (x.firstChild) {
      //          x.removeChild(x.firstChild);
      //      }
      //      x.innerHTML = this.contentDoc.body.innerHTML;
      //  }
      // })

      // let responseData = await this.editorSaveService.mappingContent(this.contentDoc.body, this.test_contentDoc, this.contentDoc, url, this.page_model, pdf);
      // let project_path = this.uploadURL + this.projectName;
      // project_path = project_path.replace(new RegExp("../pod_assets/uploads/", "g"), "/pod_assets/uploads/");
      // let data = await this.editorJsonService.createJSONfromHTML(responseData.childNodes[0].innerHTML, this.test_contentDoc, true, this.appConfig.config.hostURL + project_path);
      // if (!pdf) {
      //  await this.resetJSONHTML(data);
      //  this.getHTMLservice(true);
      // } else {
      //  return new Promise((resolve, reject) => {
      //      resolve(data)
      //  })
      // }

    }

    resetJSONHTML = async function (data) {
      try {
        for (let x in data) {
          if (data[x].fileName == 'editorBodyJSON') {
            let test_data: any = {
              newData: ''
            }
            test_data.newData = data[x].data
            await this.editorSaveService.appendIframePageWiseContent(test_data, this.test_contentDoc, '', true, true)
          } else {
            await this.editorSaveService.appendIframeHeadContent(data[x].data, this.test_contentDoc, true)
          }
        }

        let test_headdata = this.test_contentDoc.head.innerHTML;

        test_headdata = test_headdata.replace(new RegExp(window.location.protocol + '//' + environment.pod_port + "/pod_assets/uploads/" + localStorage.getItem('projectstandard') + "/" + this.projectName + "/assets/", "g"), "../../assets/");
        test_headdata = test_headdata.replace(new RegExp("../.././pod_assets/uploads/iframe.css", "g"), "../../../../iframe.css");

        this.test_contentDoc.body.innerHTML = this.test_contentDoc.body.innerHTML.replace(new RegExp(window.location.protocol + '//' + environment.pod_port + "/pod_assets/uploads/" + localStorage.getItem('projectstandard') + "/" + this.projectName, "g"), "../..");

        await this.editorHttpService.createHtml({
          head: htmlEncode(test_headdata),
          body: htmlEncode(this.test_contentDoc.body.innerHTML),
          url: this.uploadURL + localStorage.getItem('projectstandard') + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.pc_name + '.html'
        });
        await this.editorHttpService.createHtml({
          head: htmlEncode(this.test_contentDoc.head.innerHTML),
          body: htmlEncode(this.test_contentDoc.body.innerHTML),
          url: this.uploadURL + localStorage.getItem('projectstandard') + '/' + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + 'editorUniqID.html'
        });
        return new Promise((resolve, reject) => {
          resolve('')
        })
      } catch (error) {
        console.log(error)
      }
    }


    generatePDF = async function () {
      this.pdfunderprocess = true;
      this.spinner.show();
      //let data = await this.onSaveHtml(true);
      //await this.appendBreakCondition(this.test_contentDoc);
      this.test_contentDoc.body.innerHTML = '';
      this.page_model.sectionArray.forEach((x) => {
        x.classList.add('break_condition')
        this.test_contentDoc.body.innerHTML += x.outerHTML;
      })
      // let test_data = this.test_contentDoc.body.querySelectorAll('[class=dynamicSection]')
      // test_data.forEach((x)=>{
      //  x.classList.add('break_condition')
      // })
      // await this.appendBreakCondition(this.test_contentDoc);
      /*console.log(typeof(this.test_contentDoc.head.innerHTML));
      var testhead = this.test_contentDoc.head.innerHTML;
      await this.editorHttpService.createHtml({
      head: htmlEncode(this.test_contentDoc.head.innerHTML),
      body: htmlEncode(this.test_contentDoc.body.innerHTML),
      url: this.uploadURL + this.projectName + '/s9ml/' + this.currentChapter.chapter_name + '/' + this.currentChapter.pc_name + '.html'
      });*/
      await this.processpdfservice.test_generatePDF(this.currentChapter, 0);
      this.spinner.hide();
    }

    appendBreakCondition = async function (saveElement) {
      try {
        let array_Id: any = [];
        this.page_model.sectionArray.forEach((x) => {
          // array_Id.push(x.querySelector('[break=break_condition]'))
          array_Id.push(Array.from(x.querySelectorAll('*')).slice(-1).pop())
        })
        array_Id.forEach((x) => {
          let _Id = x.getAttribute('uniqid');
          saveElement.body.querySelector('[uniqid="' + _Id + '"]').classList.add('break_condition')
        })
        return new Promise((resolve, reject) => {
          resolve('')
        })

      } catch (err) {
        if (err)
          throw err
      }
    }
    /**
     * Menu side bar navigation function
     */
    test_toc: any = '';
    test_index: any = '';
    changeHtml_test = function (toc, index) {

      this.isPageFirst = true;
      this.jumppage = 1;
      let editorSlide = document.getElementById("editor_newframe");
      if (editorSlide) {
        editorSlide.style.display = 'none';
      }
      let editorSlidetable = document.getElementById("editor_newframe_table");
      if (editorSlidetable) {
        editorSlidetable.style.display = 'none';
      }

      let editorSlideimage = document.getElementById("editor_newframe_image");
      if (editorSlideimage) {
        editorSlideimage.style.display = 'none';
      }

      let editorSlidemath = document.getElementById("matheditor_container");
      if (editorSlidemath) {
        editorSlidemath.style.display = 'none';
      }
      this.test_toc = toc;
      this.test_index = index;

      this.break_continous = true;
      if (this.currentChapter.chapter_name == toc.chapter_name) {
        this.activatedRoute.params.subscribe(params => {
          new Promise((resolve, reject) => {
            this.getProjectDetails(params, resolve);
          })
        });
      }
      //if(!this.button_disable){
      this.changeHtml(toc, index)
      //}

    }

    changeHtml = async function (toc, index) {
      // this.index=index;
      this.break_continous = false;
      this.button_disable = true;

      this.firstload += 1;
      let obj = this.routePath;
      let navigationExtras: NavigationExtras = {
        queryParams: {
          'chaptername': toc.chapter_name,
          'pageno': this.pageVariable
        },
        skipLocationChange: true,
        replaceUrl: true
      };
      this.pageVariable = 1;

      this.selectedToc = toc;

      this.spinner.show();

      localStorage.setItem('chapterDetails', JSON.stringify(toc));
      this.chapterDetails = JSON.parse(localStorage.getItem('chapterDetails'));
      this.currentChapter = JSON.parse(localStorage.getItem('chapterDetails'));
      this.previous_chapterDetails = this.chapterDetails;
      localStorage.setItem('chapterid', toc.pc_id);
      this.chaptersList.forEach(function (value) {
        if (value.chapter_name == toc.chapter_name) {
          value.select = true;
        } else {
          value.select = false;
        }
      });
      // console.log(this.page_model);
      if (toc.pc_status == 0) {
        this.poptipOpen().then((result: any) => {
          if (result != `data`) {
            this.pgno = result["page_number"];
            this.pop_tip = result["poptip_c"];
            this.twocolumn = result["twocolumn"];
            this.processpdfservice.generateHtml(toc, index, this.pgno, this.pop_tip, this.twocolumn).subscribe(
              data => {
                this.tocdetails = data;
                toc.html = true;
                this.saved_pageno = 0;
                this.getHTMLservice(false);
              })
          } else {
            this.onloadChapter();
          }
        });


      } else if (toc.pc_status == 1 || toc.pc_status == 2) {
        console.log(this.showPreview);
        if (!this.showPreview) {
          await this.getpagebreakup(true);
        }
        //this.getHTMLservice(false);
      }
    }

    getpagebreakup = async function (callhtml) {
      await this.dataservice.checkbreakuphtmlfile(this.chapterDetails.folder, this.chapterDetails.chapter_name).subscribe(async (response) => {
        let brkres = response.json();
        this.breakupJsonStatus = (brkres.length > 0) ? brkres[0].pc_breakup : '';
        localStorage.setItem('breakuphtml', this.breakupJsonStatus);

        if (this.breakupJsonStatus && this.iframeElement_test.nativeElement.contentDocument) {
          // Get json data from _break.json (redis)
          this.redisResponseData = await this.http.get(this.appConfig.config.apiURL + "/getRedisJsonData", {
            params: {
              'chapterName': this.projectName + '/' + this.currentChapter.chapter_name
            }
          }).toPromise();
          // End - get json data from _break.json (redis)

          if (this.redisResponseData && this.redisResponseData.status == "success") {
            let responsehead = (this.redisResponseData.data.head).replace(/\\/g, "");
            let responsebody = (this.redisResponseData.data.body).replace(/\\/g, "");
            
            this.iframeElement_test.nativeElement.contentDocument.head.innerHTML = responsehead;
            this.iframeElement_test.nativeElement.contentDocument.body.innerHTML = responsebody;

            this.redisResponseData.data.head = responsehead;
            this.redisResponseData.data.body = responsebody;

            this.html_body_json = this.redisResponseData.data.HtmlJsonData;
            this.page_model.json = this.html_body_json;

            //this.iframeElement.nativeElement.contentDocument.body.innerHTML = 'hello';
            let htmlCollection = [this.iframeElement_test.nativeElement.contentDocument.body][0].children
            this.test_sectionarray = [].slice.call(htmlCollection);
            this.saved_pageno = 0;

          }
        }
        if (callhtml) {
          await this.getHTMLservice(false);
        }
        // if (this.breakupJsonStatus) {
        //   this.dataservice.readbreakuphtmlfile(this.chapterDetails.folder, this.chapterDetails.chapter_name).subscribe((responsehtml) => {
        //     let res = responsehtml.json();
        //     let responsehead = (res.head).replace(/\\/g, "");
        //     let responsebody = (res.body).replace(/\\/g, "");
        //     this.iframeElement_test.nativeElement.contentDocument.head.innerHTML = responsehead;
        //     this.iframeElement_test.nativeElement.contentDocument.body.innerHTML = responsebody;

        //     //this.iframeElement.nativeElement.contentDocument.body.innerHTML = 'hello';
        //     let htmlCollection = [this.iframeElement_test.nativeElement.contentDocument.body][0].children
        //     this.test_sectionarray = [].slice.call(htmlCollection);
        //     this.saved_pageno = 0;
        //   }, error => { });
        // }
      });
    }

    addAttributes(){
      this.contentDoc = this.iframeElement.nativeElement.contentDocument;
      this.createUniqIdHTML();

      let contentEdit;
      localStorage.getItem("editaccess") == '0' ? contentEdit = "false" : contentEdit = "true";

      this.contentDoc.body.setAttribute("contentEditable", contentEdit);
      this.contentDoc.body.setAttribute("data-gramm", false)

      if (this.page_model.sectionCount % 2 == 0)
        this.contentDoc.body.classList.add('pagebreak_spi_even')
      else
        this.contentDoc.body.classList.add('pagebreak_spi_odd')

    }

  
  /*  Add data-uuid to custom json(custom component) and html json */
  /*  Compare custom json and html json (If matches, set "is_component" attribute value true) */
  async customJsonProcessing(){
      for (let i = 0; i < this.jsonArray.length; i++) {
        let obj = Object.keys(this.jsonArray[i])[0];
        await this.generateHtmlTagId(this.jsonArray[i][obj], '', false);
      }

      for (let i = 0; i < this.html_body_json.length; i++) {
        let obj = Object.keys(this.html_body_json[i])[0];
        await this.generateHtmlTagId(this.html_body_json[i][obj], '', false);

        if (this.html_body_json[i][obj].length > 1) {
          await this.checkComponent('parent', this.html_body_json[i][obj], this.jsonArray, '', '');
        }
      }

      this.page_model.json = this.html_body_json;
    }

    /***copy */
    getContentList = function (content, type) {
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

    getProjectDetails = async function (project, resolve) {
      this.project_id = project.id;

      await this.dataservice.getProjectData(project).subscribe(data => {
        let response = JSON.parse(data);

        let extension = response.project_type;
        let folder = response.project_name;
        this.projectName = folder;
        this.dataservice.getTocData(folder, extension).subscribe(toc => {

          this.getContentList(toc, extension).then(val => {

            this.dataservice.getstandard(project, val, folder, extension).subscribe(standard => {
              this.projectstandard = standard.json().standard;
              localStorage.setItem('projectstandard', this.projectstandard);

              this.dataservice.getchapterstatus(project, val, folder, extension).subscribe(tocstatus => {

                localStorage.setItem('tocstatus', JSON.stringify(tocstatus));
                this.chaptersList = tocstatus;
                this.chapterCount = this.chaptersList.length;
                this.dataSource = new MatTableDataSource<PeriodicElement>(this.chaptersList);
                this.dataSource.paginator = this.paginator;
                this.chapterDetails = JSON.parse(localStorage.getItem('chapterDetails'));
                let arr = [],
                  ival;
                // console.log(this.chapterDetails,this.currentChapter);
                if (this.chapterDetails && this.chapterDetails.chapter_name != "" && typeof this.chapterDetails.chapter_name != "undefined") {

                  this.chaptersList.forEach((value, index) => {

                    if (value.chapter_name == this.chapterDetails.chapter_name) {
                      value.select = true;
                      arr = value;
                      ival = this.test_index = index;
                      this.test_toc = value;
                      this.currentChapter = value;
                      if (value.pc_status == 0) {
                        this.chapterDetails = '', this.currentChapter = ''
                        let keyToremove = ["chapterDetails", "tocstatus", "chapterid"];
                        keyToremove.forEach(k => localStorage.removeItem(k));
                        this.onloadChapter();
                      }

                      localStorage.setItem('chapterid', value.pc_id);
                      localStorage.setItem('convert_count', value.convert_count);
                    }
                  });
                  // console.log(this.chapterDetails);
                  this.pdfSrc = this.uploadURL + this.chapterDetails.folder + "/s9ml/" + this.chapterDetails.chapter_name + "/" + this.chapterDetails.chapter_name + ".pdf";
                  //   this.editorservice.sendToc(arr);
                  this.selectedToc = arr;

                  // this.spinner.hide();
                  //   this.showEditor(this.currentChapter,ival);
                } else {
                  let currentChapter = _.where(tocstatus, {
                    'pc_status': 1
                  });
                  if (currentChapter && currentChapter.length) {
                    this.currentChapter = currentChapter[0];

                    this.indexval = ival;
                    // this.spinner.hide();
                    resolve('completed')
                  } else {
                    this.currentChapter = this.chaptersList[0];
                    // alert("Pdf is not available!");
                  }


                  this.currentChapter.select = true;
                  ival = 0;
                  this.pdfSrc = this.uploadURL + this.currentChapter.folder + "/s9ml/" + this.currentChapter.chapter_name + "/" + this.currentChapter.chapter_name + ".pdf";
                  //   this.editorservice.sendToc(this.currentChapter);
                  this.selectedToc = this.currentChapter;
                  // localStorage.setItem('chapterDetails', JSON.stringify(toc));
                  // this.chapterDetails = JSON.parse(localStorage.getItem('chapterDetails'));
                  // console.log(this.currentChapter);
                  localStorage.setItem('chapterDetails', JSON.stringify(this.currentChapter));
                  this.chapterDetails = this.currentChapter;
                  this.previous_chapterDetails = this.chapterDetails;

                  localStorage.setItem('chapterid', this.currentChapter.pc_id);
                  localStorage.setItem('convert_count', this.currentChapter.convert_count);

                  //setTimeout(() => {
                  // this.viewer = false;
                  // this.showEditor(this.currentChapter,ival)
                  //}, 2000);
                  this.indexval = ival;
                  this.spinner.hide();
                  if (currentChapter.length > 0) {
                    resolve('completed')
                  } else {
                    resolve('completed')
                    //tocstatus[0].startPageNumber = 1;
                    //Popup to select page no and poptip in initial chapter
                    //this.changeHtml(this.currentChapter, 0);
                    // this.processpdfservice.generateHtml(tocstatus[0], 0, 1, true, false).subscribe(
                    //  data => {
                    //      this.tocdetails = data;
                    //      // toc.html=true;
                    //      this.getHTMLservice(false);
                    //      // 
                    //  })
                  }
                }

              });
            });
          });
        });


      });
    }

    textFormat(type, status, listType) {
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
        } else if (formatType == "BLOCK") {
          this.actionBlock = status == true ? false : true;
          contentWindow.document.execCommand('formatBlock', false, 'div');
        } else if (formatType == "P") {
          this.actionP = status == true ? false : true;
          contentWindow.document.execCommand('formatBlock', false, 'p');
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

          // this.dialogRef = this.dialog.open(modelDialogComponent,{
          //  height: '200px',
          //  width: '400px',
          //  data: {page:"createlink",createlink:window.location.protocol}
          // });
          //   this.dialogRef.afterClosed().subscribe(result => {
          //  if(result.status == "save"){
          //      this.createlink = result.createlink;
          //      if(this.createlink != ""){
          //          var highlight = contentWindow.getSelection().getRangeAt(0).toString();
          //          contentWindow.document.execCommand('insertHTML', false,'<a href="' + this.createlink + '" target="_blank">' + highlight + '</a>');
          //      }

          //  }

          //   });


        } else if (formatType === 'RIHGTALLIGN') {
          this.rightAllign = status == true ? false : true;
          contentWindow.document.execCommand("JustifyRight", false, "");
        } else if (formatType === 'LEFTALLIGN') {
          this.leftAllign = status == true ? false : true;
          contentWindow.document.execCommand("justifyLeft", false, "");
        } else if (formatType === 'CENTERALLIGN') {
          this.centerAllign = status == true ? false : true;
          contentWindow.document.execCommand("justifyCenter", false, "");
        } else if (formatType === 'FORECOLOR') {
          this.foreColor = status == true ? false : true;
          this.colorPicker = !this.colorPicker;
          // contentWindow.document.execCommand("ForeColor", false, "red");
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
          var closestOl = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.closest('ol');
          if (closestOl && closestOl.tagName.toLowerCase() === 'ol') {
            switch (listType) {
              case 'A':
                {
                  closestOl.setAttribute('style', "list-style-type: upper-alpha");
                  break;
                }
              case 'a':
                {
                  closestOl.setAttribute('style', "list-style-type: lower-alpha");
                  break;
                }
              case '1':
                {
                  closestOl.setAttribute('style', "list-style-type: decimal");
                  break;
                }
            }
          } else {
            if (parentChild == "ol" || parentChild == "ul") {
              var node = document.createElement("LI"); // Create a <li> node
              var textnode = document.createTextNode(highlight); // Create a text node
              node.appendChild(textnode);
              contentWindow.document.execCommand('delete'); // Delete the highlighted text
              contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.appendChild(node);
            } else {
              contentWindow.document.execCommand('insertorderedlist', false, null);
            }
          }
        }
        else if (formatType == "TWOCOLUMN") {

          var closestOl = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer;
          var col_class = "mhhe-pod--eoc-2col-list";

          if (closestOl && closestOl.tagName && (closestOl.tagName.toLowerCase() === 'ol' || closestOl.tagName.toLowerCase() === 'ul')) {

            this.actionTC = status == true ? false : true;

            if (this.actionTC) {
              if (closestOl.classList.contains("mhhe-pod--eoc-3col-list")) {
                closestOl.classList.remove("mhhe-pod--eoc-3col-list");
              }
              closestOl.classList.add(col_class);
              this.actionTHC = false;
            } else {
              closestOl.classList.remove(col_class);
            }
          }
        }
        else if (formatType == "THREECOLUMN") {

          var closestOl = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer;
          var col_class = "mhhe-pod--eoc-3col-list";

          if (closestOl && closestOl.tagName && (closestOl.tagName.toLowerCase() === 'ol' || closestOl.tagName.toLowerCase() === 'ul')) {

            this.actionTHC = status == true ? false : true;

            if (this.actionTHC) {
              if (closestOl.classList.contains("mhhe-pod--eoc-2col-list")) {
                closestOl.classList.remove("mhhe-pod--eoc-2col-list");
              }
              closestOl.classList.add(col_class);
              this.actionTC = false;
            } else {
              closestOl.classList.remove(col_class);
            }
          }
        }
        // else if (formatType == "ORDEREDLISTTYPEA") {
        //  this.actionOl = status == true ? false : true;
        //  var highlight = contentWindow.getSelection().getRangeAt(0).toString();
        //  var parentChild = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.localName;
        //  var closestOl = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.closest('ol');
        //  if(closestOl.tagName.toLowerCase() === 'ol') {
        //      closestOl.setAttribute('style', "list-style-type: lower-alpha")
        //  // if (parentChild == "ol" || parentChild == "ul") {
        //      // closestOl.setAttribute('type', 'A');
        //      // var node = document.createElement("LI"); // Create a <li> node
        //      // var textnode = document.createTextNode(highlight); // Create a text node
        //      // node.appendChild(textnode);
        //      // contentWindow.document.execCommand('delete'); // Delete the highlighted text
        //      // contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.appendChild(node);
        //  } else {
        //      contentWindow.document.execCommand('insertorderedlist', false, null);
        //  }
        // }
        else if (formatType == "UNORDEREDLIST") {
          this.actionUl = status == true ? false : true;
          var highlight = contentWindow.getSelection().getRangeAt(0).toString();
          var parentChild = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.localName;
          if (parentChild == "ol" || parentChild == "ul") {
            var node = document.createElement("LI"); // Create a <li> node
            var textnode = document.createTextNode(highlight); // Create a text node
            node.appendChild(textnode);
            contentWindow.document.execCommand('delete'); // Delete the highlighted text
            contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.offsetParent.appendChild(node);

          } else {
            contentWindow.document.execCommand('insertUnorderedList', false, null);
          }
        } else if (formatType == "INSERTHTML") {
          var highlight = contentWindow.getSelection().getRangeAt(0).toString();
          var lengthHighlight = contentWindow.getSelection().getRangeAt(0).commonAncestorContainer.parentNode.attributes;

          if (lengthHighlight.length == 1 && (lengthHighlight[0].ownerElement.localName == "span" && lengthHighlight[0].ownerElement.className == "page-break")) {
            contentWindow.document.execCommand('insertHTML', false, '<span>' + highlight + '</span>');
          } else {
            contentWindow.document.execCommand('insertHTML', false, '<span class="page-break">' + highlight + '</span>');
          }

          this.actionPageBreak = status == true ? false : true;
        } else if (formatType == "STYLE") {
          this.actionStyle = status == true ? false : true;
          document.getElementById('styleEditor').style.display = 'inline';
        } else if (formatType == "FLOATLEFT") {
          this.actionfloatLeft = status == true ? false : true;
          if (this.actionfloatLeft) {
            this.lineheightElement.style.cssText = 'letter-spacing:' + this.letterspace + 'px !important;float:left !important';
            //this.lineheightElement.setAttribute('style', "float:left !important");
            this.actionfloatRight = false;
          } else {
            this.lineheightElement.style.removeProperty('float');
            this.lineheightElement.style.cssText = 'letter-spacing:' + this.letterspace + 'px !important';
          }



        } else if (formatType == "FLOATRIGHT") {
          this.actionfloatRight = status == true ? false : true;

          if (this.actionfloatRight) {
            this.lineheightElement.style.cssText = 'letter-spacing:' + this.letterspace + 'px !important;float:right !important';
            this.actionfloatLeft = false;
          } else {
            this.lineheightElement.style.removeProperty('float');
            this.lineheightElement.style.cssText = 'letter-spacing:' + this.letterspace + 'px !important';
          }

        }

      }
    }

    handleColor = ($event: ColorEvent) => {
      const contentWindow = this.iframeElement.nativeElement.contentWindow;
      if (contentWindow.getSelection) {
        contentWindow.document.execCommand("ForeColor", false, $event.color.hex);
        this.colorPicker = true;
      }
    }

    poptipOpen() {
      return new Promise(resolve => {
        this.modalService.open(ModalboxComponent, {
          backdrop: 'static'
        }).result.then((result) => {
          resolve(result)
        }, (reason) => {
          console.log(reason);
          //newly added
          this.chapterDetails = '', this.currentChapter = ''
          let keyToremove = ["chapterDetails", "tocstatus", "chapterid"];
          keyToremove.forEach(k =>
            localStorage.removeItem(k));
          resolve(`data`);
          console.log(`Dismissed `);

        });
        //resolve('')
        //   setTimeout(() => resolve(this.pop_tip), 3000);
      })
    }

    onloadChapter() {
      this.spinner.show();
      let promise: any = '';
      this.activatedRoute.params.subscribe(params => {
        if (localStorage.getItem('tocstatus') && localStorage.getItem('chapterid')) {

          this.chaptersList = JSON.parse(localStorage.getItem('tocstatus'));
          let currentChapterid = localStorage.getItem('chapterid');
          /*this.currentChapter = _.where(this.chaptersList, {
              'pc_id': Number(currentChapterid)
          })[0];*/
          this.currentChapter = _.where(this.chaptersList, {
            'pc_id': (currentChapterid)
          })[0];
          // this.chapterDetails=this.currentChapter;
          this.currentChapter = this.currentChapter ? this.currentChapter : [];
          localStorage.setItem('chapterDetails', JSON.stringify(this.currentChapter));
          this.previous_chapterDetails = this.currentChapter;

          this.projectName = this.chaptersList[0].folder;
          this.chapterCount = this.chaptersList.length;
          this.currentChapter['select'] = true;
          // console.log("chapterDetails",this.chapterDetails);
          promise = new Promise((resolve, reject) => {
            this.getProjectDetails(params, resolve);
          })

          this.getHTMLservice(false);

          // this.getHTMLservice(false);
          //  promise = new Promise((resolve, reject) => {
          //  resolve('completed')
          // })
          // console.log(this.chaptersList.indexOf( 'chapter01'));
        } else {
          promise = new Promise((resolve, reject) => {
            this.getProjectDetails(params, resolve);
          })
        }

      });

      this.activatedRoute.url.subscribe(urlsegments => {
        urlsegments.forEach(segment => {
          this.routerSegments.push(segment.path);
        });
      });

      this.page_model.sectionCount = 0,
        promise.then((data) => {
          //this.getHTMLservice(false);
        })

      this.editorDomService.test_subject.subscribe((data) => {
        this.nodeToDelete = data;
      })

      this.editorDomService.list_subject.subscribe((data) => {
        this.isTypeList = data;
      })

      this.editorDomService.subject.subscribe((data) => {
        this.page_model.sectionArray = data.sectionArray;
        this.page_model.iframeBody = data.iframeBody,
          this.page_model.sectionCount = data.sectionCount,
          this.page_model.json = data.json;
        this.page_model.isRecursive = data.isRecursive

        if (this.page_model.isRecursive) {
          let section = this.renderer.createElement('section');
          this.renderer.setAttribute(section, 'id', 'section_' + this.page_model.sectionCount);
          // if(this.page_model.sectionCount != 0){
          //   this.renderer.setAttribute(section, 'style', 'page-break-before: always');
          // }
          this.renderer.addClass(section, 'dynamicSection');
          section.innerHTML = this.page_model.iframeBody.innerHTML;
          this.page_model.sectionArray.push(section);
          this.createUniqIdHTML()
        }

      })
      var pagesize = localStorage.getItem('pagesize');
      if (pagesize) {
        (document.querySelector('#editableFrame') as HTMLElement).style.width = pagesize.split(',')[0] + 'in';
        (document.querySelector('#editableFrame') as HTMLElement).style.height = pagesize.split(',')[1] + 'in';
        (document.querySelector('#editableFrame_test') as HTMLElement).style.width = pagesize.split(',')[0] + 'in';
        (document.querySelector('#editableFrame_test') as HTMLElement).style.height = pagesize.split(',')[1] + 'in';
        (document.querySelector('.viewer-part') as HTMLElement).style.width = (((parseFloat(pagesize.split(',')[0])) + 1).toString()) + 'in';
        (document.querySelector('.viewer-part') as HTMLElement).style.height = (((parseFloat(pagesize.split(',')[1])) + 1).toString()) + 'in';
        (document.querySelector('#hiddenfinalhtml') as HTMLElement).style.height = pagesize.split(',')[1] + 'in';
        let pwidth = (document.querySelector('#view-container') as HTMLElement).offsetWidth;
        (document.querySelector('#hiddenfinalhtml') as HTMLElement).style.width = pwidth + 'px';
      }
    }
    headerValue() {
      var ischapter;
      var chaptNum;
      var allTags = this.iframeElement_test.nativeElement.contentDocument
      if (allTags != '' && allTags != null) {
        var headertags = allTags.getElementsByTagName('header');
        var styles = ["color", "font-family", "font-size", "line-height", "white-space", "padding", "display", "float", "border", "border-top", "border-right", "border-bottom", "border-left", "border-color", "border-width", "border-style", "padding-top", "padding-right", "padding-bottom", "padding-left", "width", "height", "font-weight", "margin-top", "margin-left", "margin-bottom", "margin-right", "text-decoration", "background-color", "background-image", "font-style", "position", "text-align", "vertical-align", "top", "left", "bottom", "right", "word-wrap"];
        var setchpno = false;

        for (var cn = 0; cn < headertags.length; cn++) {

          if (headertags[cn].getElementsByClassName("chapter-number").length > 0) {
            ischapter = headertags[cn].getElementsByClassName("chapter-number");
          } else if (headertags[cn].getElementsByClassName("number").length > 0) {
            ischapter = headertags[cn].getElementsByClassName("number");
          } else if (headertags[cn].getElementsByClassName("mhhe-chapter_opener-chapter_number").length > 0) {
            ischapter = headertags[cn].getElementsByClassName("mhhe-chapter_opener-chapter_number");
          } else if (allTags.getElementsByClassName("mhhe-chapter_opener-chapter_number").length > 0) {
            chaptNum = allTags.getElementsByClassName("mhhe-chapter_opener-chapter_number");
            ischapter = chaptNum[0].getElementsByClassName("mhhe-chapter_opener-chapter_number");
          }


          if (ischapter) {
            for (var hc = 0; hc < ischapter.length; hc++) {
              var cn_html = ischapter[hc].innerHTML.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase();
              if (cn_html.indexOf('part') === -1) {
                var txt = 'Chapter';
                var cp_class = 'chp-no';
              } else {
                var txt = 'Part';
                var cp_class = 'part-no';
              }
              cn_html = cn_html.replace(txt, '').replace(/:/g, '');//.replace(/\s/g, '')

              if (headertags[cn].getElementsByClassName("mhhe-chapter_opener-chapter_title").length > 0) {
                ischapter = headertags[cn].getElementsByClassName("mhhe-chapter_opener-chapter_title");
                var cnew_html = ischapter[hc].innerHTML.replace(/<\/?[^>]+(>|$)/g, "");
              }

              if (headertags[cn]) {
                this.chapterinfo = cn_html + ': ' + cnew_html;
                setchpno = true;
              }

            }
          }

          if (setchpno == true) {
            break;
          }
        }
      } else {
        this.chapterinfo = "";
        ischapter = "";
      }
      return true;
    }

    editorClose = () => {
      this.eventArrayHandler();
      let editorSlide = document.getElementById("editor_newframe");
      if (editorSlide) {
        editorSlide.style.display = 'none';
      }

    }
    editorCloseTable = () => {
      this.eventArrayHandler();
      let editorTableSlide = document.getElementById("editor_newframe_table");
      if (editorTableSlide) {
        editorTableSlide.style.display = 'none';
      }
    }

    editorCloseImage = () => {
      this.eventArrayHandler();
      let editorImageSlide = document.getElementById("editor_newframe_image");
      if (editorImageSlide) {
        editorImageSlide.style.display = 'none';
      }
    }

    editorCloseMath = () => {
      this.eventArrayHandler();
      let output = document.getElementById('matheditor_output');
      output.innerHTML = '';
      let editorSlidemath = document.getElementById("matheditor_container");
      if (editorSlidemath) {
        editorSlidemath.style.display = 'none';
      }
    }
    eventArrayHandler = () => {
      this.editorDomService.eventArray && this.editorDomService.eventArray.map((elem) => {
        if (elem && elem.target) {
          elem.target.style.border = "";
          elem.target.style.boxShadow = "";
          elem.target.style.padding = ""
          elem.target.style.borderRadius = ""
        }
        if (elem && elem.target && elem.target.parentNode && elem.target.parentNode.style) {
          elem.target.parentNode.style.border = "";
          elem.target.parentNode.style.boxShadow = "";
          elem.target.parentNode.style.padding = ""
          elem.target.parentNode.style.borderRadius = ""
        }
        if (elem && elem.target && elem.target.parentNode && elem.target.parentNode.parentNode && elem.target.parentNode.parentNode.style) {
          elem.target.parentNode.parentNode.style.border = "";
          elem.target.parentNode.parentNode.style.border = "";
          elem.target.parentNode.parentNode.style.boxShadow = "";
          elem.target.parentNode.parentNode.style.padding = ""
          elem.target.parentNode.parentNode.style.borderRadius = ""
        }
      })
    }

    changeCellWidth(event) {
      this.cell.style.width = event + '%';
    }

    changeImageSize(event) {
      this.img_style.style.cssText = 'width:' + event + 'px !important; margin-left:' + this.imagemargin_l + 'px !important; margin-right:' + this.imagemargin_r + 'px !important; margin-top:' + this.imagemargin_t + 'px !important; margin-bottom:' + this.imagemargin_b + 'px !important; border: 2px solid rgb(31, 207, 20); padding:' + this.imagepadding + 'px !important';
    }

    changeImagePadding(event) {
      this.img_style.style.cssText = 'width:' + this.imagesize + 'px !important; border: 2px solid rgb(31, 207, 20); padding:' + event + 'px !important; margin-left:' + this.imagemargin_l + 'px !important; margin-right:' + this.imagemargin_r + 'px !important; margin-top:' + this.imagemargin_t + 'px !important; margin-bottom:' + this.imagemargin_b + 'px !important';
    }

    changeImageMarginLeft(event) {
      this.img_style.style.cssText = 'width:' + this.imagesize + 'px !important; border: 2px solid rgb(31, 207, 20); padding:' + this.imagepadding + 'px !important; margin-left:' + event + 'px !important; margin-right:' + this.imagemargin_r + 'px !important; margin-top:' + this.imagemargin_t + 'px !important; margin-bottom:' + this.imagemargin_b + 'px !important';
    }
    changeImageMarginRight(event) {
      this.img_style.style.cssText = 'width:' + this.imagesize + 'px !important; border: 2px solid rgb(31, 207, 20); padding:' + this.imagepadding + 'px !important; margin-left:' + this.imagemargin_l + 'px !important; margin-right:' + event + 'px !important; margin-top:' + this.imagemargin_t + 'px !important; margin-bottom:' + this.imagemargin_b + 'px !important';
    }
    changeImageMarginTop(event) {
      this.img_style.style.cssText = 'width:' + this.imagesize + 'px !important; border: 2px solid rgb(31, 207, 20); padding:' + this.imagepadding + 'px !important; margin-left:' + this.imagemargin_l + 'px !important; margin-right:' + this.imagemargin_r + 'px !important; margin-top:' + event + 'px !important; margin-bottom:' + this.imagemargin_b + 'px !important';
    }
    changeImageMarginBottom(event) {
      this.img_style.style.cssText = 'width:' + this.imagesize + 'px !important; border: 2px solid rgb(31, 207, 20); padding:' + this.imagepadding + 'px !important; margin-left:' + this.imagemargin_l + 'px !important; margin-right:' + this.imagemargin_r + 'px !important; margin-top:' + this.imagemargin_t + 'px !important; margin-bottom:' + event + 'px !important';
    }

    changeLineHeight(event) {
      //this.lineheightElement.style.lineHeight  = event;
      this.lineheightElement.style.setProperty('line-height', event, 'important');
      this.cdRef.detectChanges();
    }
    changeFontSize(event) {
      this.lineheightElement.style.cssText = 'font-size:' + event + 'px !important';
      //this.lineheightElement.style.lineHeight  = this.lineheight;
      this.lineheightElement.style.setProperty('line-height', this.lineheight, 'important');
    }
    changeletterspace(event) {
      this.lineheightElement.style.cssText = 'letter-spacing:' + event + 'px !important';
      //this.lineheightElement.style.lineHeight  = this.lineheight;
      //this.lineheightElement.style.setProperty('line-height', this.lineheight, 'important');
    }
    editmath() {
      this.matherrormsg = '';
    }
    changeMathpadding(event, type) {
      let renderele = Array.from(document.querySelectorAll<HTMLElement>('#matheditor_output .MathJax'));
      if (renderele) {
        let resetvalue = 0;
        if (event > 15) {
          resetvalue = 15;
        } else if (event < -15) {
          resetvalue = -15;
        }
        if (resetvalue != 0) {
          if (type == 1) {
            this.mathpaddingTop = resetvalue;
          } else if (type == 2) {
            this.mathpaddingRight = resetvalue;
          } else if (type == 3) {
            this.mathpaddingBottom = resetvalue;
          } else if (type == 4) {
            this.mathpaddingLeft = resetvalue;
          }
        }
        renderele[0].style.cssText = 'margin:' + this.mathpaddingTop + 'px ' + this.mathpaddingRight + 'px ' + this.mathpaddingBottom + 'px ' + this.mathpaddingLeft + 'px !important;'
      }
      this.cdRef.detectChanges();
    }

    render_math() {
      this.matherrormsg = '';
      let input = (this.mathinput).trim();
      if (input.startsWith("<math") && input.endsWith("</math>") && (input.match(/<math/g) || []).length == 1) {
        let output = document.getElementById('matheditor_output');
        output.innerHTML = '';
        output.appendChild(MathJax.mathml2svg(input));
        MathJax.startup.document.clear();
        MathJax.startup.document.updateDocument();
        this.enableSave = false;
        let renderele = Array.from(document.querySelectorAll<HTMLElement>('#matheditor_output mjx-container'));
        renderele[0].style.cssText = 'margin:' + this.mathpaddingTop + 'px ' + this.mathpaddingRight + 'px ' + this.mathpaddingBottom + 'px ' + this.mathpaddingLeft + 'px !important;';
        this.cdRef.detectChanges();
      } else {
        this.matherrormsg = 'Invalid MathML !';
      }
    }

    save_math() {
      this.enableSave = true;
      let targetnode = this.targetnode;
      targetnode.replaceWith(document.getElementById('matheditor_output').childNodes[0]);
      this.editorCloseMath();
    }

    checkpageno(e) {
      if (this.jumppage > 0 && this.jumppage <= this.page_model.sectionArray.length) {
        this.checkgo = false;
      } else {
        this.checkgo = true;
      }
    }
    checkpagenoGo(e) {
      if (e.keyCode == 13) {
        this.checkpageno(e);
        this.pageNavigation('gopage');
      }
    }

    changetablesize(iframeid) {
      /*let iframe  = document.getElementById(iframeid);
      if(iframe) {
          let contentdocument = ( < HTMLIFrameElement > iframe).contentDocument;
        let tablelist = contentdocument.querySelectorAll('table');
        if(tablelist.length > 0) {
           for(let i=0; i< tablelist.length; i++){
            let curwidth:any = window.getComputedStyle(tablelist[i], null).getPropertyValue("width");
            curwidth = parseFloat(curwidth.split('px')[0]);
            if(curwidth > 710) {
              var differencewidth = curwidth - 710;
              var scaleper = (differencewidth * 100) / curwidth;
              var scaleval = (1/100)*scaleper;
              scaleval = 1-scaleval;
             // tablelist[i].style.transform = 'translate(-'+(scaleper/2)+'%,-'+(scaleper/2)+'%) scale('+scaleval+')';
              tablelist[i].style.transform = 'rotate(270deg)';
            }
              }
        }
      }*/
      /*let iframe  = document.getElementById(iframeid);
      if(iframe) {
          let contentdocument = ( < HTMLIFrameElement > iframe).contentDocument;
        let tablelist = contentdocument.querySelectorAll('table');
        if(tablelist.length > 0) {
           for(let i=0; i< tablelist.length; i++){
             let curwidth:any = window.getComputedStyle(tablelist[i], null).getPropertyValue("width");
             console.log(curwidth);
           }
        }
      }*/
    }

    changeTableFontSize(event, type) {
      /*let editableFrame  = document.getElementById("editableFrame");
     let contentdocument = (<HTMLIFrameElement> editableFrame).contentDocument;
     if((contentdocument.getElementsByTagName('head')[0].innerHTML).indexOf('id="customTable"') < 0) {
         let tablestyle = document.createElement("style");
         tablestyle.id = "customTable";
         contentdocument.getElementsByTagName('head')[0].append(tablestyle);
     }
      let size = parseFloat(window.getComputedStyle(this.cell, null).getPropertyValue("font-size"));  
      let tableElement = this.cell.closest('TABLE');
      let tableid = tableElement.attributes.id.value;
      if(type == 0) { 
          tableElement.style.cssText +=  'font-size:'+(size+1)+'px !important';   
          size = size+1;
      } else {    
          tableElement.style.cssText += 'font-size:'+(size-1)+'px !important';    
          size = size-1;
      }   
      let changeinstyle = '#'+tableid+' *{font-size: '+size+'px !important}'; 
      (contentdocument.getElementsByTagName('head')[0]).children.customTable.innerHTML += changeinstyle;*/

      let size = parseFloat(window.getComputedStyle(this.cell, null).getPropertyValue("font-size"));
      if (type == 0) {
        console.log((size + 1) + 'px');
        this.cell.style.cssText += 'font-size:' + (size + 1) + 'px !important';
      } else {
        console.log((size - 1) + 'px');
        this.cell.style.cssText += 'font-size:' + (size - 1) + 'px !important';
      }
    }

    alignText(event, type) {
      console.log(event)
      if (type == 0) {
        this.cell.style.cssText += 'text-align:left !important';
      } else if (type == 1) {
        this.cell.style.cssText += 'text-align:right !important';
      }
    }

    showViewer(toc, i) {
      this.showMattable = false;
      this.showPreview = false;
      localStorage.setItem('viewer', 'true');
      this.startPageNumber = toc.startPageNumber;
      this.changeHtml_test(toc, i);

    }

    // removeMediaAttribute() {
    //   let content: any = document.getElementById('editableFrame');
    //   if (content) {
    //     content = content.contentDocument.head;
    //     for (let i = 0; i < content.children.length; i++) {
    //       let name = content.children[i].nodeName.toLowerCase();
    //       let isExist = content.children[i].href ? (content.children[i].href).includes('dpg-custom.css') : false;
    //       if (name == 'link' && isExist) {
    //         content.children[i].removeAttribute('media');
    //       }
    //     }
    //   }
    // }

    // Json form data
    jsonFormSubmit(data) {
      console.log(data.value);
    }

  async chapterlist() {
      this.showMattable = true;
      this.showPreview = false;
      this.isUserEdit = false;
      // document.getElementById('editableFrame').className = "restrictUser";
      document.getElementById('editableFrame').classList.add("restrictUser");
      document.getElementById('editableFrame').classList.add("page-odd");

      localStorage.setItem('viewer', 'false');
      this.activatedRoute.params.subscribe(params => {
        this.getprojectchapters(params);
      });
    }
    downloadPdf(toc) {
      let std = localStorage.getItem('projectstandard');
      let url = '';
      if(std && std == 'ETS'){
          url = this.APIUrl+'/'+this.uploadURL+'/'+toc.folder+'/s9ml/'+toc.chapter_name+'/'+toc.chapter_name+'.pdf';
      }
      else{
          url = this.APIUrl+'/'+this.uploadURL+localStorage.getItem('projectstandard')+'/'+toc.folder+'/s9ml/'+toc.chapter_name+'/'+toc.chapter_name+'.pdf';
      }
      url = url.replace('./', '');

      // console.log("apirurl loaded as ->  ", this.appConfig.config);
      // var url = this.uploadURL + localStorage.getItem('projectstandard') + '/' + toc.folder + '/s9ml/' + toc.chapter_name + '/' + toc.chapter_name + '.pdf';
      window.open(url);
    }
    generateHtmlpage(toc, index) {
      
      if(this.optStandard != 'ETS'){
        this.page_number = (document.getElementById('s_page_number' + index) as HTMLInputElement).value;
        this.pop_tips = (document.getElementById('s_poptips' + index) as HTMLInputElement).checked;
        this.two_column = (document.getElementById('s_twocolumn' + index) as HTMLInputElement).checked;
      }
      else{
        this.page_number = 1;
      }

      if (this.page_number > 0) {
        var self = this;
        toc.enlargeHtml = true;
        this.createFile(toc, index, toc.startPageNumber, 'html', this.pop_tips, this.two_column).then(function (resolvestatus) {
          if (resolvestatus) {
            toc.pc_status = '1';
          }
        });
      } else {
        alert('Start Page Number field is required!!' + index);
        (document.getElementById('s_page_number' + index) as HTMLInputElement).focus();
        return false;
      }
    }
    createFile(toc, index, page, filetype, pop_tips = false, two_column = false) {
      var self = this;
      let promise = new Promise(function (resolve, reject) {
        if (filetype == 'html') {
          self.startPageNumber = toc.startPageNumber;
          self.dataservice.savestartpage(toc.folder, toc.chapter_name, toc.startPageNumber).subscribe((res) => { }, error => { });
          self.processpdfservice.generateHtml(toc, index, page, pop_tips, two_column);
        } else {
          self.processpdfservice.generatePDF(toc, index);
        }
        resolve(true);
      });
      return promise;
    }
    pageNumNav(nav, toc) {
      if (nav == 0) {
        if (toc.startPageNumber == 0 || !toc.startPageNumber || toc.html) {
          return false;
        }
        toc.startPageNumber -= 1;
      } else {
        if (toc.html) {
          return false;
        }
        if (toc.startPageNumber) {
          toc.startPageNumber += 1;
        } else {
          toc.startPageNumber = 1;
        }

      }
    }
  }
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}