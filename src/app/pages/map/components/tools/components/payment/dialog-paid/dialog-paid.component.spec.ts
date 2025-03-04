import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPaidComponent } from './dialog-paid.component';

describe('DialogPaidComponent', () => {
  let component: DialogPaidComponent;
  let fixture: ComponentFixture<DialogPaidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogPaidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPaidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
