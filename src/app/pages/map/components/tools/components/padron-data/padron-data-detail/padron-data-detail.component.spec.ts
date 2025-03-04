import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadronDataDetailComponent } from './padron-data-detail.component';

describe('PadronDataDetailComponent', () => {
  let component: PadronDataDetailComponent;
  let fixture: ComponentFixture<PadronDataDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PadronDataDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PadronDataDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
