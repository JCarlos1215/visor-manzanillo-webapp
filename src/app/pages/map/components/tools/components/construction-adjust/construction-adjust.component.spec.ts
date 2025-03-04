import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionAdjustComponent } from './construction-adjust.component';

describe('ConstructionAdjustComponent', () => {
  let component: ConstructionAdjustComponent;
  let fixture: ComponentFixture<ConstructionAdjustComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstructionAdjustComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstructionAdjustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
