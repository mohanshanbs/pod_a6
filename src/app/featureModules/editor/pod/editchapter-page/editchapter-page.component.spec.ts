import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditchapterPageComponent } from './editchapter-page.component';

describe('EditchapterPageComponent', () => {
  let component: EditchapterPageComponent;
  let fixture: ComponentFixture<EditchapterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditchapterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditchapterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
