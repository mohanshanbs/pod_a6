import {
    Component,
    OnInit,
    Input
} from '@angular/core';
import {
    HttpHeaders
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
import $ from 'jquery';
import {
    AppConfig
} from '../app-config';
import {
    constantValues
} from '../constants';
import { Router, NavigationEnd, ActivatedRoute,NavigationExtras,NavigationStart } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { icmlcompute } from './icmlcompute';
import { environment } from '../../environments/environment';
@Component({
    selector: 'app-icml-conversion-process',
  templateUrl: './icml-conversion-process.component.html',
  styleUrls: ['./icml-conversion-process.component.scss']
})
export class IcmlConversionProcessComponent implements OnInit {
    APIUrl;
    HOSTUrl;
    chaptername;
    pageName;
    windowLocation;
    folderpath;
    classarray = [];
    csscolorarr = [];
    constants;
    constructor(private http: Http, public appConfig: AppConfig, private activatedRoute: ActivatedRoute, private spinner: NgxSpinnerService,private router: Router,
               private icmlcompute: icmlcompute) {
        this.constants = constantValues;
        this.APIUrl = appConfig.config.apiURL;
        this.HOSTUrl = appConfig.config.hostURL;
    }
    convertInfo: boolean = true;
    icml_file_link;
    ngOnInit() {
        this.activatedRoute.params.subscribe(params => {
            let paramvalue = params.chapter.split('&');
   			this.pageName = paramvalue[1];
   			this.chaptername = paramvalue[0];
  		});
        let hostname = environment.pod_port;
        this.windowLocation = window.location.origin;
        this.folderpath = window.location.protocol + hostname + "/icml_css_1/";
    }

    convert() {
        this.spinner.show();
        this.readtoc();
        this.getcss();
    }

    resolveAfter2Seconds() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('');
            }, 1000);
        });
    }
    backtohome() {
        this.router.navigate(['/projectslist']);
    }
    readtoc() {
        let chapterArray = [];
        let pageArray = [];
        let formToc = '';
        let tocpatharr = [];
        let chaptername = this.chaptername;
        let url = this.APIUrl + "/readtoc";
        this.http.post(url, {}).
        subscribe(function (data) {
            $('.hiddentoc').html(data.text());
            let outerChapter = $('.hiddentoc').find('nav ol')[0].innerHTML;
            $('.hiddentoc').html(outerChapter);
            $('.hiddentoc>li').each(function (i, e) {
                pageArray = [];
                $(e).find('>ol >li').each(function (i, e) {
                    let pagearr = ($(e).find('>a').attr('href').split('.')[0]).split('/');
                    pageArray.push(pagearr[pagearr.length - 1]);
                    if ($(e).find('>a').attr('href').split('/')[1] === chaptername) {
                        tocpatharr.push(pagearr[pagearr.length - 1] + '.html')
                    }
                });
                chapterArray.push({
                    'chapter': ($(e).find('>a').attr('href').split('/')[1]),
                    'page': pageArray,
                    'chaptertitle': $(e).find('>a').text()
                })

            });
            formToc = '<unit>';
            $.each(chapterArray, function (i, ele) {
                formToc += '<chapter enumeration="' + (i + 1) + '""><title>' + ele.chaptertitle + '</title>';
                $.each(ele.page, function (i, iele) {
                    formToc += '<exhibit path="' + ele.chapter + '/' + iele + '.html' + '"/>'
                });
                formToc += '</chapter>';
            });
            formToc += '</unit>';
            $('.hiddentoc').html(formToc);
        });
    }

    async getcss() {
        let url = this.APIUrl + "/readcss";
        this.http.post(url, {}).
        subscribe((result: any) => {
            let data = result.json();
            let cssList = data.cssList;
            let directory = window.location.protocol +'//'+ environment.pod_port + '/icml_css_1/files/css/';
            for (let i = 0; i < cssList.length; i++) {
                let linkcontainer = '<link type="text/css" rel="stylesheet" title="default" href="' + directory + cssList[i] + '" />';
                $('.hiddenelement').append(linkcontainer);
            }
        });
        await this.resolveAfter2Seconds();
        this.gethtml();
    }

    gethtml() {
        let url = this.APIUrl + "/readhtml";
        this.http.post(url, {}).
        subscribe((result: any) => {
            let data = result.json();
            let htmlList = data.htmlList;
            let callnextstep = false;
            for (let i = 0; i < htmlList.length; i++) {
                if (i === htmlList.length - 1) {
                    callnextstep = true;
                } else {
                    callnextstep = false;
                }
                this.htmlfn(htmlList[i], callnextstep);
            }
        });
    }

    htmlfn(arg, callnextstep) {
        let url = this.APIUrl + "/readhtmlfile";
        let bodycontainer = '';
        this.http.post(url, {
            filename: arg
        }).subscribe((data: any) => {
            let result = data.text();
            let $dom = $(document.createElement("html"));
            $dom[0].innerHTML = result; // Here's where the "magic" happens
            let $body = $dom.find("body");
            let clss = $body.attr('class');
            let strcs = $dom.find("title").html();
            strcs = (strcs) ? strcs.toLowerCase() : '';

            if (clss) {
                let lencls = $body.attr('class').length + (15);
                let adddiv = '<div class="' + clss + '">';
                $body.removeClass(clss);
                if (strcs == 'key terms') {
                    let oddval = "<tr style='border: none;background-color: #e2e7eb;'>";
                    let i = 1;
                    $body.find("p").each(function (index, value) {
                        if (value) {
                            let $value = $(value),
                                textIndex = index,
                                text = $value.html(),
                                textWidth = $value.width();
                            oddval += "<td style='border: none;background-color: #e2e7eb;padding:10px;'>" + text + "</td>";
                            let len = $body.find("p").length;
                            if (i % 2 == 0 && len != i) {
                                oddval += "</tr><tr style='border: none;background-color: #e2e7eb;'>";
                            } else if (i % 2 == 0 && len == i) {
                                oddval += "</tr>";
                            }
                            $body.find("p").addClass('inactive');
                        }
                        i++;
                    });

                    $body.find('.inactive').remove();

                    let html = "<table style='background-color: #e2e7eb;'>";
                    html += oddval;
                    html += "</table>";

                    $body.find('section').append(html);
                    bodycontainer = $body.html();
                } else {
                    bodycontainer = $body.html();
                }

                $('.hiddenelement').append(adddiv + bodycontainer + '</div>');

            } else {
                if (strcs == 'key terms') {
                    let bodycontainer = '';
                    let oddval = "<tr style='border: none;background-color: #e2e7eb;'>";
                    let i = 1;
                    $body.find("p").each(function (index, value) {
                        if (value) {
                            let $value = $(value),
                                textIndex = index,
                                text = $value.html(),
                                textWidth = $value.width();
                            oddval += "<td style='border: none;background-color: #e2e7eb;padding:10px;'>" + text + "</td>";

                            let len = $body.find("p").length;
                            if (i % 2 == 0 && len != i) {
                                oddval += "</tr><tr style='border: none;background-color: #e2e7eb;'>";
                            } else if (i % 2 == 0 && len == i) {
                                oddval += "</tr>";
                            }

                            $body.find("p").addClass('inactive');
                        }
                        i++;
                    });

                    $body.find('.inactive').remove();

                    let html = "<table style='background-color: #e2e7eb;'>";
                    html += oddval;
                    html += "</table>";
                    $body.find('section').append(html);
                     bodycontainer = $body.html();
                } else {
                     bodycontainer = $body.html();
                }
                $('.hiddenelement').append(bodycontainer);
            }


            let result1 = $('.hiddenelement').html();
            let res = this.replaceAll(result1, '></', '></');
            $('.hiddenelement').html(res);
            if (callnextstep) {
                this.stepimg();
            }
        });
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    replaceAll(str, term, replacement) {
        return str.replace(new RegExp(this.escapeRegExp(term), 'g'), replacement);
    }

    async stepimg() {
        let folderpath = this.folderpath;
        $('.hiddenelement img').each(function (i, e) {
            let source = $(e).attr('src').split('/')
            let sourceimg = source[source.length - 1];
            $(e).attr('src', folderpath + 'files/uploadImage/' + sourceimg);
        });
        await this.resolveAfter2Seconds();
        this.submiticml();
    }

    async submiticml() {
        let classarray = [];
        let tabletext = '';
        let tableindex = 0;
        let styleelement = $('<RootCharacterStyleGroup Self="u78"></RootCharacterStyleGroup>');
        let parenttag = [];
        let cssprop = [];
        let cbg = "";
        let m:any;

        let computeol = (element, i) => {
           let ele = $(element)[0].childNodes[i];
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    let pclassnew:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "",
                        bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }
                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }
          return {
            tagname : tagname,
            dataheight : dataheight,
            ele : ele,
            fincls : fincls,
            pclassnew : pclassnew,
            bgclr : bgclr
          }

        }
        
        let computeimg = (element, i, callindex, pclass, index, chvt, childrenelement) => {
           let ele = $(element)[0].childNodes[i];
                    let imgsrc = $(ele).attr('src');
                    let imgname = $(ele).attr('src').split('/')[$(ele).attr('src').split('/').length-1] 
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    let pclassnew:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    if (pclass) {
                        let finarrp = $.inArray(pclass + " " + fincls, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclass + " " + fincls);
                        }
                    }
                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "", datawidth = "", bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height", "width"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }

                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'width') {
                            datawidth = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }

                    }
                    let pw: number = 0;
                    let createdelement:any;
                    let subchildrenelement:any;
                    let brv:any;
                    let iiw:any;
                    let dh: number = parseInt(dataheight.replace("px", ""));
                    let dw: number = parseInt(datawidth.replace("px", ""));
                    let ih: number = (dh * 0.5);
                    if(callindex == 1) {
                      iiw = (dw / 100) * (chvt / 100);
                      subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight, childrenelement, pclassnew, '');
                      createdelement = $('<CharacterStyleRange AppliedCharacterStyle="CharacterStyle/No character style]"></CharacterStyleRange>');
                      subchildrenelement.append(createdelement);
                      if (pclass) {
                        let bclass = pclass.search("one-quarter-block");
                        let bclass2 = pclass.search("half-block");
                        let bclass3 = pclass.search("three-quarters-block");
                      }
                      brv = this.heightcal(ih, 7);
                      if (iiw > 236) {
                        iiw = 236;
                        pw = iiw + (50);
                      } else {
                        iiw = iiw;
                        pw = iiw + (50);
                      }
                    } else if (callindex == 2) {
                      let pv2: number = chvt / dw;
                      let iw: number = 720 / pv2;
                      iiw = iw * 0.75;
                      brv = "";
                    } else if (callindex == 3 || callindex == 4) {
                       iiw = (dw * 0.75);
                       subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight, childrenelement, pclassnew, '');
                       createdelement = $('<CharacterStyleRange AppliedCharacterStyle="CharacterStyle/No character style]"></CharacterStyleRange>');
                       subchildrenelement.append(createdelement);
                       if (pclass) {
                         let bclass = pclass.search("one-quarter-block");
                         let bclass2 = pclass.search("half-block");
                         let bclass3 = pclass.search("three-quarters-block");
                       }
                      brv = this.heightcal(ih, 7);
                       if (iiw > 236) {
                         iiw = 236;
                         pw = iiw + (50);
                       } else {
                         iiw = iiw;
                         pw = iiw + (50);
                       }
                    }
                    let rectangle = $('<Rectangle Self="u3ac" ContentType="GraphicType" StoryTitle="$ID/" ParentInterfaceChangeCount="" TargetInterfaceChangeCount="" LastUpdatedInterfaceChangeCount="" OverriddenPageItemProps="" HorizontalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" VerticalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" GradientFillStart="0 0" GradientFillLength="0" GradientFillAngle="0" GradientStrokeStart="0 0" GradientStrokeLength="0" GradientStrokeAngle="0" Locked="false" LocalDisplaySetting="Default" GradientFillHiliteLength="0" GradientFillHiliteAngle="0" GradientStrokeHiliteLength="0" GradientStrokeHiliteAngle="0" AppliedObjectStyle="ObjectStyle/$ID/[None]" Visible="true" Name="$ID/" ItemTransform="1 0 0 1 0 1">' +
                        '<Properties>' +
                        '<PathGeometry>' +
                        '<GeometryPathType PathOpen="false">' +
                        '<PathPointArray>' +
                        '<PathPointType Anchor="-' + iiw + ' -' + ih / 2 + '" LeftDirection="-' + iiw + ' -' + ih / 2 + '" RightDirection="-' + iiw + ' -' + ih / 2 + '" />' +
                        '<PathPointType Anchor="-' + iiw + ' ' + ih / 2 + '" LeftDirection="-' + iiw + ' ' + ih / 2 + '" RightDirection="-' + iiw + ' ' + ih / 2 + '" />' +
                        '<PathPointType Anchor="' + pw + ' ' + ih / 2 + '" LeftDirection="' + pw + ' ' + ih / 2 + '" RightDirection="' + pw + ' ' + ih / 2 + '" />' +
                        '<PathPointType Anchor="' + pw + ' -' + ih / 2 + '" LeftDirection="' + pw + ' -' + ih / 2 + '" RightDirection="' + pw + ' -' + ih / 2 + '" />' +
                        '</PathPointArray>' +
                        '</GeometryPathType>' +
                        '</PathGeometry>' +
                        '</Properties>' +
                        '<AnchoredObjectSetting AnchoredPosition="AboveLine" VerticalAlignment="TopAlign" SpineRelative="false" LockPosition="false" PinPosition="true" AnchorPoint="BottomRightAnchor" HorizontalAlignment="LeftAlign" HorizontalReferencePoint="TextFrame" VerticalAlignment="TopAlign" VerticalReferencePoint="LineBaseline" AnchorXoffset="0" AnchorYoffset="-' + (ih) + '" AnchorSpaceAbove="0" />' +
                        '<TextWrapPreference Inverse="false" ApplyToMasterPageOnly="false" TextWrapSide="BothSides" TextWrapMode="None">' +
                        '<Properties>' +
                        '<TextWrapOffset Top="0" Left="0" Bottom="0" Right="0" />' +
                        '</Properties>' +
                        '<ContourOption ContourType="SameAsClipping" IncludeInsideEdges="false" ContourPathName="$ID/" />' +
                        '</TextWrapPreference>' +
                        '<InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false" />' +
                        '<FrameFittingOption AutoFit="true" FittingOnEmptyFrame="Proportionally" FittingAlignment="BottomRightAnchor" />' +
                        '<Image Self="u3b1" Space="$ID/#Links_RGB" ActualPpi="300 300" EffectivePpi="250 250" ImageRenderingIntent="UseColorSettings" OverriddenPageItemProps="" LocalDisplaySetting="Default" ImageTypeName="$ID/PNG" AppliedObjectStyle="ObjectStyle/$ID/[None]" ItemTransform="1 0 0 1 0 1" ParentInterfaceChangeCount="" TargetInterfaceChangeCount="" LastUpdatedInterfaceChangeCount="" HorizontalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" VerticalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" GradientFillStart="0 0" GradientFillLength="0" GradientFillAngle="0" GradientFillHiliteLength="0" GradientFillHiliteAngle="0" Visible="true" Name="$ID/">' +
                        '<Properties>' +
                        '<Profile type="string">$ID/None</Profile>' +
                        '<GraphicBounds Left="0" Top="0" Right="' + ih / 2 + '" Bottom="0" />' +
                        '</Properties>' +
                        '<TextWrapPreference Inverse="false" ApplyToMasterPageOnly="false" TextWrapSide="BothSides" TextWrapMode="None">' +
                        '<Properties>' +
                        '<TextWrapOffset Top="0" Left="0" Bottom="0" Right="0" />' +
                        '</Properties>' +
                        '<ContourOption ContourType="SameAsClipping" IncludeInsideEdges="false" ContourPathName="$ID/" />' +
                        '</TextWrapPreference>' +
                        '<Link Self="u3b0" AssetURL="$ID/" AssetID="$ID/" LinkResourceURI="file:icml_css_1/files/uploadImage/' + imgname + '" LinkResourceFormat="$ID/PNG" StoredState="Normal" LinkClassID="35906" LinkClientID="257" LinkResourceModified="false" LinkObjectModified="false" ShowInUI="true" CanEmbed="true" CanUnembed="true" CanPackage="true" ImportPolicy="NoAutoImport" ExportPolicy="NoAutoExport" LinkImportStamp="file 128920231516589399 845941" LinkImportModificationTime="2009-07-14T11:02:31" LinkImportTime="2017-06-06T16:04:21" LinkResourceSize="0~ce875"></Link>' +
                        '<ClippingPathSettings ClippingType="None" InvertPath="false" IncludeInsideEdges="false" RestrictToFrame="false" UseHighResolutionImage="true" Threshold="25" Tolerance="2" InsetFrame="0" AppliedPathName="$ID/" Index="-1" />' +
                        '<ImageIOPreference ApplyPhotoshopClippingPath="true" AllowAutoEmbedding="true" AlphaChannelName="$ID/" />' +
                        '</Image>' +
                        '</Rectangle>' + brv);
                    createdelement.append(rectangle);
          
              return {
                fincls: fincls,
                tagname: tagname,
                dataheight: dataheight,
                pclassnew: pclassnew,
                ele: ele
              }
        }
        
        let paragraphelement = (index, type, fincls, tagnamearr, childrenelement, pclassnew, ptag) => {
            
            let tagnamea = tagnamearr.split('~~~');
            let tagname = tagnamea[0];
            let datah = tagnamea[1];
            let listul = '';
            let finclsval:any;
            if (tagname == "li" && ptag == 'ul' || ptag == 'ul_ul') {
                if (tagnamea[3] == 'none') {
                    listul = '';
                } else {
                    listul = 'BulletsAndNumberingListType="BulletList"';
                }
            }
            let listol = '';
            let numbercon = '';
            if (tagname == "li" && (ptag == 'ol' || ptag == 'ol_ol')) {
                if (tagnamea[3] == 'none') {
                    listol = '';
                    numbercon = '';
                } else {
                    listol = 'BulletsAndNumberingListType="NumberedList"';
                    let nv = tagnamea[2].split("~~");
                    numbercon = "NumberingStartAt=" + nv[0] + " NumberingContinue='false'";
                }
            }
            if (tagname == "li" && ptag != "ol" && ptag != "ul_ul" && ptag != "ol_ol") {
                finclsval = "ul_li";
            } else if (tagname == "li" && ptag == "ul_ul") {
                finclsval = "ul_ul_li";
            } else if (tagname == "li" && (ptag == "ol_ol" || ptag == "ol")) {
                if (pclassnew) {
                    let str = pclassnew.trim();
                    let newstr = str.replace(/ /g, "_");
                    finclsval = newstr;
                    if (finclsval.charAt(0) == '.') {
                        finclsval = finclsval.substr(1);
                    }
                    let i = 0;
                    let strLength = finclsval.length;
                    for (i; i < strLength; i++) {
                        finclsval = finclsval.replace("_.", "_");
                    }
                } else {
                    let arrv = fincls.split(' ');
                    if (fincls.charAt(0) == '.') {
                        fincls = fincls.substr(1);
                    }
                    finclsval = fincls.replace(/ /g, "_");
                    let i = 0;
                    let strLength = finclsval.length;
                    for (i; i < strLength; i++) {
                        finclsval = finclsval.replace("_.", "_");
                    }
                }
            } else {
                if (pclassnew) {
                    let str = pclassnew.trim();
                    let newstr = str.replace(/ /g, "_");
                    finclsval = newstr;
                    if (finclsval.charAt(0) == '.') {
                        finclsval = finclsval.substr(1);
                    }
                    let i = 0;
                    let strLength = finclsval.length;
                    for (i; i < strLength; i++) {
                        finclsval = finclsval.replace("_.", "_");
                    }
                } else {
                    
                    let arrv = fincls.split(' ');
                    if (fincls.charAt(0) == '.') {
                        fincls = fincls.substr(1);
                    }
                    finclsval = fincls.replace(/ /g, "_");
                    let i = 0;
                    let strLength = finclsval.length;
                    for (i; i < strLength; i++) {
                        finclsval = finclsval.replace("_.", "_");
                    }
                    
                }
            }
            if (type == "add") {
                if (tagname == "ul" || tagname == 'ol') {
                    parenttag[index] = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>');
                } else if (tagname == "h1" || tagname == 'h2' || tagname == 'h3' || tagname == 'h4' || tagname == 'h5' || tagname == 'h6') {
                    parenttag[index] = $('<ParagraphStyleRangeh4 AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangeh4>');
                } else if (tagname == "aside") {
                    parenttag[index] = $('<ParagraphStyleRangeaside bg=' + tagnamea[2] + ' data-height="' + datah + '" AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangeaside>');
                } else if (tagname == "header" || tagname == "div") {
                    if (tagnamea[2] && tagnamea[2] != '0,0,0,0') {
                        parenttag[index] = $('<ParagraphStyleRangeaside bg=' + tagnamea[2] + ' data-height="' + datah + '" AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangeaside>');
                    } else {
                        parenttag[index] = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangebr>');
                    }
                } else if (tagname == "blockquote") {
                    parenttag[index] = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangebr>');
                } else {
                    parenttag[index] = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangebr>');
                }
            } else if (type == "add" && tagname != "ol" && tagname != "li" && tagname == "header") {
                if (tagnamea[2]) {
                    parenttag[index] = $('<ParagraphStyleRangeaside bg=' + tagnamea[2] + ' data-height="' + datah + '" AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangeaside>');
                } else {
                    parenttag[index] = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>');
                }
            } else if (type == "append") {
                let parentapp:any;
                if (tagname == "li" && ptag != "ol" && ptag != "ol_ol" && ptag != 'ul_ul') {
                    parentapp = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '" ' + listul + '></ParagraphStyleRangebr>');
                    childrenelement.append(parentapp);
                    return parentapp;
                } else if (tagname == "li" && ptag != "ol" && ptag != "ol_ol" && (ptag == 'ul_ul' || ptag == 'ul')) {
                    parentapp = $('<ParagraphStyleRangeul AppliedParagraphStyle="ParagraphStyle/' + finclsval + '" ' + listul + '></ParagraphStyleRangeul>');
                    childrenelement.append(parentapp);
                    return parentapp;
                } else if (tagname == "li" && (ptag == "ol" || ptag == "ol_ol")) {
                    parentapp = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '" ' + listol + ' ' + numbercon + '></ParagraphStyleRangebr>');
                    childrenelement.append(parentapp);
                    return parentapp;
                } else {
                    if (tagname == 'p' || tagname == 'div') {
                        if ((tagname == 'div' || tagname == 'p') && fincls == '.one-sixth') {
                            parentapp = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>');
                            childrenelement.append(parentapp);
                        } else {
                            parentapp = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangebr>');
                            childrenelement.append(parentapp);
                        }
                        return parentapp;
                    } else if (tagname == "ul" && ptag == "ul") {
                        parentapp = $('<ParagraphStyleRangepul AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangepul>');
                        childrenelement.append(parentapp);
                        return parentapp;
                    } else if (tagname == 'cite') {
                        parentapp = $('<ParagraphStyleRangecite AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangecite>');
                        childrenelement.append(parentapp);
                        return parentapp;
                    } else if (tagname == "h1" || tagname == 'h2' || tagname == 'h3' || tagname == 'h4' || tagname == 'h5' || tagname == 'h6' || tagname == 'ol') {
                        if (ptag == 'aside' && tagname == 'h5') {
                            parentapp = $('<ParagraphStyleRangepulh AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangepulh>');
                        } else if (tagname == 'h1' && fincls == '.enumeration' && ptag == "header") {
                            parentapp = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>');
                            childrenelement.append(parentapp);
                        } else if (tagname == 'h1' && fincls == 'h1' && ptag == "header") {
                            parentapp = $('<ParagraphStyleRangebr AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangebr>');
                            childrenelement.append(parentapp);
                        } else {
                            parentapp = $('<ParagraphStyleRangeh4 AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangeh4>');
                        }
                        childrenelement.append(parentapp);
                        return parentapp;
                    } else if (tagname == 'aside') {
                        parentapp = $('<ParagraphStyleRangeaside bg=' + tagnamea[2] + ' data-height="' + datah + '" AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangeaside>');
                        childrenelement.append(parentapp);
                        return parentapp;
                    } else if (tagname == 'math') {
                        let datasplit = datah.split("@@@");
                        parentapp = $('<ParagraphStyleRangemath data-height="' + datasplit[0] + '" data-width="' + datasplit[1] + '" data-uid="' + datasplit[2] + '" AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRangemath>');
                        childrenelement.append(parentapp);
                        return parentapp;
                    } else if (tagname == 'img') {
                        parentapp = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>');
                        childrenelement.append(parentapp);
                        return parentapp;
                    } else {
                        parentapp = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>');
                        childrenelement.append(parentapp);
                        return parentapp;
                    }
                }
            }
        }

        let characterelement = (index, fincls, tagnameval, childrenelement, pclassnew) => {
            let tagarr = tagnameval.split("~~~");
            let tagname = tagarr[0];
            let finclsval = '';
            let createdelement :any;
            if (tagname == "math") {
                finclsval = tagname;
            } else {
                if (pclassnew) {
                    let str = pclassnew;
                    let newstr = str.replace(/ /g, "_");
                    finclsval = newstr;
                    if (finclsval.charAt(0) == '.') {
                        finclsval = finclsval.substr(1);
                    }
                    let i = 0,
                        strLength = finclsval.length;
                    for (i; i < strLength; i++) {
                        finclsval = finclsval.replace("_.", "_");
                    }
                } else {
                    if (fincls == '[No character style]') {
                        finclsval = fincls;
                    } else {
                        let arrv = fincls.split(' ');
                        if (fincls.charAt(0) == '.') {
                            fincls = fincls.substr(1);
                        }
                        finclsval = fincls.replace(/ /g, "_");
                        let i = 0;
                        let strLength = finclsval.length;
                        for (i; i < strLength; i++) {
                            finclsval = finclsval.replace("_.", "_");
                        }
                    }
                }
            }
            if (tagname == "math") {
                createdelement = $('<CharacterStyleRange data-uid="' + tagarr[2] + '" data-height="' + tagarr[3] + '" data-width="' + tagarr[1] + '" AppliedCharacterStyle="CharacterStyle/' + finclsval + '"></CharacterStyleRange>')
            } else {
                createdelement = $('<CharacterStyleRange AppliedCharacterStyle="CharacterStyle/' + finclsval + '"></CharacterStyleRange>')
            }
            childrenelement.append(createdelement);
            return createdelement;
        }

        let characterelement1 = (index, element, fincls, tagname, childrenelement, pclassnew, bcss) => {
            let sw = "",
                sc = "",
                finclsval = "";
            if (bcss) {
                let bcssarr = bcss.split("---");
                /*if (bcssarr[0] != 0) {
                    bwid = bcssarr[0] * 0.25;
                    sw = 'StrokeWeight=' + bwid;
                }*/
                if (bcssarr[2] != "") {
                    let bcssarrs = bcssarr[2].split(",");
                    if (bcssarrs.length == '4') {
                        sc = 'StrokeColor="Color/C=' + bcssarrs[0] + ' M=' + bcssarrs[1] + ' Y=' + bcssarrs[2] + ' K=' + bcssarrs[3] + '"';
                    } else {
                        sc = 'StrokeColor="Color/R=' + bcssarrs[0] + ' G=' + bcssarrs[1] + ' B=' + bcssarrs[2] + '"';
                    }
                }
            }
            if (tagname == "sub" || tagname == "sup" || tagname == "math") {
                finclsval = tagname;
            } else {
                if (pclassnew) {
                    let str = pclassnew;
                    let newstr = str.replace(/ /g, "_");
                    finclsval = newstr;
                    if (finclsval.charAt(0) == '.') {
                        finclsval = finclsval.substr(1);
                    }
                    let i = 0,
                        strLength = finclsval.length;
                    for (i; i < strLength; i++) {
                        finclsval = finclsval.replace("_.", "_");
                    }
                } else {
                    let arrv = fincls.split(' ');
                    let finclsval = arrv[0];
                    if (finclsval.charAt(0) == '.') {
                        finclsval = finclsval.substr(1);
                    }
                }
            }
            let testvalue = $(element)[0].attributes;
            let createdelement = $('<CharacterStyleRange ' + sw + ' ' + sc + ' AppliedCharacterStyle="CharacterStyle/' + finclsval + '" ></CharacterStyleRange>')
            for (let i = 0; i < testvalue.length; i++) {
                let attributevalue = testvalue[i] + '';
                $(createdelement).attr(attributevalue.split("=")[0], attributevalue.split("=")[1]);
            }
            $(childrenelement).append(createdelement);
            return createdelement;
        }

        let createtable = (index, element, pclass, subchildrenelement, pclassnew, bgclr) => {
            let childrenelement:any;
            let fincls:any;
            if (subchildrenelement) {
                childrenelement = subchildrenelement;
            } else {
                childrenelement = parenttag[index];
            }
            let tagname = $(element).prop("tagName").toLowerCase();
            for (let i = 0, j = 1; i < $(element)[0].childNodes.length; i++, j++) {
                if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "caption") {
                    let ele = $(element)[0].childNodes[i];
                    let classlinked = $(ele).attr('class');
                    tagname = $(ele).prop("tagName").toLowerCase();
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    if (pclass) {
                        let finarrp = $.inArray(pclass + " " + fincls, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclass + " " + fincls);
                        }
                    }
                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "",
                        bgclr2 = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr2 = valuecss;
                        }
                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }
                    pclassnew = pclassnew.trim();
                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + "~~~" + bgclr2, childrenelement, pclassnew, '');
                    childelements(index, ele, pclass, subchildrenelement, pclassnew, fincls, '');
                }
            }

            tableindex = 0;
            let chvt:number = 0;
            let csscomputed = $(element).css(["background-color", "text-align", "height", "width"]);
            for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                if (prop == 'width') {
                    chvt = parseInt(value.replace("px", ""));
                }
            }
            let rw = $(element)[0].rows.length;
            let maxcnt = -Infinity;
            for (let ww = 0; ww < rw; ww++) {
                if ($(element)[0].rows[ww].children.length > maxcnt) {
                    maxcnt = $(element)[0].rows[ww].children.length;
                }
            }
            let rowcnt = ($(element)[0].rows.length);
            let tabletext = $('<Tablee AppliedTableStyle="TableStyle/Table" HeaderRowCount="0" BodyRowCount="' + rowcnt + '" ColumnCount="' + maxcnt + '" ></Tablee>');
            childrenelement.append(tabletext);
            for (let i = 0; i < $(element)[0].rows.length; i++) {
                tabletext.append($('<Row Self="u171i186Row' + i + '" Name="' + i + '" SingleRowHeight="'+$(element)[0].rows[i].offsetHeight+'" MinimumHeight="'+$(element)[0].rows[i].offsetHeight * .65+'"  TextTopInset="4" TextLeftInset="4" TextBottomInset="4" TextRightInset="4" />'));
            }
            let ra:number = 0;
            for (let r = 0; r < rowcnt; r++) {
                if (maxcnt == $(element)[0].rows[r].children.length) {
                    ra = r;
                    break;
                }
            }
            for (let i = 0; i < maxcnt; i++) {
                let ele = $(element)[0].rows[ra].children[i];
                let chv:number = 0;
                let csscomputed = $(ele).css(["text-align", "height", "width"]);
                for(var style in csscomputed){
                    let prop = style;
                    let value = csscomputed[style];
                    if (prop == 'width') {
                        let stch:number = parseInt(value.replace("px", ""));
                        let pv:number = chvt / stch;
                        let fpv = 720 / pv;
                        chv = fpv * 0.75;
                    }
                }

                if (maxcnt > 2) {
                    if (i % 2 == 0) {
                        tabletext.append($('<Column Self="u171i186Column' + i + '" Name="' + i + '" SingleColumnWidth="' + chv + '" TextTopInset="4" TextLeftInset="4" TextBottomInset="4" TextRightInset="4" />'));
                    } else {
                        tabletext.append($('<Column Self="u171i186Column' + i + '" Name="' + i + '" SingleColumnWidth="' + chv + '" TextTopInset="4" TextLeftInset="4" TextBottomInset="4" TextRightInset="4"  />'));
                    }
                } else {
                    if (i % 2 == 0) {
                        tabletext.append($('<Column Self="u171i186Column' + i + '" Name="' + i + '" SingleColumnWidth="' + chv + '" TextTopInset="4" TextLeftInset="4" TextBottomInset="4" TextRightInset="4" />'));
                    } else {
                        tabletext.append($('<Column Self="u171i186Column' + i + '" Name="' + i + '" SingleColumnWidth="' + chv + '" TextTopInset="4" TextLeftInset="4" TextBottomInset="4" TextRightInset="4" />'));
                    }
                }
            }
            let rowarr = {};
            let k = 0,
                m = 0,
                c = 0,
                cp = 0;
            for (let i = 0; i < $(element)[0].rows.length; i++) {
                let cspan = 0,
                    bgc = "",
                    bggc = "";
                let ele = $(element)[0].rows[i];
                let csscomputed = $(ele).css(["background-color", "text-align", "height", "width"]);
                for(var style in csscomputed){
                    let prop = style;
                    let value = csscomputed[style];
                    if (prop == 'background-color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        for (let i in rgb) {
                            if (bgc) {
                                bgc += "," + rgb[i];
                                bggc += " " + rgb[i];
                            } else {
                                bgc += rgb[i];
                                bggc += rgb[i];
                            }
                        }
                        this.csscolorarr.push(bggc);
                    }
                }
                for (let j = 0; j < $(element)[0].rows[i].children.length; j++) {
                    ele = $(element)[0].rows[i].children[j];
                    let client_w1 = $(ele).width();
                    let csscomputed = $(ele).css(["background-color", "border-bottom-color", "border-top-color", "border-left-color", "border-right-color", "border-bottom-width", "border-top-width", "border-left-width", "border-right-width", "text-align", "height", "width", "font-weight", "font-family", "text-decoration", "transform"]);
                    let tc = "", bc = "", lc = "", rc = "", ctc = "", cbc = "", clc = "", crc = "";
                    let tw = "", bw = "", lw = "", rw = "", talign = "", routput = "";
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'transform' && value != 'none') {
                            let angleVal:number = 0
                            let matrix = value;
                            if (matrix !== 'none') {
                                let values = matrix.split('(')[1].split(')')[0].split(',');
                                angleVal = (Math.round(Math.atan2(parseInt(values[1]), parseInt(values[0])) * (180 / Math.PI)));
                            } else {
                                angleVal = 0;
                            }
                            let output:number = (angleVal < 0) ? angleVal += 360 : angleVal;
                            routput = "RotationAngle=" + output;
                        }

                        if (prop == 'text-align') {
                            let lval = value.split('-');
                            if (lval[lval.length - 1] == 'left') {
                                talign = "LeftAlign";
                            } else if (lval[lval.length - 1] == 'center') {
                                talign = "CenterAlign";
                            } else if (lval[lval.length - 1] == 'right') {
                                talign = "RightAlign";
                            } else {
                                talign = "LeftAlign";
                            }

                        }
                        if (prop == 'border-bottom-width') {
                            let str = value;
                            bw = str.replace("px", "");
                        } else if (prop == 'border-top-width') {
                            let str = value;
                            tw = str.replace("px", "");
                        } else if (prop == 'border-left-width') {
                            let str = value;
                            lw = str.replace("px", "");
                        } else if (prop == 'border-right-width') {
                            let str = value;
                            rw = str.replace("px", "");
                        }

                        if (prop == 'border-bottom-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            for (let i in rgb) {
                                if (bc) {
                                    bc += "," + rgb[i];
                                    cbc += " " + rgb[i];
                                } else {
                                    bc += rgb[i];
                                    cbc += rgb[i];
                                }
                            }
                            this.csscolorarr.push(cbc);
                        } else if (prop == 'border-top-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            for (let i in rgb) {
                                if (tc) {
                                    tc += "," + rgb[i];
                                    ctc += " " + rgb[i];
                                } else {
                                    tc += rgb[i];
                                    ctc += rgb[i];
                                }
                            }
                            this.csscolorarr.push(ctc);
                        } else if (prop == 'border-left-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            for (let i in rgb) {
                                if (lc) {
                                    lc += "," + rgb[i];
                                    clc += " " + rgb[i];
                                } else {
                                    lc += rgb[i];
                                    clc += rgb[i];
                                }
                            }
                            this.csscolorarr.push(clc);
                        } else if (prop == 'border-right-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            for (let i in rgb) {
                                if (rc) {
                                    rc += "," + rgb[i];
                                    crc += " " + rgb[i];
                                } else {
                                    rc += rgb[i];
                                    crc += rgb[i];
                                }
                            }
                            this.csscolorarr.push(crc);
                        }
                        if (cssprop[pclass]) {
                            cssprop[pclass] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclass] = (prop + ":" + value + "~");
                        }
                    }
                    let rca = rc.split(',');
                    let bca = bc.split(',');
                    let tca = tc.split(',');
                    let lca = lc.split(',');

                    let rcc = rc.replace(",", " ");
                    let bcc = bc.replace(",", " ");
                    let lcc = lc.replace(",", " ");
                    let tcc = tc.replace(",", " ");
                    let valbg = "";
                    if (bgc) {
                        let bclr = bgc.split(',');
                        if (bgc != '0,0,0,0') {
                            valbg = "Color/R=" + bclr[0] + " G=" + bclr[1] + " B=" + bclr[2];
                        } else {
                            valbg = "Color/C=" + bclr[0] + " M=" + bclr[1] + " Y=" + bclr[2] + " K=" + bclr[3];
                        }
                    } else {
                        if (bgclr) {
                            let rcarr = bgclr.split(',');
                            if (rcarr.length == 4) {
                                valbg = "Color/C=" + rcarr[0] + " M=" + rcarr[1] + " Y=" + rcarr[2] + " K=" + rcarr[3];
                            } else {
                                valbg = "Color/R=" + rcarr[0] + " G=" + rcarr[1] + " B=" + rcarr[2];
                            }
                        }
                    }

                    let csp = cspan;
                    let cellelement = $('<Cell Self="cvuid' + i + 'a' + j + '" Name="' + csp + ':' + i + '" RowSpan=' + $(ele).prop("rowSpan") + ' ColumnSpan="' + $(ele).prop("colSpan") + '" CellType="TextTypeCell" AppliedCellStyle="CellStyle/Cell" FillColor="' + valbg + '" LeftEdgeStrokeWeight="' + lw + '" RightEdgeStrokeWeight="' + rw + '" TopEdgeStrokeWeight="' + tw + '" BottomEdgeStrokeWeight="' + bw + '" LeftEdgeStrokeColor="Color/R=' + lca[0] + ' G=' + lca[1] + ' B=' + lca[2] + '" TopEdgeStrokeColor="Color/R=' + tca[0] + ' G=' + tca[1] + ' B=' + tca[2] + '" RightEdgeStrokeColor="Color/R=' + rca[0] + ' G=' + rca[1] + ' B=' + rca[2] + '" BottomEdgeStrokeColor="Color/R=' + bca[0] + ' G=' + bca[1] + ' B=' + bca[2] + '" LeftEdgeStrokeType="StrokeStyle/$ID/Solid" RightEdgeStrokeType="StrokeStyle/$ID/Solid" TopEdgeStrokeType="StrokeStyle/$ID/Solid" BottomEdgeStrokeType="StrokeStyle/$ID/Solid" LeftEdgeStrokePriority="' + i + '" RightEdgeStrokePriority="' + i + '" TopEdgeStrokePriority="' + i + '" BottomEdgeStrokePriority="' + i + '" TextTopInset="4" TextLeftInset="4" TextBottomInset="4" TextRightInset="4" VerticalJustification="' + talign + '" ' + routput + '>')
                    childtableelements(index, $(element)[0].rows[i].children[j], cellelement, tabletext, chvt, talign)
                    cspan = csp + $(ele).prop("colSpan");
                    let rspan = $(ele).prop("rowSpan");
                    if (rspan > 1) {
                        k = rspan;
                        m = i;
                        c = j;
                        cp = $(ele).prop("colSpan");
                        let fin = k + "," + m + "," + c + "," + cp;
                        let b = 0;
                        for (let g = 1; g < k; g++) {
                            let nextrow = i + g;
                            let rowele = $(element)[0].rows[nextrow];
                            for (let ccc = 0; ccc < cp; ccc++) {
                                if (i == 0) {
                                    b = (j + ccc);
                                } else {
                                    b = cspan;
                                }
                                $(rowele).find('td:nth-child(' + b + ')').before('<td></td>');
                            }
                        }
                    }
                }
                tableindex++;
            }
        }

        let childtableelements = (index, element, cellelement, subchildrenelement, chvt, talign) => {
            let innerHtml = $(element).html();
            let classlinked = $(element).attr('class');
            let childrenelement = '';
            let fincls:any;
            if (subchildrenelement) {
                childrenelement = subchildrenelement;
            } else {
                childrenelement = cellelement;
            }
            for (let i = 0; i < $(element)[0].childNodes.length; i++) {
                let pclassnew = "";
                let pclass = "";
                if (!cellelement) {
                    if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "div" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "aside" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "p") {
                        let ele = $(element)[0].childNodes[i];
                        classlinked = $(ele).attr('class');
                        let tagname = $(ele).prop("tagName").toLowerCase();
                        if (classlinked) {
                            fincls = "." + classlinked.replace(" ", " .");
                            let arr = fincls.split(" ");
                            pclassnew = pclassnew + " " + fincls;
                            let finarr = $.inArray(fincls, classarray);
                            if (finarr == -1) {
                                classarray.push(fincls);
                            }
                        } else {
                            fincls = tagname;
                            pclassnew = pclassnew + " " + fincls;
                            let finarr = $.inArray(fincls, classarray);
                            if (finarr == -1) {
                                classarray.push(fincls);
                            }
                        }
                        if (pclassnew) {
                            let finarrp = $.inArray(pclassnew, classarray);
                            if (finarrp == -1) {
                                classarray.push(pclassnew);
                            }
                        }
                        let dataheight = "",
                            bgclr = "";
                        let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font"]);
                        for(var style in csscomputed){
                            let prop = style;
                            let value = csscomputed[style];
                            if (prop == 'color') {
                                let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                let valuecss = "";
                                for (let i in rgb) {
                                    if (valuecss) {
                                        valuecss += "," + rgb[i];
                                    } else {
                                        valuecss += rgb[i];
                                    }
                                }
                                value = valuecss;
                            }
                            if (prop == 'background-color') {
                                let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                let valuecss = "";
                                for (let i in rgb) {
                                    if (valuecss) {
                                        valuecss += "," + rgb[i];
                                    } else {
                                        valuecss += rgb[i];
                                    }
                                }
                                value = valuecss;
                                bgclr = valuecss;

                            }
                            if (cssprop[pclassnew]) {
                                cssprop[pclassnew] += (prop + ":" + value + "~");
                            } else {
                                cssprop[pclassnew] = (prop + ":" + value + "~");
                            }

                        }
                        childrenelement = tableparagraphelement(index, 'appened', cellelement, fincls, tagname, childrenelement);
                    }
                } 
              else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == 'ol') {
                    let callol = computeol(element, i);
                    subchildrenelement = paragraphelement(index, 'append', callol.fincls, callol.tagname + "~~~" + callol.dataheight, childrenelement, callol.pclassnew, 'ol');
                    createul(index, callol.ele, pclass, 'ol', childrenelement, callol.pclassnew);
                }
              else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "ul") {
                    let ele = $(element)[0].childNodes[i];
                    let innerHtml = $(ele).html();
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    let pclass:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        if (arr[0]) {
                            pclass = arr[0];
                            classarray.push(tagname + "" + pclass);
                        }
                        classarray.push(arr);
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        pclass = tagname;
                        fincls = tagname;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    let dataheight = "",
                        bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclass]) {
                            cssprop[pclass] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclass] = (prop + ":" + value + "~");
                        }
                    }
                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight, childrenelement, pclassnew, "ul");
                    createul(index, ele, pclass, "ul", childrenelement, pclassnew);
                } 
              else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "img") {
                    let callimg = computeimg(element, i, 1, pclass, index, chvt, childrenelement);
                    subchildrenelement = paragraphelement(index, 'append', callimg.fincls, callimg.tagname + "~~~" + callimg.dataheight, childrenelement, callimg.pclassnew, 'img');
                    createul(index, callimg.ele, pclass, 'img', childrenelement, callimg.pclassnew);
              }
              else {
                    if (i == 0) {
                        let fincls = '[No paragraph style]';
                        childrenelement = tableparagraphelement(index, 'appened', cellelement, fincls, '', childrenelement);
                    }
                    if ($(element)[0].childNodes[i].nodeValue != null) {
                        let str = $(element)[0].childNodes[i].nodeValue;
                        str = str.trim();
                        if (str != null && str != "") {
                            let childtag = tablecharacterelement(index, childrenelement, '', '', talign, '');
                            let val = $(element)[0].childNodes[i].nodeValue;
                            val = val.replace(/\s+/g, ' ');
                            childtag.append('<Content>' + val + '</Content>');
                        }
                    } else {
                        let fw = "", ff = "", cl = "", cll = "";
                        let ele = $(element)[0].childNodes[i];
                        let csscomputed = $(ele).css(["color", "height", "width", "font-family", "font-style", "font-weight"]);
                        for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                            if (prop == 'font-weight') {
                                fw = value;
                            }
                            if (prop == 'font-family') {
                                ff = value;
                            }
                            if (prop == 'color') {
                                let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                for (let i in rgb) {
                                    if (cl) {
                                        cl += "," + rgb[i];
                                        cll += " " + rgb[i];
                                    } else {
                                        cl += rgb[i];
                                        cll += rgb[i];
                                    }
                                }
                                this.csscolorarr.push(cll);
                            }
                        }
                        if ($(element)[0].childNodes[i].childNodes.length > 1) {
                            loopchildelements($(element)[0].childNodes[i], index, childrenelement, chvt, ff, fw + "~~" + cl, talign, '', '');
                        } else {
                            loopchildelements($(element)[0].childNodes[i], index, childrenelement, chvt, ff, fw + "~~" + cl, talign, '', '')
                        }
                    }
                }
            }
        }

        let loopchildelements = (elements, index, cellelement, chvt, fff, ffw, talign, pclassnew, pclass) => {
            let childrenelement:any;
            if (cellelement) {
                childrenelement = childrenelement;
            }

            if ($(elements).prop("tagName").toLowerCase() == "math") {
                let epsid = $(elements).attr('data-uuid');
                $(elements).html(epsid);
            }

            if (elements.length) {
                let childtag = tablecharacterelement(index, cellelement, '', '', '', '');
                let tempsting = tablecellelements(elements, '');
                childtag.append(tempsting);
            } else {
                let ff = "",
                    fw = "";
                if (elements.childNodes.length > 0) {
                    for (let z = 0, i = 0; z < elements.childNodes.length; z++, i++) {
                        let classlinked = '';
                        if ($(elements)[0].childNodes[i].nodeName.toLowerCase() == "img") {
                          let callimg = computeimg(elements, i, 2, pclass, index, chvt, '');
                        } else if ($(elements)[0].childNodes[i].nodeName.toLowerCase() == "math") {
                            let ele = $(elements)[0].childNodes[i];
                            let fincls:any;
                            classlinked = $(ele).attr('class');
                            let tagname = $(ele).prop("tagName").toLowerCase();
                            if (classlinked) {
                                fincls = "." + classlinked.replace(" ", " .");
                                let arr = fincls.split(" ");
                                pclassnew = pclassnew + " " + fincls;
                                let finarr = $.inArray(fincls, classarray);
                                if (finarr == -1) {
                                    classarray.push(fincls);
                                }
                            } else {
                                fincls = tagname;
                                pclassnew = pclassnew + " " + fincls;
                                let finarr = $.inArray(fincls, classarray);
                                if (finarr == -1) {
                                    classarray.push(fincls);
                                }
                            }
                            if (pclassnew) {
                                let finarrp = $.inArray(pclassnew, classarray);
                                if (finarrp == -1) {
                                    classarray.push(pclassnew);
                                }
                            }
                            let dataheight = "",
                                bgclr = "",
                                datawidth = "";
                            let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height", "width"]);
                            for(var style in csscomputed){
                                let prop = style;
                                let value = csscomputed[style];
                                if (prop == 'color') {
                                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                    let valuecss = "";
                                    for (let i in rgb) {
                                        if (valuecss) {
                                            valuecss += "," + rgb[i];
                                        } else {
                                            valuecss += rgb[i];
                                        }
                                    }
                                    value = valuecss;
                                }
                                if (prop == 'height') {
                                    dataheight = value;
                                }
                                if (prop == 'width') {
                                    datawidth = value;
                                }
                                if (prop == 'background-color') {
                                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                    let valuecss = "";
                                    for (let i in rgb) {
                                        if (valuecss) {
                                            valuecss += "," + rgb[i];
                                        } else {
                                            valuecss += rgb[i];
                                        }
                                    }
                                    value = valuecss;
                                    bgclr = valuecss;

                                }
                                if (cssprop[pclassnew]) {
                                    cssprop[pclassnew] += (prop + ":" + value + "~");
                                } else {
                                    cssprop[pclassnew] = (prop + ":" + value + "~");
                                }
                            }
                            if (tagname == 'math') {
                                let dataid = $(ele).attr('data-uuid');
                                dataheight = dataheight + "@@@" + datawidth + "@@@" + dataid;
                            }
                            let subchildrenelement = tableparagraphelement(index, 'appened', cellelement, fincls, tagname + "~~~" + dataheight, cellelement);
                        } else if (elements.childNodes[z].childNodes.length > 0) {
                            let ele = $(elements)[0].childNodes[i];
                            let cl = "", cll = "";
                            let csscomputed = $(ele).css(["color", "height", "width", "font-family", "font-style", "font-weight"]);
                            for(var style in csscomputed){
                                let prop = style;
                                let value = csscomputed[style];
                                if (prop == 'font-weight') {
                                    fw = value;
                                }
                                if (prop == 'font-family') {
                                    ff = value;
                                }

                                if (prop == 'color') {
                                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                    for (let i in rgb) {
                                        if (cl) {
                                            cl += "," + rgb[i];
                                            cll += " " + rgb[i];
                                        } else {
                                            cl += rgb[i];
                                            cll += rgb[i];
                                        }
                                    }
                                    this.csscolorarr.push(cll);
                                }

                            }
                            loopchildelements(elements.childNodes[z], index, cellelement, '', ff, fw + "~~" + cl, talign, '', '');
                        } else {
                            let str = '';
                            if (elements.childNodes[z].nodeValue == null) {
                                str = elements.childNodes[z].nodeValue;
                            } else {
                                str = $.trim(elements.childNodes[z].nodeValue);
                            }
                            let str1 = elements.childNodes[z].nodeValue;
                            if (str != "" && str != null) {
                                let childtag = tablecharacterelement(index, cellelement, fff, ffw, talign, $(elements).prop("tagName").toLowerCase());
                                let tempsting = tablecellelements(elements.childNodes[z], $(elements).prop("tagName").toLowerCase())
                                childtag.append(tempsting);
                            } else if (str1 == " " && $(elements).prop("tagName").toLowerCase() != "div") {
                                let childtag = tablecharacterelement(index, cellelement, fff, ffw, talign, $(elements).prop("tagName").toLowerCase());
                                let tempsting = tablecellelements(elements.childNodes[z], $(elements).prop("tagName").toLowerCase())
                                childtag.append(tempsting);
                            }
                        }
                    }
                } else {
                    let childtag = tablecharacterelement(index, cellelement, fff, ffw, talign, $(elements).prop("tagName").toLowerCase());
                    let tempsting = tablecellelements(elements, $(elements).prop("tagName").toLowerCase());
                    childtag.append(tempsting);
                }
            }
        }

        let tableparagraphelement = (index, type, cellelement, fincls, tagname, subchildrenelement) => {
            let childrenelement:any;
            let finclsval = '';
            let ts = '';
            if (fincls == '[No paragraph style]') {
                finclsval = fincls;
            } else {
                let arrv = fincls.split(' ');
                finclsval = arrv[0];
                if (finclsval.charAt(0) == '.') {
                    finclsval = finclsval.substr(1);
                }
            }
            if (tagname) {
                ts = tagname.split('~~~');
            }
            if (subchildrenelement) {
                childrenelement = subchildrenelement;
            } else {
                childrenelement = parenttag[index];
            }
            if (type == "add") {
                let addtext;
                if (tableindex == 0) {
                    let sub = cellelement;
                    childrenelement = sub.append($('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>'));
                } else {
                    childrenelement = cellelement.append($('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>'));
                }
            } else {
                let paraele:any;
                if (tagname != "") {
                    if (ts[0] == 'math') {
                        let datasplit = ts[1].split("@@@");
                         paraele = $('<ParagraphStyleRangemath AppliedParagraphStyle="ParagraphStyle/' + finclsval + '" data-height=' + datasplit[0] + ' data-width="275px" data-uid=' + datasplit[2] + '></ParagraphStyleRangemath>')
                    }
                } else {
                     paraele = $('<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/' + finclsval + '"></ParagraphStyleRange>')
                }
                if (tableindex == 0) {
                    let tabletextapp = cellelement;
                    let parelement = cellelement.append(paraele);
                    childrenelement.append(tabletextapp);
                } else {
                    let parelement = cellelement.append(paraele);
                    childrenelement.append(parelement);
                }
                return paraele;
            }
        }

        let tablecellelements = (elementvalue, tag) => {
            if (elementvalue.nodeValue != null && tag == 'p') {
                return '<br><Content>' + elementvalue.nodeValue + '</Content><br>';
            } else if (elementvalue.nodeValue != null && tag != 'p') {
                return '<Content>' + elementvalue.nodeValue + '</Content>';
            } else {
                return '<Content>' + elementvalue.innerText + '</Content>';
            }
        }

        let tablecharacterelement = (index, cellelement, ff, fw, talign, tagname) => {
            let fs = "", ffp = '', tclr = "";
            let fwv = fw.split("~~");
            let finclsval = '';
            if (fwv[0] == 'bold' || (fwv[0] > 500)) {
                fs = 'FontStyle="Bold"';
            } else {
                fs = 'FontStyle="Regular"';
            }
            if (fwv[1]) {
                let tc = fwv[1].split(",");
                tclr = 'FillColor="Color/R=' + tc[0] + ' G=' + tc[1] + ' B=' + tc[2] + '"';
            }

            let ffs = ff.split(',');

            if (ffs[0] == 'proximanova') {
                let ffp = '<Properties>' +
                    '<AppliedFont type="string">Proxima Nova (OTF)</AppliedFont>' +
                    '</Properties>';
            } else if (ffs[0] == '"' + 'Myriad Pro' + '"' || ffs[0] == 'Myriad Pro') {
                let ffp = '<Properties>' +
                    '<AppliedFont type="string">Myriad Pro</AppliedFont>' +
                    '</Properties>';
            } else if (ffs[0] == 'Myriad Pro Light' || ffs[0] == '"' + 'Myriad Pro Light' + '"') {
                let ffp = '<Properties>' +
                    '<AppliedFont type="string">Myriad Pro</AppliedFont>' +
                    '</Properties>';
            } else if (ffs[0] == 'stix') {
                let ffp = '<Properties>' +
                    '<AppliedFont type="string">STIXGeneral</AppliedFont>' +
                    '</Properties>';
            }
            if (tagname == "sub" || tagname == "sup" || tagname == "math") {
                finclsval = tagname;
            } else {
                finclsval = "[No character style]";
            }
            let charactelem = $('<CharacterStyleRange AppliedCharacterStyle="CharacterStyle/' + finclsval + '"  Justification="' + talign + '" ' + fs + ' ' + tclr + ' PointSize="10"></CharacterStyleRange>');
            if (ffp != "") {
                charactelem.append(ffp);
            }
            let createdelement = cellelement.append(charactelem);
            return charactelem;
        }

        let childelements = (index, element, pclass, subchildrenelement, pclass2, beforeclass, ptag) => {
            let innerHtml = $(element).html();
            let pclassnew = '';
            let childrenelement = ''
            if (subchildrenelement) {
                 childrenelement = subchildrenelement;
            } else {
                 childrenelement = parenttag[index];
            }

            let tagname = $(element).prop("tagName").toLowerCase();
            if ($(element).prop("tagName").toLowerCase() == "math") {
                let epsid = $(element).attr('data-uuid');
                $(element).html(epsid);
            }

            if (pclass2) {
                pclassnew = pclass2;
            } else {
                pclassnew = pclass;
            }

            for (let i = 0, j = 1; i < $(element)[0].childNodes.length; i++, j++) {
                let ele = $(element)[0].childNodes[i];
                let classlinked = $(ele).attr('class');
                
                if (($(element)[0].childNodes[i].nodeName.toLowerCase() == "div" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "section" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "aside" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "cite" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "figure" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "p" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "h1" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "h2" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "h3" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "h4" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "h5" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "h6" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "header" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "span" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "figcaption") && (tagname != "blockquote")) {
                    
                    let fincls:any;
                    let ele = $(element)[0].childNodes[i];
                    classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();

                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    if (pclass) {
                        let finarrp = $.inArray(pclass + " " + fincls, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclass + " " + fincls);
                        }
                    }
                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "", bgclr = "", datawidth = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height", "width"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'width') {
                            datawidth = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }

                    }



                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + "~~~" + bgclr, childrenelement, pclassnew, ptag);
                    childelements(index, ele, pclass, subchildrenelement, pclassnew, beforeclass, ptag);


                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "img") {
                  let callimg = computeimg(element, i, 3, pclass, index, '', childrenelement);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "table") {
                    let ele = $(element)[0].childNodes[i];
                    classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;

                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    let dataheight = "", bgclr = "", valuecssb = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            for (let i in rgb) {
                                if (valuecssb) {
                                    valuecssb += "," + rgb[i];
                                } else {
                                    valuecssb += rgb[i];
                                }
                            }
                            value = valuecssb;
                            bgclr = valuecssb;
                        }

                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight, childrenelement, '', '');
                    createtable(index, ele, '', subchildrenelement, '', bgclr);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == 'span') {
                    let btag = tagname;
                    let ele = $(element)[0].childNodes[i];
                    let fincls:any;
                     classlinked = $(ele).attr('class');
                    tagname = $(ele).prop("tagName").toLowerCase();
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "", bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'background-color') {
                           // debugger;
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }


                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + "~~~" + bgclr, childrenelement, pclassnew, 'span');
                    createul(index, ele, pclass, 'span', subchildrenelement, pclassnew);


                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == 'ol') {
                  let callol = computeol(element, i);
                    subchildrenelement = paragraphelement(index, 'append', callol.fincls, callol.tagname + "~~~" + callol.dataheight + "~~~" + callol.bgclr, childrenelement, callol.pclassnew, 'ol');
                    createul(index, callol.ele, pclass, 'ol', subchildrenelement, callol.pclassnew);


                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "ul") {
                    let ele = $(element)[0].childNodes[i];
                    let innerHtml = $(ele).html();
                    classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;

                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        if (arr[0]) {
                            let pclass = arr[0];
                            classarray.push(tagname + "" + pclass);
                        }
                        classarray.push(arr);
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        let pclass = tagname;
                        fincls = tagname;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    let dataheight = "", bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }
                        if (cssprop[pclass]) {
                            cssprop[pclass] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclass] = (prop + ":" + value + "~");
                        }

                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight, childrenelement, pclassnew, "ul");
                    createul(index, ele, pclass, "ul", subchildrenelement, pclassnew);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "br") {
                    let fincls = "[No character style]";
                    let childtag = characterelement(index, fincls, "br", childrenelement, '');
                    childtag.append('<br>');
                } else {
                    let tagname = $(element).prop("tagName").toLowerCase();

                    if (($(element)[0].childNodes[i].childNodes.length) == 0 && $(element)[0].childNodes[i].nodeName.toLowerCase() != "cite") {

                        let fincls = "[No character style]";

                        if ($(element)[0].childNodes[i].nodeValue) {
                            if ($(element)[0].childNodes[i].nodeValue.trim()) {
                                let childtag = characterelement(index, fincls, tagname, childrenelement, '');
                                if ($(element)[0].childNodes.length == 1 || ($(element)[0].childNodes.length == 0 && $(element)[0].childNodes[i].nodeValue != null)) {
                                    let val = $(element)[0].childNodes[i].nodeValue;
                                    val = val.replace(/\s+/g, ' ');
                                    childtag.append('<Content>' + val + '</Content>');
                                } else if (tagname == 'p' && $(element)[0].childNodes.length > 1 && j == $(element)[0].childNodes.length) {
                                    let val = $(element)[0].childNodes[i].nodeValue;
                                    val = val.replace(/\s+/g, ' ');
                                    childtag.append('<Content>' + val + '</Content>');
                                } else {
                                    if (tagname == 'figcaption' && $(element)[0].childNodes[i].nodeValue == ".") {
                                        childtag.append('<Content>' + $(element)[0].childNodes[i].nodeValue + '</Content><br>');
                                    } else {
                                        if (tagname == 'figcaption') {
                                            childtag.append('<Content>' + $.trim($(element)[0].childNodes[i].nodeValue) + '</Content>');
                                        } else {
                                            let val = $(element)[0].childNodes[i].nodeValue;
                                            val = val.replace(/\s+/g, ' ');
                                            childtag.append('<Content>' + val + '</Content>');
                                        }
                                    }
                                }
                            }
                        }

                    } else if (($(element)[0].childNodes[i].childNodes.length) == 0 && $(element)[0].childNodes[i].nodeName.toLowerCase() == "cite") {
                        let ele = $(element)[0].childNodes[i];
                        classlinked = $(ele).attr('class');
                        let tagname = $(ele).prop("tagName").toLowerCase();
                        let fincls:any;
                        if (classlinked) {
                            fincls = "." + classlinked.replace(" ", " .");
                            let arr = fincls.split(" ");
                            pclassnew = pclassnew + " " + fincls;
                            let finarr = $.inArray(fincls, classarray);
                            if (finarr == -1) {
                                classarray.push(fincls);
                            }
                        } else {
                            fincls = tagname;
                            pclassnew = pclassnew + " " + fincls;
                            let finarr = $.inArray(fincls, classarray);
                            if (finarr == -1) {
                                classarray.push(fincls);
                            }
                        }
                        if (pclassnew) {
                            let finarrp = $.inArray(pclassnew, classarray);
                            if (finarrp == -1) {
                                classarray.push(pclassnew);
                            }
                        }
                        let dataheight = "", bgclr = "";
                        let csscomputed = $(ele).css(["color", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                        for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                            if (prop == 'color') {
                                let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                let valuecss = "";
                                for (let i in rgb) {
                                    if (valuecss) {
                                        valuecss += "," + rgb[i];
                                    } else {
                                        valuecss += rgb[i];
                                    }
                                }
                                value = valuecss;
                            }
                            if (prop == 'height') {
                                dataheight = value;
                            }

                            if (prop == 'background-color') {
                                let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                                let valuecss = "";
                                for (let i in rgb) {
                                    if (valuecss) {
                                        valuecss += "," + rgb[i];
                                    } else {
                                        valuecss += rgb[i];
                                    }
                                }
                                value = valuecss;
                                bgclr = valuecss;
                            }

                            if (cssprop[pclassnew]) {
                                cssprop[pclassnew] += (prop + ":" + value + "~");
                            } else {
                                cssprop[pclassnew] = (prop + ":" + value + "~");
                            }
                        }
                        subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight, childrenelement, pclassnew, ptag);
                        createul(index, ele, pclass, ptag, subchildrenelement, pclassnew);
                    } else {
                        if ($(element)[0].childNodes[i].childNodes.length > 1) {
                            loopchildul($(element)[0].childNodes[i], index, childrenelement, pclassnew, '');
                        } else {
                            loopchildul($(element)[0].childNodes[i], index, childrenelement, pclassnew, '');
                        }
                    }
                }
            }
        }

        let createul = (index, element, pclass, ptag, subchildrenelement, pclass2) => {
            let innerHtml = $(element).html();
            let classlinked = $(element).attr('class');
            let pclassnew = '';
            let childrenelement = '';
            if (subchildrenelement) {
                childrenelement = subchildrenelement;
            } else {
                childrenelement = parenttag[index];
            }

            let tagname = $(element).prop("tagName").toLowerCase();
            if (pclass2) {
                pclassnew = pclass2;
            } else {
                pclassnew = pclass;
            }
            let n = 1;
            for (let i = 0; i < $(element)[0].childNodes.length; i++) {
                if ($(element)[0].childNodes[i].nodeName.toLowerCase() == 'li') {
                    let ele = $(element)[0].childNodes[i];
                    m = n + "~~" + $(ele).attr('value');
                    n++;
                }
                let ele = $(element)[0].childNodes[i];
                let classlinked = $(ele).attr('class');
                if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "ol") {
                    let ele = $(element)[0].childNodes[i];
                    classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }

                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "",
                        bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m, childrenelement, pclassnew, 'ol');
                    createul(index, ele, pclass, 'ol_ol', subchildrenelement, pclassnew);

                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "img") {
                    let callimg = computeimg(element, i, 4, pclass, index, '', childrenelement);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "ul") {
                    let ele = $(element)[0].childNodes[i];
                    classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }

                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "",
                        bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m, childrenelement, pclassnew, ptag);
                    createul(index, ele, pclass, 'ul_ul', subchildrenelement, pclassnew);

                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "li" && $(element)[0].childNodes[i].childNodes.length == 3) {
                    let ele = $(element)[0].childNodes[i];
                    classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }

                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "",
                        bgclr = "",
                        liststyle = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height", "list-style-type"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'list-style-type') {
                            liststyle = value;
                        }
                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }
                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m + '~~~' + liststyle, childrenelement, pclassnew, ptag);
                    createul(index, ele, pclass, ptag, subchildrenelement, pclassnew);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "li" && ($(element)[0].childNodes[i].childNodes.length > 3 || $(element)[0].childNodes[i].childNodes.length < 3)) {
                    let ele = $(element)[0].childNodes[i];
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }

                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "", bgclr = "", liststyle = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height", "list-style-type"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }
                        if (prop == 'list-style-type') {
                            liststyle = value;
                        }
                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m + '~~~' + liststyle, childrenelement, pclassnew, ptag);
                    createul(index, ele, pclass, ptag, subchildrenelement, pclassnew);

                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "div") {
                    let ele = $(element)[0].childNodes[i];
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }

                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "", bgclr = "";
                    let csscomputed = $(ele).css(["color", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }

                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m, childrenelement, pclassnew, ptag);
                    createul(index, ele, pclass, ptag, subchildrenelement, pclassnew);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "span" && ptag == 'ol' && (classlinked == 'step-title' || classlinked == 'step-info')) {
                    let ele = $(element)[0].childNodes[i];
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }

                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }
                    let dataheight = "", bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }

                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }
                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m, childrenelement, pclassnew, ptag);
                    createul(index, ele, pclass, ptag, subchildrenelement, pclassnew);
                } else if (($(element)[0].childNodes[i].nodeName.toLowerCase() == "div") && ptag == 'ol') {
                  //call ol
                  let callol = computeol(element, i);
                  subchildrenelement = paragraphelement(index, 'append', callol.fincls, callol.tagname + "~~~" + callol.dataheight + '~~~' + m, childrenelement, callol.pclassnew, ptag);
                  createul(index, callol.ele, pclass, ptag, subchildrenelement, callol.pclassnew);
                } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "table") {
                    let ele = $(element)[0].childNodes[i];
                    let classlinked = $(ele).attr('class');
                    let tagname = $(ele).prop("tagName").toLowerCase();
                    let fincls:any;
                    if (classlinked) {
                        fincls = "." + classlinked.replace(" ", " .");
                        let arr = fincls.split(" ");
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    } else {
                        fincls = tagname;
                        pclassnew = pclassnew + " " + fincls;
                        let finarr = $.inArray(fincls, classarray);
                        if (finarr == -1) {
                            classarray.push(fincls);
                        }
                    }
                    if (pclassnew) {
                        let finarrp = $.inArray(pclassnew, classarray);
                        if (finarrp == -1) {
                            classarray.push(pclassnew);
                        }
                    }

                    let dataheight = "", datawidth = "", bgclr = "";
                    let csscomputed = $(ele).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                    for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                        if (prop == 'color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                        }
                        if (prop == 'height') {
                            dataheight = value;
                        }

                        if (prop == 'background-color') {
                            let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                            let valuecss = "";
                            for (let i in rgb) {
                                if (valuecss) {
                                    valuecss += "," + rgb[i];
                                } else {
                                    valuecss += rgb[i];
                                }
                            }
                            value = valuecss;
                            bgclr = valuecss;
                        }

                        if (cssprop[pclassnew]) {
                            cssprop[pclassnew] += (prop + ":" + value + "~");
                        } else {
                            cssprop[pclassnew] = (prop + ":" + value + "~");
                        }
                    }

                    subchildrenelement = paragraphelement(index, 'append', fincls, tagname + "~~~" + dataheight + '~~~' + m, childrenelement, pclassnew, '');
                    createtable(index, ele, pclass, subchildrenelement, pclassnew, '');
                } else {
                    if (($(element)[0].childNodes[i].childNodes.length) == 0) {
                        let fincls = "[No character style]";
                        if ($(element)[0].childNodes[i].nodeValue) {
                            if ($(element)[0].childNodes[i].nodeValue.trim()) {
                                let childtag = characterelement(index, fincls, tagname, childrenelement, pclassnew);
                                let val = $(element)[0].childNodes[i].nodeValue;
                                val = val.replace(/\s+/g, ' ');
                                childtag.append('<Content>' + val + '</Content>');
                            }
                        }
                    } else {
                        if ($(element)[0].childNodes[i].childNodes.length > 0) {
                            loopchildul($(element)[0].childNodes[i], index, childrenelement, pclassnew, '');
                        } else {
                            loopchildul($(element)[0].childNodes[i], index, childrenelement, pclassnew, '');
                        }
                    }
                }
            }
        }

        let loopchildul = (elements, index, childrenelement, pclassnew, brval) => {
            let classlinked = $(elements).attr('class');
            let tagname = $(elements).prop("tagName").toLowerCase();
            let fincls:any;
            let epsid:any;
            if ($(elements).prop("tagName").toLowerCase() == "math") {
                epsid = $(elements).attr('data-uuid');
                $(elements).html(epsid);
            }
            if (classlinked) {
                fincls = "." + classlinked.replace(" ", " .");
                let arr = fincls.split(" ");
                pclassnew = pclassnew + " " + fincls;
                let finarr = $.inArray(fincls, classarray);
                if (finarr == -1) {
                    classarray.push(fincls);
                }
            } else {
                fincls = tagname;
                pclassnew = pclassnew + " " + fincls;
                let finarr = $.inArray(fincls, classarray);
                if (finarr == -1) {
                    classarray.push(fincls);
                }
            }

            if (pclassnew) {
                let finarrp = $.inArray(pclassnew, classarray);
                if (finarrp == -1) {
                    classarray.push(pclassnew);
                }

            }
            let bgclr = "",
                bwidth = "",
                wid = "",
                hgt = "",
                bdclr = "";
            let csscomputed = $(elements).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "border-bottom-width", "border-bottom-color", "width", "height"]);
            for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                if (prop == 'border-bottom-width') {
                    bwidth = value;
                }
                if (prop == 'width') {
                    wid = value;
                }
                if (prop == 'height') {
                    hgt = value;
                }

                if (prop == 'color') {
                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                    let valuecss = "";
                    for (let i in rgb) {
                        if (valuecss) {
                            valuecss += "," + rgb[i];
                        } else {
                            valuecss += rgb[i];
                        }
                    }
                    value = valuecss;
                }

                if (prop == 'background-color') {
                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                    let valuecss = "";
                    for (let i in rgb) {
                        if (valuecss) {
                            valuecss += "," + rgb[i];
                        } else {
                            valuecss += rgb[i];
                        }
                    }
                    value = valuecss;
                    bgclr = valuecss;
                }

                if (prop == 'border-bottom-color') {
                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                    let valuecssd = "";
                    for (let i in rgb) {
                        if (valuecssd) {
                            valuecssd += "," + rgb[i];
                        } else {
                            valuecssd += rgb[i];
                        }
                    }
                    value = valuecssd;
                    bdclr = valuecssd;
                }

                if (cssprop[pclassnew]) {
                    cssprop[pclassnew] += (prop + ":" + value + "~");
                } else {
                    cssprop[pclassnew] = (prop + ":" + value + "~");
                }
            }
            if (elements.length) {
                let childtag = characterelement(index, fincls, tagname, childrenelement, pclassnew);
                let tempsting = content(elements, tagname);
                childtag.append(tempsting);
            } else {
                if (elements.childNodes.length > 0) {
                    let tagname = $(elements).prop("tagName").toLowerCase();
                    for (let z = 0, j = 1; z < elements.childNodes.length; z++, j++) {
                        if (tagname == 'p' && elements.childNodes.length == 1 && elements.childNodes[z].nodeValue == null) {
                            loopchildul(elements.childNodes[z], index, childrenelement, pclassnew, true);
                        } else if (elements.childNodes[z].childNodes.length > 0) {
                            loopchildul(elements.childNodes[z], index, childrenelement, pclassnew, false);
                        } else {
                            if (tagname == "math") {
                                let childtag = characterelement(index, fincls, tagname + "~~~" + wid + "~~~" + epsid + "~~~" + hgt, childrenelement, pclassnew);
                                let tempsting = '<Content>&nbsp;</Content>';
                                childtag.append(tempsting);
                            } else if (j == 3 && tagname == 'li') {
                                let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, '');
                                let tempsting = content2(elements.childNodes[z], tagname, false, '');
                                childtag.append(tempsting);
                            } else {
                                if (elements.childNodes[z].nodeValue) {
                                    let str = '';
                                    if (tagname == 'span') {
                                        str = elements.childNodes[z].nodeValue;
                                    } else {
                                        str = $.trim(elements.childNodes[z].nodeValue);
                                    }
                                    if (str) {
                                        if (tagname != "span" && tagname != "i" && elements.childNodes.length == 1 && j == elements.childNodes.length) {
                                            let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, '');
                                            if (brval) {
                                                let val = elements.childNodes[z].nodeValue;
                                                val = val.replace(/\s+/g, ' ');
                                                childtag.append('<Content>' + val + '</Content>');
                                            } else {
                                                let tempsting = content2(elements.childNodes[z], tagname, false, fincls);
                                                childtag.append(tempsting);
                                            }
                                        } else if (elements.childNodes.length > 1 && j != elements.childNodes.length) {
                                            let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, '');
                                            let tempsting = content2(elements.childNodes[z], tagname, true, fincls);
                                            childtag.append(tempsting);
                                        } else if (elements.childNodes.length > 1 && j == elements.childNodes.length) {
                                            let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, '');
                                            let tempsting = content2(elements.childNodes[z], tagname, false, fincls);
                                            childtag.append(tempsting);
                                        } else {
                                            bwidth = bwidth.replace("px", "");
                                            wid = wid.replace("px", "");
                                            if (tagname == "span" && !elements.childNodes[z].nodeValue && bwidth) {
                                                let linw = "";
                                                for (let w = 5; w < ((parseInt(wid)) - w); w += 5) {
                                                    linw += "_";
                                                }
                                                let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, bwidth + "---" + wid + "---" + bdclr);
                                                childtag.append('<Content>' + linw + '</Content>');

                                            } else {
                                                let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, '');
                                                let tempsting = content2(elements.childNodes[z], tagname, false, fincls);
                                                childtag.append(tempsting);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    let childtag = characterelement(index, fincls, tagname, childrenelement, pclassnew);
                    let tempsting = content2(elements, tagname, false, fincls);
                    childtag.append(tempsting);
                }
            }
        }

        let loopchild = (elements, index, childrenelement, pclassnew) => {
            let classlinked = $(elements).attr('class');
            let tagname = $(elements).prop("tagName").toLowerCase();
            let fincls:any;
            if ($(elements).prop("tagName").toLowerCase() == "math") {
                let epsid = $(elements).attr('data-uuid');
                $(elements).html(epsid);
            }
            if (classlinked) {
                fincls = "." + classlinked.replace(" ", " .");
                let arr = fincls.split(" ");
                pclassnew = pclassnew + " " + fincls;
                let finarr = $.inArray(fincls, classarray);
                if (finarr == -1) {
                    classarray.push(fincls);
                }
            } else {
                fincls = tagname;
                pclassnew = pclassnew + " " + fincls;
                let finarr = $.inArray(fincls, classarray);
                if (finarr == -1) {
                    classarray.push(fincls);
                }
            }

            if (pclassnew) {
                let finarrp = $.inArray(pclassnew, classarray);
                if (finarrp == -1) {
                    classarray.push(pclassnew);
                }
            }
            let bgclr = "";
            let csscomputed = $(elements).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font"]);
            for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                if (prop == 'color') {
                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                    let valuecss = "";
                    for (let i in rgb) {
                        if (valuecss) {
                            valuecss += "," + rgb[i];
                        } else {
                            valuecss += rgb[i];
                        }
                    }
                    value = valuecss;
                }

                if (prop == 'background-color') {
                    let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                    let valuecss = "";
                    for (let i in rgb) {
                        if (valuecss) {
                            valuecss += "," + rgb[i];
                        } else {
                            valuecss += rgb[i];
                        }
                    }
                    value = valuecss;
                    bgclr = valuecss;

                }

                if (cssprop[pclassnew]) {
                    cssprop[pclassnew] += (prop + ":" + value + "~");
                } else {
                    cssprop[pclassnew] = (prop + ":" + value + "~");
                }

            }
            if (elements.length) {
                let childtag = characterelement(index, fincls, tagname, childrenelement, pclassnew);
                let tempsting = content(elements, tagname);
                childtag.append(tempsting);
            } else {
                if (elements.childNodes.length > 0) {
                    for (let z = 0; z < elements.childNodes.length; z++) {
                        if (elements.childNodes[z].childNodes.length > 0) {
                            loopchild(elements.childNodes[z], index, '', '');
                        } else {
                            let childtag = characterelement1(index, elements, fincls, tagname, childrenelement, pclassnew, '');
                            let tempsting = content(elements.childNodes[z], tagname)
                            childtag.append(tempsting);
                        }
                    }
                } else {
                    let childtag = characterelement(index, fincls, tagname, childrenelement, pclassnew);
                    let tempsting = content(elements, tagname);
                    childtag.append(tempsting);
                }
            }
        }

        let content = (elementvalue, tagname) => {
            let val = elementvalue.nodeValue;
            if (tagname == 'dfn') {
                val = val;
            } else {
                val = val.replace(/\s+/g, ' ');
            }
            if (val != null) {
                return '<Content>' + val + '</Content>';
            } else {
                return '<Content>' + elementvalue.innerText + '</Content><br>';
            }
        }

        let content2 = (elementvalue, tagname, brval, fincls) => {
            let val = elementvalue.nodeValue;
            if (tagname == 'dfn') {
                val = val;
            } else {
                val = val.replace(/\s+/g, ' ');
            }
            if (val != null) {
                if (tagname == 'p' && brval == true) {
                    return '<Content>' + val + '</Content>';
                }
                if (tagname == 'span' && fincls == '.color4') {
                    return '<Content>' + val + '  </Content>';
                } else {
                    return '<Content>' + val + '</Content>';
                }
            } else {
                return '<Content>' + elementvalue.innerText + '</Content>';
            }
        }

        $('.hiddenelement').children().each(function (index) {
            if ($(this).prop("tagName").toLowerCase() == "div" || $(this).prop("tagName").toLowerCase() == "cite" || $(this).prop("tagName").toLowerCase() == "header" || $(this).prop("tagName").toLowerCase() == "p" || $(this).prop("tagName").toLowerCase() == "aside" || $(this).prop("tagName").toLowerCase() == "figure" || $(this).prop("tagName").toLowerCase() == "blockquote" || $(this).prop("tagName").toLowerCase() == "h1" || $(this).prop("tagName").toLowerCase() == "h2" || $(this).prop("tagName").toLowerCase() == "h3" || $(this).prop("tagName").toLowerCase() == "h4" || $(this).prop("tagName").toLowerCase() == "h5" || $(this).prop("tagName").toLowerCase() == "h6" || $(this).prop("tagName").toLowerCase() == "section" || $(this).prop("tagName").toLowerCase() == "span") {
                let innerHtml = $(this).html();
                let classlinked = $(this).attr('class');
                let tagname = $(this).prop("tagName").toLowerCase();
                let fincls:any;
                let pclass = '';
                if (classlinked) {
                     fincls = "." + classlinked.replace(" ", " .");
                    let arr = fincls.split(" ");
                    pclass = fincls;
                    classarray.push(arr);
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                } else {
                    pclass = tagname;
                     fincls = tagname;
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                }
                let dataheight = "",
                    bgclr = "";
                let csscomputed = $(this).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                    if (prop == 'color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                    }
                    if (prop == 'height') {
                        dataheight = value;
                    }
                    if (prop == 'background-color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                        bgclr = valuecss;

                    }
                    if (cssprop[pclass]) {
                        cssprop[pclass] += (prop + ":" + value + "~");
                    } else {
                        cssprop[pclass] = (prop + ":" + value + "~");
                    }

                }
                paragraphelement(index, 'add', fincls, tagname + "~~~" + dataheight + "~~~" + bgclr, '', '', tagname);
                childelements(index, this, pclass, '', '', fincls, tagname);
            } else if ($(this).prop("tagName").toLowerCase() == "span") {
                let innerHtml = $(this).html();
                let classlinked = $(this).attr('class');
                let tagname = $(this).prop("tagName").toLowerCase();
                let pclass = '';
                let fincls:any;
                if (classlinked) {
                    fincls = "." + classlinked.replace(" ", " .");
                    let arr = fincls.split(" ");
                    if (arr[0]) {
                        pclass = arr[0];
                        classarray.push(tagname + "" + pclass);
                    }
                    classarray.push(arr);
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                } else {
                    pclass = tagname;
                    fincls = tagname;
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                }
                let dataheight = "",
                    bgclr = "";
                let csscomputed = $(this).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                   // debugger;
                    if (prop == 'color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                    }
                    if (prop == 'height') {
                        dataheight = value;
                    }
                    if (prop == 'background-color') {
                      //  debugger;
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                        bgclr = valuecss;
                    }

                    if (cssprop[pclass]) {
                        cssprop[pclass] += (prop + ":" + value + "~");
                    } else {
                        cssprop[pclass] = (prop + ":" + value + "~");
                    }

                }
                paragraphelement(index, 'add', fincls, tagname + "~~~" + dataheight, '', '', '');
                createul(index, this, pclass, 'span', '', '');
            } else if ($(this).prop("tagName").toLowerCase() == "ol") {
                let innerHtml = $(this).html();
                let classlinked = $(this).attr('class');
                let tagname = $(this).prop("tagName").toLowerCase();
                let pclass = '';
                let fincls:any;
                if (classlinked) {
                    fincls = "." + classlinked.replace(" ", " .");
                    let arr = fincls.split(" ");
                    if (arr[0]) {
                        pclass = arr[0];
                        classarray.push(tagname + "" + pclass);
                    }
                    classarray.push(arr);
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                } else {
                    pclass = tagname;
                    fincls = tagname;
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                }
                let dataheight = "",
                    bgclr = "";
                let csscomputed = $(this).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                    if (prop == 'color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                    }

                    if (prop == 'background-color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                        bgclr = valuecss;
                    }
                    if (prop == 'height') {
                        dataheight = value;
                    }

                    if (cssprop[pclass]) {
                        cssprop[pclass] += (prop + ":" + value + "~");
                    } else {
                        cssprop[pclass] = (prop + ":" + value + "~");
                    }

                }

                paragraphelement(index, 'add', fincls, tagname + "~~~" + dataheight + "~~~" + bgclr, '', '', '');
                createul(index, this, pclass, 'ol', '', '');
            } else if ($(this).prop("tagName").toLowerCase() == "ul") {
                let innerHtml = $(this).html();
                let classlinked = $(this).attr('class');
                let tagname = $(this).prop("tagName").toLowerCase();
                let pclass = '';
                let fincls:any;
                if (classlinked) {
                    fincls = "." + classlinked.replace(" ", " .");
                    let arr = fincls.split(" ");
                    if (arr[0]) {
                        pclass = arr[0];
                        classarray.push(tagname + "" + pclass);
                    }
                    classarray.push(arr);
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                } else {
                    pclass = tagname;
                    fincls = tagname;
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                }
                let dataheight = "",
                    bgclr = "";
                let csscomputed = $(this).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                    if (prop == 'color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                    }
                    if (prop == 'height') {
                        dataheight = value;
                    }
                    if (prop == 'background-color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                        bgclr = valuecss;
                    }

                    if (cssprop[pclass]) {
                        cssprop[pclass] += (prop + ":" + value + "~");
                    } else {
                        cssprop[pclass] = (prop + ":" + value + "~");
                    }

                }
                paragraphelement(index, 'add', fincls, tagname + "~~~" + dataheight, '', '', '');
                createul(index, this, pclass, 'ul', '', '');
            } else if ($(this).prop("tagName").toLowerCase() == "table") {
                let classlinked = $(this).attr('class');
                let tagname = $(this).prop("tagName").toLowerCase();
                let pclass = '';
                let fincls:any;
                if (classlinked) {
                    fincls = "." + classlinked.replace(" ", " .");
                    let arr = fincls.split(" ");
                    if (arr[0]) {
                        pclass = arr[0];
                        classarray.push(tagname + "" + pclass);
                    }
                    classarray.push(arr);
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                } else {
                    pclass = tagname;
                    fincls = tagname;
                    let finarr = $.inArray(fincls, classarray);
                    if (finarr == -1) {
                        classarray.push(fincls);
                    }
                }
                let bgclr = "",
                    dataheight = "";
                let csscomputed = $(this).css(["color", "text-indent", "background-color", "margin-top", "margin-bottom", "margin-left", "margin-right", "font-size", "font-family", "font-style", "font-weight", "line-height", "padding-top", "padding-bottom", "padding-left", "padding-right", "border-bottom", "border-top", "text-align", "text-decoration", "white-space", "text-transform", "font", "height"]);
                for(var style in csscomputed){
                        let prop = style;
                        let value = csscomputed[style];
                    if (prop == 'color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                    }
                    if (prop == 'height') {
                        dataheight = value;
                    }
                    if (prop == 'background-color') {
                        let rgb = value.replace(/^(rgb|rgba)\(/, '').replace(/\)$/, '').replace(/\s/g, '').split(',');
                        let valuecss = "";
                        for (let i in rgb) {
                            if (valuecss) {
                                valuecss += "," + rgb[i];
                            } else {
                                valuecss += rgb[i];
                            }
                        }
                        value = valuecss;
                        bgclr = valuecss;
                    }
                    if (cssprop[pclass]) {
                        cssprop[pclass] += (prop + ":" + value + "~");
                    } else {
                        cssprop[pclass] = (prop + ":" + value + "~");
                    }

                }
                paragraphelement(index, 'add', fincls, tagname + "~~~" + dataheight, '', '', '');
                createtable(index, this, pclass, '', '', bgclr);
            }
        })
        for (let i = 0; i < parenttag.length; i++) {
            $('.outputelement').append(parenttag[i]);
        }


        let classstring = classarray.toString();
        $(".cssoutputelement").html(classstring);
        for (let index in cssprop) {
            if (!cssprop.hasOwnProperty(index)) {
                continue;
            }
            this.cssconvert(index, cssprop[index]);
        }
        await this.resolveAfter2Seconds();
        this.stepbg();
    }

    cssconvert(key, values) {
        let csskey = key;
        let cssstring = values;
        let cssarray = cssstring.split('~');
        let maintag = '';
        let chartag = '';
        let maininnertag = "";
        let nmaininnertag = "";
        let charinnertag = "";
        let fontcss = "";
        let output = {
            paragraphtags: "",
            charactertags: "",
            colortags: "",
            colorarr: ""
        };
        let colortag = "";
        let colorarr = [];
        let excssarray = [];
        let value1;
        let value2;
        let key2;
        let rgbstr;
        let rgbstr2;
        let exrgb;
        let bgarr;
        let ramaininnertag = '';
        let racharinnertag = '';
        let mainbgtag = '';
        let rascharinnertag = '';
        let rasmaininnertag = '';
        let fmaininnertag:any;
        let lcharinnertag:any;
        let fcharinnertag:any;
        let lmaininnertag:any;

        let keyval = csskey.replace(/ /g, '_');
        let keyval2 = keyval.replace(/[.]/g, '');
        if (csskey != 'ul li') {
            maintag += '<ParagraphStyle Self="ParagraphStyle/' + keyval2 + '" Name="' + keyval2 + '" Imported="false" NextStyle="ParagraphStyle/' + keyval2 + '" KeyboardShortcut="0 0" ';
            chartag += '<CharacterStyle Self="CharacterStyle/' + keyval2 + '" Name="' + keyval2 + '" Imported="false" KeyboardShortcut="0 0"';

            for (let i = 0; i < cssarray.length; i++) {
                value1 = cssarray[i];
                if (value1) {
                    value1 = value1.split(':');
                    key2 = value1[0];
                    value2 = value1[1];
                    value2 = value2.replace(/!important/g, ''); 

                    if (key2 == 'white-space') {
                        if ((value2.trim()) == "nowrap") {
                            maintag += ' NoBreak="true"';
                            chartag += ' NoBreak="true"';
                        }
                    }
                    if (key2 == 'font-weight') {
                        if (value2 > 500) {
                            maintag += ' FontStyle="Bold" ';
                            chartag += ' FontStyle="Bold" ';
                        }
                    }
                    if (key2 == 'font-style') {
                        if (value2 == 'italic') {
                            maintag += ' FontStyle="Regular Italic" ';
                            chartag += ' FontStyle="Regular Italic" ';
                        }
                    }
                    if (key2 == 'text-align') {
                        if (value2 == 'right') {
                            maintag += ' Justification="RightAlign"';
                            chartag += ' Justification="RightAlign"';
                        }
                    }
                    if (key2 == 'margin-top') {
                        maintag += ' SpaceBefore="' + value2 + '" ';
                        chartag += ' SpaceBefore="' + value2 + '" ';
                    }

                    if (key2 == 'font') {
                        let fontarr = (value2.trim()).split(" ");
                        if (fontarr[0] == "italic" && (fontarr[2] == "bold" || fontarr[2] > 500)) {
                            if ((fontarr[7].indexOf('arumsans')) == 1) {
                                maintag += ' FontStyle="BoldItalic" ';
                                chartag += ' FontStyle="BoldItalic" ';
                            } else {
                                maintag += ' FontStyle="Bold Italic" ';
                                chartag += ' FontStyle="Bold Italic" ';
                            }
                        } else if (fontarr[2] > 500 || fontarr[2] == "bold") {
                            maintag += ' FontStyle="Bold" ';
                            chartag += ' FontStyle="Bold" ';
                        } else if (fontarr[0] == "normal" && (fontarr[2] != "bold" || fontarr[2] < 500)) {
                            if (fontarr[7] != 'stix') {
                                maintag += ' FontStyle="Regular" ';
                                chartag += ' FontStyle="Regular" ';
                            }
                        } else if (fontarr[0] == "italic" && (fontarr[2] != "bold" || fontarr[2] < 500)) {
                            if (fontarr[7]) {
                                fontarr[7] = fontarr[7].replace(/,/g, "");

                                if (fontarr[7] == 'proximanova') {
                                    maintag += ' FontStyle="Regular Italic" ';
                                    chartag += ' FontStyle="Regular Italic" ';
                                }
                                if ((fontarr[7].indexOf('arumsans')) == 1) {
                                    maintag += ' FontStyle="RegularItalic" ';
                                    chartag += ' FontStyle="RegularItalic" ';
                                } else {
                                    maintag += ' FontStyle="Italic" ';
                                    chartag += ' FontStyle="Italic" ';
                                }
                            }
                        }

                    }
                    
                    if (key2 == 'font-family') {
                        let m = value2.split(',');
                        
                        if (m[0] == "stix") {
                            fmaininnertag = '<AppliedFont type="string">STIXGeneral</AppliedFont>';
                            fcharinnertag = '<AppliedFont type="string">STIXGeneral</AppliedFont>';
                        } else if (m[0] == "stixregular") {
                            fmaininnertag = '<AppliedFont type="string">STIXGeneral</AppliedFont>';
                            fcharinnertag = '<AppliedFont type="string">STIXGeneral</AppliedFont>';
                        } else if (m[0] == "proximanova") {
                            fmaininnertag = '<AppliedFont type="string">Proxima Nova (OTF)</AppliedFont>';
                            fcharinnertag = '<AppliedFont type="string">Proxima Nova (OTF)</AppliedFont>';
                        } else if (m[0] == "Myriad Pro" || m[0].indexOf('Myriad') == 1) {
                            fmaininnertag = '<AppliedFont type="string">Myriad Pro</AppliedFont>';
                            fcharinnertag = '<AppliedFont type="string">Myriad Pro</AppliedFont>';
                        } else if (m[0] == "arumsansbd" || m[0].indexOf('arumsans') == 1) {
                            fmaininnertag = '<AppliedFont type="string">ArumSans</AppliedFont>';
                            fcharinnertag = '<AppliedFont type="string">ArumSans</AppliedFont>';
                        } else {
                            fmaininnertag = '<AppliedFont type="string">Proxima Nova (OTF)</AppliedFont>';
                            fcharinnertag = '<AppliedFont type="string">Proxima Nova (OTF)</AppliedFont>';
                        }

                    } else {}

                    if (key2 == "list-style-type") {
                        if (value2 == "lower-alpha") {
                            nmaininnertag = '<NumberingFormat type="string">a, b, c, d...</NumberingFormat>';
                        } else if (value2 == "upper-alpha") {
                            nmaininnertag = '<NumberingFormat type="string">A, B, C, D...</NumberingFormat>';
                        } else if (value2 == "lower-roman") {
                            nmaininnertag = '<NumberingFormat type="string">i, ii, iii, iv...</NumberingFormat>';
                        } else if (value2 == "upper-roman") {
                            nmaininnertag = '<NumberingFormat type="string">I, II, III, IV...</NumberingFormat>';
                        } else if (value2 == "disc") {
                            nmaininnertag = '<BulletChar BulletCharacterType="UnicodeOnly" BulletCharacterValue="8729" />';
                        } else {
                            nmaininnertag = '';
                        }

                    }

                    if (key2 == "font-size") {
                        let fontsize;
                        if (value2.search(/px/i) !== -1) {
                            value2 = value2.replace(/px/g, '');
                            fontsize = value2 * 0.75;
                            fontsize = Number((fontsize).toFixed());
                            if (fontsize == '14.25' || fontsize == '11.4' || fontsize == '14') {
                                fontsize = '10';
                            } else if (fontsize == '28.5' || fontsize == '29' || fontsize == '28') {
                                fontsize = '19';
                            } else if (fontsize == '12.749475' || fontsize == '12.1125' || fontsize == '12' || fontsize == '13') {
                                fontsize = '9';
                            } else if (fontsize == '21.375' || fontsize == '21') {
                                fontsize = '15';
                            } else if (fontsize == "18") {
                                fontsize = '13';
                            }

                            maintag += ' PointSize="' + fontsize + '" ';
                            chartag += ' PointSize="' + fontsize + '" ';

                        }
                        if (value2.search(/em/i) !== -1) {
                            value2 = value2.replace(/em/g, '');
                            fontsize = value2 * 12;
                            maintag += ' PointSize="' + fontsize + '" ';
                            chartag += ' PointSize="' + fontsize + '" ';
                        }
                    }

                    if (key2 == 'line-height') {
                        let lineheight, lmaininnertag, lcharinnertag;
                        if (value2.search(/px/i) !== -1) {
                            value2 = parseInt(value2.replace(/px/g, ''));
                            lineheight = value2 * 0.75;
                            lmaininnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                            lcharinnertag = '<Leading type="unit">' + lineheight + '</Leading>';

                        } else if (value2.search(/em/i) !== -1) {
                            value2 = value2.replace(/em/g, '');
                            lineheight = value2 * 12;
                            lmaininnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                            lcharinnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                        } else if (value2.search(/%/i) !== -1) {
                            value2 = value2.replace(/%/g, '');
                            lineheight = (value2 / 100) * 12;
                            lmaininnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                            lcharinnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                        } else {
                            lineheight = value2 * 0.75;
                            lmaininnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                            lcharinnertag = '<Leading type="unit">' + lineheight + '</Leading>';
                        }
                    }

                    if (key2 == 'text-align') {
                        if ((value2.trim()) == 'left') {
                            maintag += ' Justification="LeftAlign"';
                            chartag += ' Justification="LeftAlign"';
                        }
                        if ((value2.trim()) == 'right') {
                            maintag += ' Justification="RightAlign"';
                            chartag += ' Justification="RightAlign"';
                        }
                        if ((value2.trim()) == 'bottom') {
                            maintag += ' Justification="BottomAlign"';
                            chartag += ' Justification="BottomAlign"';
                        }
                        if ((value2.trim()) == 'justify') {
                            maintag += ' Justification="FullyJustified"';
                            chartag += ' Justification="FullyJustified"';
                        }

                    }
                    
                    if (key2 == 'text-decoration') {
                        let tdnarr = (value2.trim()).split(" ");
                        if ((tdnarr[0].trim()) == 'underline') {
                            maintag += ' Underline="true"';
                            chartag += ' Underline="true"';
                        }
                    }
                    
                    if (key2 == 'text-transform') {
                        if ((value2.trim()) == 'uppercase') {
                            maintag += ' Capitalization="AllCaps"';
                            chartag += ' Capitalization="AllCaps"';
                        }
                    }
                    
                    if (key2 == 'border-bottom') {}

                    if (key2 == 'border-top') {
                        let borderw;
                        let borderval = value2.split(" ");
                        let bval1 = borderval[0];
                        let bval2 = borderval[1];
                        let bval3 = borderval[2];
                        let bval4 = borderval[3];
                        let bval5 = borderval[4];
                        bval3 = bval3.replace(/rgb[(]/g, '');
                        bval5 = bval5.replace(/[)]/g, '');
                        bval3 = bval3 + bval4 + bval5;

                        if (bval1.search(/px/i) !== -1) {
                            bval1 = bval1.replace(/px/g, '');
                            borderw = bval1 * 0.75;
                        }
                        if (bval1.search(/em/i) !== -1) {
                            bval1 = bval1.replace(/em/g, '');
                            borderw = bval1 * 12;
                        }
                        if (bval1 > 0) {
                            if (bval1) {
                                maintag += ' RuleAboveLineWeight="' + borderw + '" ';
                                chartag += ' RuleAboveLineWeight="' + borderw + '" ';
                            }

                            if ((bval2.trim()) == 'solid') {
                                rasmaininnertag = '<RuleAboveType type="object">StrokeStyle/Solid</RuleAboveType>';
                                rascharinnertag = '<RuleAboveType type="object">StrokeStyle/Solid</RuleAboveType>';
                            }

                            if ((bval3.trim()) != "") {
                                value2 = (bval3.trim());
                                rgbstr = bval3.replace(/,/g, '');
                                rgbstr2 = bval3.replace(/,/g, ' ');
                                exrgb = bval3.split(",");

                                if (colorarr.indexOf(rgbstr2) == 1) {} else {
                                    colorarr.push(rgbstr2);
                                }

                                ramaininnertag = '<RuleAboveColor type="object">Color/R=' + exrgb[0] + ' G=' + exrgb[1] + ' B=' + exrgb[2] + '</RuleAboveColor>';
                                racharinnertag = '<RuleAboveColor type="object">Color/R=' + exrgb[0] + ' G=' + exrgb[1] + ' B=' + exrgb[2] + '</RuleAboveColor>';
                            }

                            maintag += ' RuleAboveOffset="-5" RuleAboveLeftIndent="0" RuleAboveRightIndent="0" RuleAbove="true"  RuleAboveTint="100" RuleAboveWidth="TextWidth"';
                            chartag += ' RuleAboveOffset="-5" RuleAboveLeftIndent="0" RuleAboveRightIndent="0" RuleAbove="true"  RuleAboveTint="100" RuleAboveWidth="TextWidth"';
                        }
                    }
                    
                    if (key2 == 'margin-bottom' || key2 == 'margin-left' || key2 == 'margin-right' || key2 == 'text-indent') {
                        let padding = 5;
                        maintag += ' SpaceBefore="' + padding + '" ';
                        chartag += ' SpaceBefore="' + padding + '" ';
                    }

                    if (key2 == 'padding-top') {
                        if (value2.search(/px/i) !== -1) {
                            value2 = value2.replace(/px/g, '');
                            let padding = value2 * 0.75;
                            maintag += ' ParagraphShadingTopOffset="' + padding + '" ';
                        }
                        if (value2.search(/em/i) !== -1) {
                            value2 = value2.replace(/em/g, '');
                            let padding = value2 * 12;
                            maintag += ' ParagraphShadingTopOffset="' + padding + '" ';
                        }
                    }
                    
                    if (key2 == 'padding-bottom') {
                        if (value2.search(/px/i) !== -1) {
                            value2 = value2.replace(/px/g, '');
                            let padding = value2 * 0.75;
                            maintag += ' ParagraphShadingBottomOffset="' + padding + '" ';

                        }
                        if (value2.search(/em/i) !== -1) {
                            value2 = value2.replace(/em/g, '');
                            let padding = value2 * 12;
                            maintag += ' ParagraphShadingBottomOffset="' + padding + '" ';
                        }
                    }

                    if (key2 == "background-color") {
                        value2 = (value2.trim());
                        rgbstr = value2.replace(/,/g, '');
                        rgbstr2 = value2.replace(/,/g, ' ');
                        bgarr = value2.split(",");

                        let bgarrval;

                        if (bgarr.length == 3) {
                            maintag += 'ParagraphShadingOn="true" ParagraphShadingTint="100" ';
                            bgarrval = bgarr[0] + bgarr[1] + bgarr[2];
                            mainbgtag = '<ParagraphShadingColor type="object">Color/R=' + (bgarr[0].trim()) + ' G=' + (bgarr[1].trim()) + ' B=' + (bgarr[2].trim()) + '</ParagraphShadingColor>';
                        } else {
                            bgarrval = bgarr[0] + bgarr[1] + bgarr[2] + bgarr[3];
                            if (bgarr[0] == bgarr[1] && bgarr[1] == bgarr[2] && bgarr[2] == bgarr[3] && bgarr[3] == 0) {
                            } else {
                                maintag += 'ParagraphShadingOn="true" ParagraphShadingTint="100" ParagraphShadingTopOffset="5" ParagraphShadingBottomOffset="5"';
                                mainbgtag = '<ParagraphShadingColor type="object">Color/C=' + (bgarr[0].trim()) + ' M=' + (bgarr[1].trim()) + ' Y=' + (bgarr[2].trim()) + ' K=' + (bgarr[3].trim()) + '</ParagraphShadingColor>';
                            }
                        }
                        if (colorarr.indexOf(rgbstr2) == 1) {} else {
                            colorarr.push(rgbstr2);
                        }
                    }

                    if (key2 == "color") {
                        value2 = (value2.trim());
                        rgbstr = value2.replace(/,/g, '');
                        rgbstr2 = value2.replace(/,/g, ' ');
                        exrgb = value2.split(",");
                        maintag += 'FillColor="Color/R=' + exrgb[0] + ' G=' + exrgb[1] + ' B=' + exrgb[2] + '" ';
                        chartag += 'FillColor="Color/R=' + exrgb[0] + ' G=' + exrgb[1] + ' B=' + exrgb[2] + '" ';

                        if (colorarr.indexOf(rgbstr2) == 1) {} else {
                            colorarr.push(rgbstr2);
                        }
                    }
                }
            }

            maintag += '><Properties><BasedOn type="string">ID/[No paragraph style]</BasedOn> <PreviewColor type = "enumeration"> Nothing </PreviewColor>' + maininnertag + '' + fmaininnertag + '' + lmaininnertag + '' + rasmaininnertag + '' + ramaininnertag + '' + (mainbgtag) + '' + (nmaininnertag) + ' </Properties> </ParagraphStyle> ';
            chartag += '><Properties><BasedOn type="string">ID/[No character style]</BasedOn> <PreviewColor type = "enumeration" > Nothing </PreviewColor>' + charinnertag + '' + fcharinnertag + '' + lcharinnertag + '' + rascharinnertag + '' + racharinnertag + ' </Properties> </CharacterStyle > ';
        }
        output['paragraphtags'] = maintag;
        output['charactertags'] = chartag;
        output['colortags'] = colortag;
        let colorvalues = colorarr.join(",");
        output['colorarr'] = colorvalues;
        $('.cssstyletagspara').append(maintag);
        $('.cssstyletagschar').append(chartag);
        $('.cssstyletagscolor').append(colortag);
        if (colorvalues) {
            this.csscolorarr.push(colorvalues);
        }

    }

    async stepbg() {
        let i = 1;
        let filclr = '';
        let callFunction = (index, obj) => {
            this.stepbg2(index, obj, '');
        }
        $('.outputelement').children().each(function (index) {
            if ($(this).prop("tagName").toLowerCase() == "paragraphstylerangeaside") {
                let bgclr = $(this).attr("bg");
                let rcarr = bgclr.split(',');
                if (rcarr.length == 4) {
                    filclr = 'Color/C=' + rcarr[0] + ' M=' + rcarr[1] + ' Y=' + rcarr[2] + ' K=' + rcarr[3];
                } else {
                    filclr = 'Color/R=' + rcarr[0] + ' G=' + rcarr[1] + ' B=' + rcarr[2];
                }
                let strh = $(this).attr("data-height");
                let ah = (parseInt(strh.replace("px", "")) * 0.75) - 60;
                //debugger;
                if (ah > 600) {
                    ah = 600;
                }
                let innerHtml = '<Story Self="ud' + i + '" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="$ID/" AppliedNamedGrid="n">' +
                    '<StoryPreference OpticalMarginAlignment="false" OpticalMarginSize="12" FrameType="TextFrameType" StoryOrientation="Horizontal" StoryDirection="LeftToRightDirection" />' +
                    '<InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false" />' +
                    '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/$ID/NormalParagraphStyle">' + $(this).html() + '</story>';

                $('.asideoutputelement').append(innerHtml);
                $(this).html('<br><TextFrame Self="uf' + i + '" ParentStory="ud' + i + '" PreviousTextFrame="n" NextTextFrame="n" ContentType="TextType" ParentInterfaceChangeCount="" TargetInterfaceChangeCount="" LastUpdatedInterfaceChangeCount="" OverriddenPageItemProps="" HorizontalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" VerticalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" FillColor="' + filclr + '" StrokeWeight="1" GradientFillStart="0 0" GradientFillLength="0" GradientFillAngle="0" GradientStrokeStart="0 0" GradientStrokeLength="0" GradientStrokeAngle="0" Locked="false" LocalDisplaySetting="Default" GradientFillHiliteLength="0" GradientFillHiliteAngle="0" GradientStrokeHiliteLength="0" GradientStrokeHiliteAngle="0" AppliedObjectStyle="ObjectStyle/$ID/[None]" Visible="true" Name="$ID/" ItemTransform="1 0 0 1 380.875590551 -' + ah + '.68331596795025">' +
                    '<Properties>' +
                    '<Label>' +
                    '<KeyValuePair Key="Label" Value="boxuq' + i + '" />' +
                    '</Label>' +
                    '<PathGeometry>' +
                    '<GeometryPathType PathOpen="false">' +
                    '<PathPointArray>' +
                    '<PathPointType Anchor="-380.875590551 -81.85356098517468" LeftDirection="-380.875590551 -81.85356098517468" RightDirection="-380.875590551 -81.85356098517468" />' +
                    '<PathPointType Anchor="-380.875590551 ' + ah + '.68331596795025" LeftDirection="-380.875590551 ' + ah + '.68331596795025" RightDirection="-380.875590551 ' + ah + '.68331596795025" />' +
                    '<PathPointType Anchor="159.20314960648022 ' + ah + '.68331596795025" LeftDirection="159.20314960648022 ' + ah + '.68331596795025" RightDirection="159.20314960648022 ' + ah + '.68331596795025" />' +
                    '<PathPointType Anchor="159.20314960648022 -81.85356098517468" LeftDirection="159.20314960648022 -81.85356098517468" RightDirection="159.20314960648022 -81.85356098517468" />' +
                    '</PathPointArray>' +
                    '</GeometryPathType>' +
                    '</PathGeometry>' +
                    '</Properties>' +
                    '<TextFramePreference TextColumnFixedWidth="540" TextColumnMaxWidth="0" FirstBaselineOffset="LeadingOffset" AutoSizingType="HeightOnly"/>' +
                    '<AnchoredObjectSetting AnchoredPosition="AboveLine" SpineRelative="true" AnchorPoint="TopLeftAnchor" VerticalAlignment="TopAlign" AnchorYoffset="-5" AnchorSpaceAbove="-32" />' +
                    '<TextWrapPreference Inverse="false" ApplyToMasterPageOnly="false" TextWrapSide="BothSides" TextWrapMode="None">' +
                    '<Properties>' +
                    '<TextWrapOffset Top="0" Left="0" Bottom="0" Right="0" />' +
                    '</Properties>' +
                    '</TextWrapPreference>'

                    +
                    '</TextFrame><br>');
                i++;
                $(this).removeAttr("bg");
                $(this).removeAttr("data-height");
            } else if ($(this).prop("tagName").toLowerCase() == "paragraphstylerangebr" || $(this).prop("tagName").toLowerCase() == "paragraphstylerange") {
                callFunction(index, this);
            }
        })
        $('#convertbg').attr('disabled', 'true');
        $('#convertbgg').attr('disabled', 'false');
       
        await this.resolveAfter2Seconds();
        this.stepbgg();
    }

    async stepbgg() {
        let callFunction = (i, obj, n) => {
            this.stepbg2(i, obj, n);
        }
        $('.asideoutputelement').children().each(function (index) {
            if ($(this).prop("tagName").toLowerCase() == "story") {
                callFunction(index, this, 'n0');
            }
        });
        await this.resolveAfter2Seconds();
        this.colorstyle();
    }

    async colorstyle() {
        let colortag = '';
        let array_flip = (trans) => {
            let key, tmp_ar = {};
            for (key in trans) {
                if (trans.hasOwnProperty(key)) {
                    tmp_ar[trans[key]] = key;
                }
            }
            return tmp_ar;
        }

        let arrayKeys = (input) => {
            let output = new Array();
            let counter = 0;
            for (let i in input) {
                output[counter++] = i;
            }
            return output;
        }

        let cs = this.csscolorarr.toString();
        let exclr = cs.split(',');
        exclr = arrayKeys(array_flip(exclr));
        for (let i = 0; i < exclr.length; i++) {
            if (exclr[i].indexOf('rgb') == -1) {
                let colorcode = exclr[i].split(' ');
                if (colorcode.length == 4) {
                    colortag = '<Color Self="Color/C=' + colorcode[0] + ' M=' + colorcode[1] + ' Y=' + colorcode[2] + ' K=' + colorcode[3] + '" Model="Process" Space="CMYK" ColorValue="' + this.trim(exclr[i]) + '" ColorOverride="Normal" AlternateSpace="NoAlternateColor" AlternateColorValue="" Name="C=' + colorcode[0] + ' M=' + colorcode[1] + ' Y=' + colorcode[2] + ' K=' + colorcode[3] + '" ColorEditable="true" ColorRemovable="true" Visible="true" SwatchCreatorID="7937"></Color>';
                } else {
                    colortag = '<Color Self="Color/R=' + colorcode[0] + ' G=' + colorcode[1] + ' B=' + colorcode[2] + '" Model="Process" Space="RGB" ColorValue="' + this.trim(exclr[i]) + '" ColorOverride="Normal" AlternateSpace="NoAlternateColor" AlternateColorValue="" Name="R=' + colorcode[0] + ' G=' + colorcode[1] + ' B=' + colorcode[2] + '" ColorEditable="true" ColorRemovable="true" Visible="true" SwatchCreatorID="7937"></Color>';
                }
                $('.cssstyletagscolor').append(colortag);
            }
        }
        await this.resolveAfter2Seconds();
        this.convertfn();
    }
    convertfn() {
        let output = $('.outputelement').html();
        let paragraph = $('.cssstyletagspara').html();
        let character = $('.cssstyletagschar').html();
        let color = $('.cssstyletagscolor').html();
        let bg = $('.asideoutputelement').html();
        let content = "";
        let bgcontent = "";
        $('.hiddenelement').html('');
        let computeClass = new icmlcompute;
      
        if (output != "") {
            content = computeClass.alloutput(output);
        }
        if (bg != "") {
            bgcontent = computeClass.alloutput(bg);
        }
         let icml_output = this.constants.starttag + computeClass.colorstyle(color) + this.constants.strokeborder + this.constants.commonfont + '<RootParagraphStyleGroup Self="u77">'+ this.constants.paragraphformat + computeClass.paragraphformat(paragraph) +'</RootParagraphStyleGroup>' + this.constants.roottag + '<NumberingList Self="NumberingList/$ID/[Default]" Name="$ID/[Default]" ContinueNumbersAcrossStories="false" ContinueNumbersAcrossDocuments="false" /> <RootCharacterStyleGroup Self="u78">' + this.constants.textformat + computeClass.textformat(character)+'</RootCharacterStyleGroup><RootCellStyleGroup Self="u78">'+this.constants.cellcss+'</RootCellStyleGroup> <Story Self="udd2" Observers="" Subjects="" DisplayErrorDialogs="false" EventFilter="" JavaScript="" SubjectScriptTagFilter="" UseDebugger="false" CompactedDataStore="" ComponentId="" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="html to icml" AppliedNamedGrid="n" OpticalMarginAlignment="false" OpticalMarginSize="12">'+content+'</Story>' + bgcontent + '</Document>';

         let finalView = (arg) => {
             this.convertInfo = false;
             this.icml_file_link =  '/icml_css_1/icmlfiles/'+arg;
             this.spinner.hide();
         }
         
         let url = this.APIUrl + "/icmlconvert";
         this.http.post(url, {
             output: icml_output
         }).
         subscribe(function (data) {
             let response = data.json();
             this.icml_file_link = response.filename;
             finalView(this.icml_file_link);
         });
             
         }

    stepbg2(index, element, nest) {
        let filclr = '';
        let elem:any;
        for (let i = 0, j = 1; i < $(element)[0].childNodes.length; i++, j++) {
            if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "paragraphstylerangebr" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "paragraphstylerange" ||
                $(element)[0].childNodes[i].nodeName.toLowerCase() == "cell" || $(element)[0].childNodes[i].nodeName.toLowerCase() == "tablee") {
                elem = $(element)[0].childNodes[i];
                this.stepbg2(index, elem, "n" + j);
            } else if ($(element)[0].childNodes[i].nodeName.toLowerCase() == "paragraphstylerangeaside") {
                elem = $(element)[0].childNodes[i];
                let bgclr = $(elem).attr("bg");
                let rcarr = bgclr.split(',');
                if (rcarr.length == 4) {
                    filclr = 'Color/C=' + rcarr[0] + ' M=' + rcarr[1] + ' Y=' + rcarr[2] + ' K=' + rcarr[3];
                } else {
                    filclr = 'Color/R=' + rcarr[0] + ' G=' + rcarr[1] + ' B=' + rcarr[2];
                }
                let strh = $(elem).attr("data-height");
                let ah:number = (parseInt(strh.replace("px", "")) * 0.75) - 60;
                if (ah > 600) {
                    ah = 600;
                }
                if (nest == "") {
                    let nestval = "";
                } else {
                    let nestval = nest;
                }

                let innerHtml = '<Story Self="ud' + nest + "" + i + '" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="$ID/" AppliedNamedGrid="n">' +
                    '<StoryPreference OpticalMarginAlignment="false" OpticalMarginSize="12" FrameType="TextFrameType" StoryOrientation="Horizontal" StoryDirection="LeftToRightDirection" />' +
                    '<InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false" />' +
                    '<ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/$ID/NormalParagraphStyle">' + $(elem).html() + '</story>';

                $('.asideoutputelement').append(innerHtml);
                $(elem).html('<br><TextFrame Self="uf' + nest + "" + i + '" ParentStory="ud' + nest + "" + i + '" PreviousTextFrame="n" NextTextFrame="n" ContentType="TextType" ParentInterfaceChangeCount="" TargetInterfaceChangeCount="" LastUpdatedInterfaceChangeCount="" OverriddenPageItemProps="" HorizontalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" VerticalLayoutConstraints="FlexibleDimension FixedDimension FlexibleDimension" FillColor="' + filclr + '" StrokeWeight="1" GradientFillStart="0 0" GradientFillLength="0" GradientFillAngle="0" GradientStrokeStart="0 0" GradientStrokeLength="0" GradientStrokeAngle="0" Locked="false" LocalDisplaySetting="Default" GradientFillHiliteLength="0" GradientFillHiliteAngle="0" GradientStrokeHiliteLength="0" GradientStrokeHiliteAngle="0" AppliedObjectStyle="ObjectStyle/$ID/[None]" Visible="true" Name="$ID/" ItemTransform="1 0 0 1 380.875590551 -' + ah + '.68331596795025">' +
                    '<Properties>' +
                    '<Label>' +
                    '<KeyValuePair Key="Label" Value="boxuq' + i + '" />' +
                    '</Label>' +
                    '<PathGeometry>' +
                    '<GeometryPathType PathOpen="false">' +
                    '<PathPointArray>' +
                    '<PathPointType Anchor="-380.875590551 -81.85356098517468" LeftDirection="-380.875590551 -81.85356098517468" RightDirection="-380.875590551 -81.85356098517468" />' +
                    '<PathPointType Anchor="-380.875590551 ' + ah + '.68331596795025" LeftDirection="-380.875590551 ' + ah + '.68331596795025" RightDirection="-380.875590551 ' + ah + '.68331596795025" />' +
                    '<PathPointType Anchor="159.20314960648022 ' + ah + '.68331596795025" LeftDirection="159.20314960648022 ' + ah + '.68331596795025" RightDirection="159.20314960648022 ' + ah + '.68331596795025" />' +
                    '<PathPointType Anchor="159.20314960648022 -81.85356098517468" LeftDirection="159.20314960648022 -81.85356098517468" RightDirection="159.20314960648022 -81.85356098517468" />' +
                    '</PathPointArray>' +
                    '</GeometryPathType>' +
                    '</PathGeometry>' +
                    '</Properties>' +
                    '<TextFramePreference TextColumnFixedWidth="540" TextColumnMaxWidth="0" FirstBaselineOffset="LeadingOffset" AutoSizingType="HeightOnly"/>' +
                    '<AnchoredObjectSetting AnchoredPosition="AboveLine" SpineRelative="true" AnchorPoint="TopLeftAnchor" VerticalAlignment="TopAlign" AnchorYoffset="-5" AnchorSpaceAbove="-32" />' +
                    '<TextWrapPreference Inverse="false" ApplyToMasterPageOnly="false" TextWrapSide="BothSides" TextWrapMode="None">' +
                    '<Properties>' +
                    '<TextWrapOffset Top="0" Left="0" Bottom="0" Right="0" />' +
                    '</Properties>' +
                    '</TextWrapPreference>'

                    +
                    '</TextFrame><br>');
                i++;
                $(elem).removeAttr('bg');
                $(elem).removeAttr("data-height");
            }
        }
    }

    trim(str) {
        return str.replace(/^\s+|\s+$/gm, '');
    }

    heightcal(ih, val) {
        let brv = "";
        for (let i = val; i < (ih - i); i += val) {
            brv += "<br>";
        }
        return brv;
    }

}
