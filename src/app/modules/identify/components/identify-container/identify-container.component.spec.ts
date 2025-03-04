import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentifyContainerComponent } from './identify-container.component';

describe('IdentifyContainerComponent', () => {
  let component: IdentifyContainerComponent;
  let fixture: ComponentFixture<IdentifyContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentifyContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentifyContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
