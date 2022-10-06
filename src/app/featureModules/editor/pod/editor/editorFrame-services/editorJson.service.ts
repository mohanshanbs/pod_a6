import { Injectable } from '@angular/core';
import { ProjectDataService } from '../../services/project-data.service';
import { AppConfig } from 'src/app/app-config';

@Injectable({ providedIn: 'root' })

export class editorJsonService {

  constructor(public dataservice: ProjectDataService, private appConfig: AppConfig) {

  }
  isSave: boolean = false;
  count: number = 0;
  tableidarray: any = [];
  tablesize: any = [];


  /** 
   * timeout function for delay rendering
   */
  timeout = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  createSaveJSON = async function(data) {
    try {
      this.isSave = true;
      let test_array: any = [];
      test_array = await this.createJSON(data.childNodes, '', '');
      return new Promise((resolve, reject) => {
        resolve(test_array)
      })

    } catch (error) {

    }
  }

  /** function to create json from html */
  createJSONfromHTML = async function(data, contentDoc, save, projectPath) {
    try {
      this.isSave = save;
      let array: any = [];
      array.push({ fileName: 'editorHeadJSON' }, { fileName: 'editorBodyJSON' })
      if (this.isSave) {
        if (window.location.hostname.indexOf('localhost') > -1) {
          data = data.replace(new RegExp(projectPath + "/assets/", "g"), "../../assets/")
          data = data.replace(new RegExp(projectPath + "/img/", "g"), "../../img/");
        }
        contentDoc.body.innerHTML = '';
        contentDoc.head.innerHTML = '';
        let headTags = data.match(/<head[^>]*>[\s\S]*<\/head>/gi);
        let bodyTags = data.match(/<body[^>]*>[\s\S]*<\/body>/gi);
        contentDoc.body.innerHTML = bodyTags;
        contentDoc.head.innerHTML = headTags;
        array[0].data = await this.createJSON(contentDoc.head.childNodes, '', '');
        await this.timeout(1000)
        array[1].data = await this.createJSON(contentDoc.body.childNodes, '', '');

      } else {
        this.isSave = save ? save : false;
        /* old data 
            data=data.replace(new RegExp("../../assets/","g"),"http://172.24.198.179/pod_assets/uploads/Denniston_10e/assets/")
            data=data.replace(new RegExp("../../img/","g"),"http://172.24.198.179/pod_assets/uploads/Denniston_10e/img/");
            let url = this.appConfig.config.apiURL.substring(0,this.appConfig.config.apiURL.lastIndexOf(':'))
            data=data.replace(new RegExp("../../assets/","g"),url+"/pod_assets/uploads/Denniston_10e/assets/")
            data=data.replace(new RegExp("../../img/","g"),url+"/pod_assets/uploads/Denniston_10e/img/");
        end old data */

        /* new data */
        data = data.replace(new RegExp("../../assets/", "g"), projectPath + "/assets/")
        data = data.replace(new RegExp("../../img/", "g"), projectPath + "/img/");
        /* end new data */

        let headTags = data.match(/<head[^>]*>[\s\S]*<\/head>/gi);
        let bodyTags = data.match(/<body[^>]*>[\s\S]*<\/body>/gi);
        contentDoc.body.innerHTML = bodyTags;
        contentDoc.head.innerHTML = headTags;
        await this.timeout(1000);
        array[0].data = await this.createJSON(contentDoc.head.childNodes, '', '');
        await this.timeout(1000)
        array[1].data = await this.createJSON(contentDoc.body.childNodes, '', '');
      }
      return new Promise((resolve, reject) => {
        resolve(array)
      })
    } catch (error) {

    }

  }
    /** function to create - JSON  */
  createJSON = async function(contentData, fromIndex, toIndex) {
    let customTag = false;

    if(fromIndex == 'custom'){
      contentData = ($("<section>"+ contentData.outerHTML +"</section>")[0]).childNodes;
      fromIndex = '';
      customTag = true;
    }

    try {
      this.count = 0;
      let json: any = '';
      //json='[' 
      let array: any = [];
      toIndex = toIndex != '' ? toIndex : contentData.length;
      fromIndex = fromIndex != '' ? fromIndex : 0;
      for (var i = fromIndex; i < toIndex; i++) {
        if (contentData[i].nodeType != 8 || contentData[i].nodeName.toLowerCase != '#comment') {
          if (contentData[i].nodeName.toLowerCase() == '#text')
            continue

          json = await this.setCurrentElement(json, contentData[i])
          json += ',';
        }
      }
      json = json.substring(0, json.length - 1);

      if (toIndex <= 1 && !customTag) {
        //json = '[{"section":[{"attributes":[{"id":"","computedStyles":"","offsetHeight":"","marginTop":"","uniqid":""}]}]}]';
        json = '';
      }

      if (json != "")
        json = "[" + json + "]";


      return new Promise((resolve, reject) => {
        resolve(json)
      });
    } catch (error) {
      console.log(error)
    }

  }
  /** function to create current element - JSON  */
  setCurrentElement = async function(json, element) {
    try {
      this.count++;
      json += "{";
      let elem_field: any = element.nodeName == undefined ? '' : element.nodeName.toLowerCase();
      json += '"' + elem_field + '"';
      json += ':';
      json += '[';
      json = await this.setCurrentElementAttr(json, element);
      let elementChild: any = element.childNodes.length > 0 ? element : '';
      if (elementChild) {

        for (let i = 0; i < element.childNodes.length; i++) {

          if (element.childNodes[i].nodeName == '#text') {
            let textLen = element.childNodes[i].textContent.trim();
            if (textLen.length > 0)
              json = await this.appendTextNode(json, element.childNodes[i]);

          } else {
            json += ',';
            json = await this.setCurrentElement(json, element.childNodes[i]);
          }
        }
      }

      json += ']'
      json += '}'
      return new Promise((resolve, reject) => {
        resolve(json)
      });
    } catch (error) {
      console.log(error)
    }

  }

