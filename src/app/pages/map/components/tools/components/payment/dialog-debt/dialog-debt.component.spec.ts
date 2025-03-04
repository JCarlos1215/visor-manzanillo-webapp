import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDebtComponent } from './dialog-debt.component';

describe('DialogDebtComponent', () => {
  let component: DialogDebtComponent;
  let fixture: ComponentFixture<DialogDebtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDebtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDebtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
