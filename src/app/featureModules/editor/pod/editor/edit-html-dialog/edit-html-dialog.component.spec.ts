import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHtmlDialogComponent } from './edit-html-dialog.component';

describe('EditHtmlDialogComponent', () => {
  let component: EditHtmlDialogComponent;
  let fixture: ComponentFixture<EditHtmlDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditHtmlDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHtmlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