  appendTextNode = async function(json, element) {
    let text_node = element.textContent.replace(/\n/g, " ").replace(/"/g, "'").replace(/\r/g, "\\r").replace(/\t/g, "\\t").replace(/\f/g, "\\f");
    json += ',';
    json += '{';
    json += '"text":"' + text_node + '"';
    json += '}';

    return new Promise((resolve, reject) => {
      resolve(json)
    })

  }

  /** function to create element attributes - JSON */
  setCurrentElementAttr = async function (json, element) {
    json += '{';
    json += '"attributes"';
    json += ':';
    json += '[';
    json += '{';
    if (element.attributes && element.attributes.length >= 1) {
      for (let key in element.attributes) {
        if (element.attributes.hasOwnProperty(key)) {
          if (this.isSave && (element.attributes[key].nodeName == 'isbelongto' || element.attributes[key].nodeName == 'text'))
            continue

          let value = element.attributes[key].value.replace(/['"]+/g, '');
          json += '"' + element.attributes[key].nodeName + '":"' + value + '",';
        }
      }
    }
    json = await this.setCurrentElementStyle(json, element);

    if (!this.isSave)
      json += ',"uniqid":"' + this.count + '"';

    json += ',"key":"' + "" + '"';
    json += ',"is_component":"' + false + '"';

    
    json += '}';
    json += ']';

    // venkat -- json modification
    json += ',';
    json += '"componentData": [';
    json += '{';
    json += '"description":"' + "" + '"';
    json += ',"displayField":"' + "" + '"';
    json += ',"type":"' + element.nodeName.toLowerCase() + '"';
    json += ',"data-uuid":"' + this.count + '"';
    
    let parentTag = element.parentElement.nodeName.toLowerCase();
    if(parentTag == 'body' || parentTag == 'head'){
      json += ',"identifier":"' + element.nodeName.toLowerCase() + '"';
    }
    else{
      json += ',"identifier":"' + parentTag +" " + element.nodeName.toLowerCase() + '"';
    }
    
    json += ',"key":"' + "" + '"';
    // json += ',"content":"' + "" + '"';
    json += ',"data":"' + "" + '"';
    json += '}';
    json += ']';
    // venkat -- end json modification

    json += '}';
    
    return new Promise((resolve, reject) => {
      resolve(json)
    })
  }
  /*setCurrentElementAttr = async function(json, element) {
    json += '{';
    json += '"attributes"';
    json += ':';
    json += '[';
    json += '{';
    if (element.attributes && element.attributes.length >= 1) {
      for (let key in element.attributes) {
        if (element.attributes.hasOwnProperty(key)) {
          if (this.isSave && (element.attributes[key].nodeName == 'isbelongto' || element.attributes[key].nodeName == 'text'))
            continue

          let value = element.attributes[key].value.replace(/['"]+/g, '');
          json += '"' + element.attributes[key].nodeName + '":"' + value + '",';
        }
      }
    }
    json = await this.setCurrentElementStyle(json, element);

    if (!this.isSave)
      json += ',"uniqid":"' + this.count + '"';


    json += '}';
    json += ']';
    json += '}';
    return new Promise((resolve, reject) => {
      resolve(json)
    })
  }*/
  /** function to create element computed styles - JSON  */
  setCurrentElementStyle = async function(json, element) {
    var styles = this.dataservice.defaultStyles();
    var p_styles = '';
    let marginTop: number = 0;
    for (var s = 0; s < styles.length; s++) {
      var style_prop = this.dataservice.getPropValue(element, styles[s]);
      style_prop = style_prop.replace(/['"]+/g, '');
      marginTop = styles[s] == 'margin-top' ? style_prop.replace('px', '') : marginTop
      p_styles += styles[s] + ':' + style_prop + ';';
    }


    if (!this.isSave) {
      json += '"computedStyles":"' + p_styles + '",';
      let height = element.offsetHeight != undefined ? element.offsetHeight : element.clientHeight;
      json += '"offsetHeight":"' + height + '",';
      json += '"marginTop":"' + Math.round(marginTop) + '"';
    } else {
      json += '"computedStyles":"' + p_styles + '"';
    }

    return new Promise((resolve, reject) => {
      resolve(json)
    })

  }
}
