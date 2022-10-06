import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcmlConversionProcessComponent } from './icml-conversion-process.component';

describe('IcmlConversionProcessComponent', () => {
  let component: IcmlConversionProcessComponent;
  let fixture: ComponentFixture<IcmlConversionProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcmlConversionProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcmlConversionProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
