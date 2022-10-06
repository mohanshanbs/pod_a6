import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleDropdownDialogComponent } from './style-dropdown-dialog.component';

describe('StyleDropdownDialogComponent', () => {
  let component: StyleDropdownDialogComponent;
  let fixture: ComponentFixture<StyleDropdownDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StyleDropdownDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StyleDropdownDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
