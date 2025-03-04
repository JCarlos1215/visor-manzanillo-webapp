import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredioFusionComponent } from './predio-fusion.component';

describe('PredioFusionComponent', () => {
  let component: PredioFusionComponent;
  let fixture: ComponentFixture<PredioFusionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PredioFusionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PredioFusionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
