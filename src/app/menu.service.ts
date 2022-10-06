import {
  Injectable
} from '@angular/core';

@Injectable()
export class MenuService {
  constructor() {}
  getMenu(): Array < any > {
    const menu = [
      {
        name: 'Projects',
        path: './projectslist',
        children: [{
            name: 'Add Projects',
            path: './addproject'
              }, {
            name: 'Conversion',
            path: './convertchapter'
              },  {
            name: 'Assign Projects',
            path: './assignproject'
              },  {
            name: 'Select HTML',
            path: './icmlconversion'
          }, {
            name: 'Html to ICML',
            path: './conversionprocess'
          }]
      },{
        name: 'Users',
        path: './userslist',
        children: [{
            name: 'Add Users',
            path: './adduser',
          }]
      },{
        name: 'My projects',
        path: './myprojects',
        children: [{
            name: 'Conversion',
            path: './convertchapter',
        }]
      }, {
        name: 'View Pdf',
        path: './editproject',
        children: [{
            name: 'Pdf Editor Page',
            path: './editor'
        }]
      }
    ];

    return menu;
  }

}
