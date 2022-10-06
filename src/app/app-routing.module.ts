import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { UserListPageComponent } from './user-list-page/user-list-page.component';
import { ProjectListPageComponent } from './project-list-page/project-list-page.component';
import { AddprojectsPageComponent } from './addprojects-page/addprojects-page.component';
import { AddusersPageComponent } from './addusers-page/addusers-page.component';
import { MainPageComponent } from './main-page/main-page.component';
import { AssignprojectPageComponent } from './assignproject-page/assignproject-page.component';
/* import { EditprojectPageComponent } from './editproject-page/editproject-page.component'; */
/* import { EditchapterPageComponent } from './editchapter-page/editchapter-page.component'; */
import { ConvertChaptersComponent } from './convert-chapters/convert-chapters.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { MyprojectsComponent } from './myprojects/myprojects.component';
import { IcmlConvertComponent } from './icml-convert/icml-convert.component';
import { IcmlConversionProcessComponent } from './icml-conversion-process/icml-conversion-process.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

const routes: Routes = [
  {path:'sign-up', component:SignUpComponent},
  { path: 'landingpage', component: LandingPageComponent },
  /*{ path: 'assessment', component: AssessmentModuleComponent },*/
  { path: 'projectslist', component: ProjectListPageComponent ,
  children: [
  { path: 'addproject', component: ProjectListPageComponent }
  ]},

  { path: 'userslist', component: UserListPageComponent,children: [{ path: 'adduser', component: UserListPageComponent }] },
  { path: 'addprojects', component: AddprojectsPageComponent },
  { path: 'addusers', component: AddusersPageComponent },
  { path: 'mainpage', component: MainPageComponent },
  { path: 'projectslist/assignproject/:id', component: AssignprojectPageComponent },
  /* { path: 'editproject/:id', component: EditprojectPageComponent,children: [
  { path: 'editor', component: EditchapterPageComponent }]}, */
  { path:'editproject/:id',loadChildren:'./featureModules/editor/pod/pod.module#PodModule'},
  { path: 'projectslist/convertchapter/:id', component: ConvertChaptersComponent },
  { path: 'resetpassword/:uname', component: LoginPageComponent },
  { path: 'passwordreset/:status', component: LoginPageComponent },
  { path: 'myprojects', component: MyprojectsComponent },
  { path: 'myprojects/convertchapter/:id', component: ConvertChaptersComponent },
  { path: 'loginuser', component: LoginPageComponent },
  { path: 'projectslist/icmlconversion/:pname', component: IcmlConvertComponent },
  { path: 'projectslist/conversionprocess/:chapter', component: IcmlConversionProcessComponent },
  { path: '', redirectTo: '/projectslist', pathMatch: 'full' }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes,{
      useHash: true
    }) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule { }