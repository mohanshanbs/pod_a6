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

  customHtmlHeadData: any = [];
  customHtmlBodyData: any = [];
  jsonData: any = [];


  tempJsonData: any;

  /** 
   * timeout function for delay rendering
   */
  timeout = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  createSaveJSON = async function (data) {
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
  createJSONfromHTML = async function (data, contentDoc, save, projectPath) {
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

        // this.customHtmlBodyData = contentDoc.body;
        // let key = 'DIV SECTION';
        // this.checkComponent(this.customHtmlBodyData, key);

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

        // this.customHtmlBodyData = contentDoc.body;
        // let key = 'DIV SECTION';
        // this.checkComponent(this.customHtmlBodyData, key);

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

  createCustomJSONfromHTML = async function (data, contentDoc, projectPath) {
    try {
      let arrayData: any = [];
      arrayData.push({ fileName: 'editorHeadJSON' }, { fileName: 'editorBodyJSON' })

      if (window.location.hostname.indexOf('localhost') > -1) {
        data = data.replace(new RegExp(projectPath + "/assets/", "g"), "../../assets/")
        data = data.replace(new RegExp(projectPath + "/img/", "g"), "../../img/");
      }
      
      contentDoc.head.innerHTML = '';
      contentDoc.body.innerHTML = '';
      
      let headTags = data.match(/<head[^>]*>[\s\S]*<\/head>/gi);
      let bodyTags = data.match(/<body[^>]*>[\s\S]*<\/body>/gi);
      
      contentDoc.head.innerHTML = headTags;
      contentDoc.body.innerHTML = bodyTags;

      this.customHtmlHeadData = contentDoc.head;
      this.customHtmlBodyData = contentDoc.body;
      //let key = '';

      await this.timeout(1000);
      this.checkComponent(this.customHtmlHeadData);
      arrayData[0]["data"] = this.jsonData;
      this.jsonData = [];
      
      await this.timeout(1000);
      this.checkComponent(this.customHtmlBodyData);
      arrayData[1]["data"] = this.jsonData;

      // return this.jsonData;
      return new Promise((resolve, reject) => {
        resolve(arrayData)
      })
    }
    catch (error) {
      console.log(error);
    }
  }

  //custom JSON - venkat
  // checkComponent(data, key) {
  //   let att = '';
  //   if (data.children && data.children.length > 0) {
  //     for (let i = 0; i < data.children.length; i++) {
  //       att = '';
  //       att += data.children[i].nodeName;
  //       if (data.children[i].children && data.children[i].children.length > 0) {
  //         att += " " + data.children[i].children[0].nodeName;
  //         // if(data.children[i].children[0].classList == "mhhe-blk-header")
  //         let jsonArrayObject = {
  //           "name": "",
  //           "description": "",
  //           "displayField": "",
  //           "type": "",
  //           "data-uuid": "",
  //           "identifier": "",
  //           "attributes": [{
  //             "class": "",
  //             "pagenum": "",
  //             "computedStyles": "",
  //             "offsetHeight": "",
  //             "marginTop": "",
  //             "uniqid": "",
  //           }],
  //           "fields": [],
  //           "created": {
  //             "user": "",
  //             "date": "",
  //             "time": ""
  //           }
  //         }      

  //         if (att == key || key == '') {       
  //           this.tempJsonData = jsonArrayObject;
  //           this.createCustomJson(data.children[i].children[0], this.tempJsonData, '', 0);
  //           this.jsonData.push(this.tempJsonData);
  //         }
  //       }
  //     }
  //   }
  // }

  checkComponent(data) {
    if (data.children && data.children.length > 0) {
      for (let i = 0; i < data.children.length; i++) {
        let jsonArrayObject = {
          "name": "",
          "description": "",
          "displayField": "",
          "type": "",
          "data-uuid": "",
          "identifier": "",
          "attributes": [{
            "class": "",
            "pagenum": "",
            "computedStyles": "",
            "offsetHeight": "",
            "marginTop": "",
            "uniqid": "",
          }],
          "fields": [],
          "created": {
            "user": "",
            "date": "",
            "time": ""
          }
        }      

        this.tempJsonData = jsonArrayObject;
        this.createCustomJson(data.children[i], this.tempJsonData, '', 0);
        this.jsonData.push(this.tempJsonData); 
      }
    }
  }

  createCustomJson(data, jsonArrayObject, key, lvl) {
    if (lvl == 0) {
      let name = data.nodeName.toLowerCase();
      jsonArrayObject.name = name;
      jsonArrayObject.type = name;
      jsonArrayObject["identifier"] = name.toUpperCase();
      jsonArrayObject["data-uuid"] = name +"-"+ this.createUUID();

      jsonArrayObject.attributes[0]["class"] = data.className;
      jsonArrayObject.attributes[0]["offsetHeight"] = data.offsetHeight;
      jsonArrayObject.attributes[0]["computedStyles"] = getComputedStyle(data);
      jsonArrayObject.attributes[0]["uniqid"] = jsonArrayObject["data-uuid"];

      let customAttribute = document.createAttribute("customKey");
      customAttribute.value = jsonArrayObject.identifier;
      data.setAttributeNode(customAttribute);
    }

    for (let i = 0; i < data.children.length; i++) {
      let fieldsArrayObject = {
        "id": "",
        "name": "",
        "type": "",
        "identifier": "",
        "attributes": [{
          "class": "",
          "pagenum": "",
          "computedStyles": "",
          "offsetHeight": "",
          "marginTop": "",
          "uniqid": "",
        }],
        "fields": [],
        "localized": false,
        "required": false,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "content": false,
        "data": ""
      }

      let name = data.children[i].nodeName.toLowerCase();

      if (data.children[i].children.length > 0) {
        fieldsArrayObject.name = name;
        fieldsArrayObject.type = name;
        fieldsArrayObject["id"] = name +"-"+ this.createUUID();
        fieldsArrayObject.attributes[0]["class"] = data.children[i].className;
        fieldsArrayObject.attributes[0]["offsetHeight"] = data.children[i].offsetHeight;
        fieldsArrayObject.attributes[0]["computedStyles"] = getComputedStyle(data.children[i])+"";
        fieldsArrayObject.attributes[0]["uniqid"] = fieldsArrayObject["id"];

        let keyValue = key ? (key +" "+ name.toUpperCase()) : (jsonArrayObject["identifier"] +" "+ name.toUpperCase());
        fieldsArrayObject["identifier"] = keyValue;
        fieldsArrayObject["data"] = (data.children[i].innerText).includes("\n\n") ? "" : data.children[i].innerText;
        fieldsArrayObject.content = true;
        
        let customAttribute = document.createAttribute("customKey");
        customAttribute.value = fieldsArrayObject.identifier;
        data.children[i].setAttributeNode(customAttribute);

        jsonArrayObject.fields.push(fieldsArrayObject);
        this.createCustomJson(data.children[i], jsonArrayObject.fields[i], fieldsArrayObject.identifier, 1);
      }
      else {
        fieldsArrayObject.name = name;
        fieldsArrayObject.type = name;
        fieldsArrayObject["id"] = name +"-"+ this.createUUID();
        fieldsArrayObject.attributes[0]["class"] = data.children[i].className;
        fieldsArrayObject.attributes[0]["offsetHeight"] = data.children[i].offsetHeight;
        fieldsArrayObject.attributes[0]["computedStyles"] = getComputedStyle(data.children[i])+"";
        fieldsArrayObject.attributes[0]["uniqid"] = fieldsArrayObject["id"];

        let keyValue = key ? (key +" "+ name.toUpperCase()) : (jsonArrayObject["identifier"] +" "+ name.toUpperCase());
        fieldsArrayObject["identifier"] = keyValue;
        fieldsArrayObject["data"] = data.children[i].innerText;

        let customAttribute = document.createAttribute("customKey");
        customAttribute.value = fieldsArrayObject.identifier;
        data.children[i].setAttributeNode(customAttribute);

        jsonArrayObject.fields.push(fieldsArrayObject);
      }
    }
  }

   // generate uuid
   createUUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
  }

  // End custom JSON - venkat


  /** function to create - JSON  */
  createJSON = async function (contentData, fromIndex, toIndex) {
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

      if (toIndex <= 1) {
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
  setCurrentElement = async function (json, element) {
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

  appendTextNode = async function (json, element) {
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

    json += ',"content":"' + "" + '"';
    json += ',"data":"' + "" + '"';
    json += '}';
    json += ']';
    // venkat -- end json modification

    json += '}';
    
    return new Promise((resolve, reject) => {
      resolve(json)
    })
  }
  /** function to create element computed styles - JSON  */
  setCurrentElementStyle = async function (json, element) {
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
