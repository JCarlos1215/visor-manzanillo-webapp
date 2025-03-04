import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredioPreviewComponent } from './predio-preview.component';

describe('PredioPreviewComponent', () => {
  let component: PredioPreviewComponent;
  let fixture: ComponentFixture<PredioPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredioPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredioPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
