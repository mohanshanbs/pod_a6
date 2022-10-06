import { BrowserModule } from '@angular/platform-browser';
import { NgModule,APP_INITIALIZER} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes} from '@angular/router';
import { HttpModule} from '@angular/http';


//import { writeFileSync, readFileSync } from 'fs';
//import fs from 'fs-extra';
//import * as path from 'path';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { AppRoutingModule } from './/app-routing.module';
import { SidemenuPageComponent } from './sidemenu-page/sidemenu-page.component';
import { HeaderPageComponent } from './header-page/header-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ProjectListPageComponent } from './project-list-page/project-list-page.component';
import { UserListPageComponent,AdduserDialog} from './user-list-page/user-list-page.component';
import { AddprojectsPageComponent } from './addprojects-page/addprojects-page.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppConfig } from './app-config';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
// import { mathjax } from 'mathjax'



import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { AddusersPageComponent } from './addusers-page/addusers-page.component';
import { AssignprojectPageComponent } from './assignproject-page/assignproject-page.component';
import { ConvertChaptersComponent } from './convert-chapters/convert-chapters.component';
import fontawesome from '@fortawesome/fontawesome'
import regular from '@fortawesome/fontawesome-free-regular'
import solid from '@fortawesome/fontawesome-free-solid'
import brands from '@fortawesome/fontawesome-free-brands';
import { pdfEditorService } from './featureModules/editor/pod/services/pdfEditor.service';
import { MyprojectsComponent } from './myprojects/myprojects.component';
import { MenuService } from './menu.service';
/* Import feature module - pod editor */
import { PodModule } from './featureModules/editor/pod/pod.module';
/* Import feature module - material */
import { MaterialComponentsModule } from './featureModules/material-components/material-components.module';
/* Import feature module - Editor routing module */
import { editorRoutingModule } from './featureModules/editor/pod/editor-routing.module';
import { ModalboxComponent } from './modalbox/modalbox.component';
import { IcmlConvertComponent } from './icml-convert/icml-convert.component';
import { IcmlConversionProcessComponent } from './icml-conversion-process/icml-conversion-process.component';
import { icmlcompute } from './icml-conversion-process/icmlcompute';
import { PageSizeComponent } from './page-size/page-size.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AuthInterceptor } from './service/authInterceptor';
import { EditHtmlDialogComponent } from './featureModules/editor/pod/editor/edit-html-dialog/edit-html-dialog.component';
import { EditStyleDialogComponent } from './featureModules/editor/pod/editor/edit-style-dialog/edit-style-dialog.component';
import { MessageModalComponent } from './components/message-modal/message-modal.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';


fontawesome.library.add(regular)
fontawesome.library.add(solid)
fontawesome.library.add(brands)

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    LandingPageComponent,
    HeaderPageComponent,
    SidemenuPageComponent,
    MainPageComponent,
    ProjectListPageComponent,
    UserListPageComponent,
    AdduserDialog,
    AddprojectsPageComponent,
    AddusersPageComponent,
    AssignprojectPageComponent,
    ConvertChaptersComponent,
    MyprojectsComponent,
    ModalboxComponent,
    IcmlConvertComponent,
    IcmlConversionProcessComponent,
    PageSizeComponent,
    MessageModalComponent,
    SignUpComponent,
  ],
  imports: [
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      AngularEditorModule,
      HttpClientModule,
      HttpModule,
      AppRoutingModule,
      NgbModule,
      BrowserAnimationsModule,
      PdfViewerModule,
      HttpClientModule,
	    UiSwitchModule,
      CdkTableModule,
      CdkTreeModule,
      NgxSpinnerModule,
      Ng2SearchPipeModule,
      PodModule,
      MaterialComponentsModule,
      editorRoutingModule,
      DragDropModule
  ],
  bootstrap: [AppComponent],
  providers: [AppConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    { 
      provide: APP_INITIALIZER, 
      useFactory: (config: AppConfig) => () => config.loadConfig(), 
      deps: [AppConfig], multi: true  
    },
    pdfEditorService,MenuService,icmlcompute
  ],
  entryComponents: [UserListPageComponent, AdduserDialog,ModalboxComponent, EditHtmlDialogComponent, EditStyleDialogComponent, PageSizeComponent],
})

export class AppModule {  }
