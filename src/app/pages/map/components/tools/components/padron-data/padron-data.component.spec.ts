import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadronDataComponent } from './padron-data.component';

describe('PadronDataComponent', () => {
  let component: PadronDataComponent;
  let fixture: ComponentFixture<PadronDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PadronDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PadronDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
