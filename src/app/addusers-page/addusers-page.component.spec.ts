import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddusersPageComponent } from './addusers-page.component';

describe('AddusersPageComponent', () => {
  let component: AddusersPageComponent;
  let fixture: ComponentFixture<AddusersPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddusersPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddusersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
