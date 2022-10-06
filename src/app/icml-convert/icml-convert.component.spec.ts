import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcmlConvertComponent } from './icml-convert.component';

describe('IcmlConvertComponent', () => {
  let component: IcmlConvertComponent;
  let fixture: ComponentFixture<IcmlConvertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcmlConvertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcmlConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
