import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignprojectPageComponent } from './assignproject-page.component';

describe('AssignprojectPageComponent', () => {
  let component: AssignprojectPageComponent;
  let fixture: ComponentFixture<AssignprojectPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignprojectPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignprojectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
