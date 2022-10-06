import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditprojectPageComponent } from './editproject-page.component';

describe('EditprojectPageComponent', () => {
  let component: EditprojectPageComponent;
  let fixture: ComponentFixture<EditprojectPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditprojectPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditprojectPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
