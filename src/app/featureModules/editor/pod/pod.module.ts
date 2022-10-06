import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditprojectPageComponent } from './editproject-page/editproject-page.component';
import { AppConfig } from '../../../app-config';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MaterialComponentsModule } from '../../material-components/material-components.module';
import { MatInputModule, MatFormFieldModule } from '@angular/material';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { editorRoutingModule } from '../pod/editor-routing.module';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { modelDialogComponent } from './model-dialog/model-dialog.component';
import { EditchapterPageComponent } from './editchapter-page/editchapter-page.component';
import { FormsModule } from '@angular/forms';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { EditorComponent } from './editor/editor.component';
// import { EditorOptionDirective } from './editor-option.directive';
import { ColorGithubModule } from 'ngx-color/github'; 
import { CompareStringPipe } from './compare-string.pipe';
import { TextFieldComponent } from './text-field/text-field.component';
import {editorDomService} from './editor/editorFrame-services/editorDom.service';
import { EditHtmlDialogComponent } from './editor/edit-html-dialog/edit-html-dialog.component';
import { EditStyleDialogComponent } from './editor/edit-style-dialog/edit-style-dialog.component';

// , EditorOptionDirective
@NgModule({
  declarations: [EditprojectPageComponent, modelDialogComponent, EditchapterPageComponent, EditorComponent, CompareStringPipe, TextFieldComponent, EditHtmlDialogComponent, EditStyleDialogComponent],
  imports: [
    CommonModule,
    NgxSpinnerModule,
    MaterialComponentsModule,
    PdfViewerModule,
    editorRoutingModule,
    HttpModule,
    HttpClientModule,
    FormsModule,
    ColorGithubModule,
    MatInputModule, 
    MatFormFieldModule,
    AngularEditorModule
  ],
  providers:[editorDomService],
  exports: [EditorComponent]
})
export class PodModule { }
