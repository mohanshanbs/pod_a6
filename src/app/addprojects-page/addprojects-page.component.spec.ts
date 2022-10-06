import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddprojectsPageComponent } from './addprojects-page.component';

describe('AddprojectsPageComponent', () => {
  let component: AddprojectsPageComponent;
  let fixture: ComponentFixture<AddprojectsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddprojectsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddprojectsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
