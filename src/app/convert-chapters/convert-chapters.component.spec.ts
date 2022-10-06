import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertChaptersComponent } from './convert-chapters.component';

describe('ConvertChaptersComponent', () => {
  let component: ConvertChaptersComponent;
  let fixture: ComponentFixture<ConvertChaptersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConvertChaptersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertChaptersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
