import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'compareString'
})
export class CompareStringPipe implements PipeTransform {

  transform(value1: string, value2: string): any {
    let obj_array = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'ul', 'ol', 'mjx-container', 'td', 'img'];
	  let obj = (Object.keys(value1)[0]).toLowerCase();

    if(value2 == "text" && obj == "attributes"){
      let isValid = false;
      let elem_type = value1['componentData'][0].type;
      let innerHtmlData = value1['componentData'][0]['innerHtmlData'];
      
      obj_array.forEach(element => {
        if(element == elem_type && innerHtmlData != undefined){
          isValid = true;
        }
      });
      return isValid;
    }
    else if(value2 == "checkRecursion"){
      if(obj != "attributes" && obj != "text" && obj != "img"){
        return true
      }
    }
    else if(obj == value2 && obj == "img"){
      return true
    }
  }

}
