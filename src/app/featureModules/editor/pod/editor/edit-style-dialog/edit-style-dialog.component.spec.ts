import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStyleDialogComponent } from './edit-style-dialog.component';

describe('EditStyleDialogComponent', () => {
  let component: EditStyleDialogComponent;
  let fixture: ComponentFixture<EditStyleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStyleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStyleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
