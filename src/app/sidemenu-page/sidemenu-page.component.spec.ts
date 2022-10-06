import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidemenuPageComponent } from './sidemenu-page.component';

describe('SidemenuPageComponent', () => {
  let component: SidemenuPageComponent;
  let fixture: ComponentFixture<SidemenuPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidemenuPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidemenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
