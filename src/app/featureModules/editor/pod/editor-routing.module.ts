import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { EditprojectPageComponent } from './editproject-page/editproject-page.component';
import { EditchapterPageComponent } from './editchapter-page/editchapter-page.component';

import { EditorComponent } from './editor/editor.component';

const routes: Routes = [
    {path:'',component:EditorComponent},
    // {path:'',component:EditprojectPageComponent,children:[
    //     {path:'editor',component:EditorComponent}]
    // }
];
@NgModule({

    imports:[RouterModule.forChild(routes),FormsModule,ReactiveFormsModule],
        
    exports:[RouterModule,FormsModule,ReactiveFormsModule]
})
export class editorRoutingModule{}

