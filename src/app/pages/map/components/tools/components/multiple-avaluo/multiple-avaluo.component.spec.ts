import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleAvaluoComponent } from './multiple-avaluo.component';

describe('MultipleAvaluoComponent', () => {
  let component: MultipleAvaluoComponent;
  let fixture: ComponentFixture<MultipleAvaluoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleAvaluoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleAvaluoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
