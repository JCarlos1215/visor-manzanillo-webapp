import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredioDivisonComponent } from './predio-divison.component';

describe('PredioDivisonComponent', () => {
  let component: PredioDivisonComponent;
  let fixture: ComponentFixture<PredioDivisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredioDivisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredioDivisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
