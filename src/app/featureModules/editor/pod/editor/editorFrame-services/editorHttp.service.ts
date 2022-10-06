import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../../../../../app-config';


@Injectable({ providedIn: 'root' })

export class editorHttpService {

    constructor(public http: HttpClient, private appConfig: AppConfig) {
    }
    checkfileExist = async function () {
        try {
            let respondData = await this.http.get(this.appConfig.config.apiURL + '/checkFileExist', { params: { 'url': "./pod_assets/uploads/Denniston_10e/s9ml/chapter03/editor.json" } }).toPromise()

            return new Promise((resolve, reject) => {
                resolve(respondData)
            })
        } catch (error) {
            console.log(error)
        }
    }
    readfile = async function () {
        try {
            let respondData = await this.http.get(this.appConfig.config.apiURL + '/checkFileExist', { params: { 'url': "./pod_assets/uploads/Denniston_10e/s9ml/chapter03/editor.json" } }).toPromise()

            return new Promise((resolve, reject) => {
                resolve(respondData)
            })
        } catch (error) {
            console.log(error)
        }
    }
    createHtml = async function (obj, filename) {
        try {
            var viewerheight = parseFloat((localStorage.getItem('pagesize')).split(',')[1]);
            var viewerwidth = parseFloat(localStorage.getItem('pagesize').split(',')[0]);
            await this.http.post(this.appConfig.config.apiURL + "/createNewhtml", { head: obj.head, body: obj.body, url: obj.url, pagewidth: viewerwidth, pageheight: viewerheight, standard: localStorage.getItem('projectstandard') }).toPromise();

            return new Promise((resolve, reject) => {
                resolve('fileCreated')
            })
        } catch (error) {

        }
    }

    // createNewJSON = async function(){
    //     try{
    //         let respondData = await this.http.get('http://localhost:8080/checkFileExist',{params:{'url':"../pod_assets/uploads/Denniston_10e/s9ml/chapter03/editor.json"}}).toPromise()

    //         return respondData = new Promise((resolve,reject)=>{
    //             resolve(respondData)
    //         })
    //     }catch (error){
    //         console.log(error)
    //     }
    // }
    creatJSONservice = async function (data, contentDoc, filename, path) {
        try {
            await this.http.post(this.appConfig.config.apiURL + "/createNewJSON", { jsondata: data, url: path + filename + ".json" }).toPromise();

            return new Promise((resolve, reject) => {
                resolve('fileCreated')
            })
        } catch (error) {

        }
    }
}