import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GotoLocationComponent } from './goto-location.component';

describe('GotoLocationComponent', () => {
  let component: GotoLocationComponent;
  let fixture: ComponentFixture<GotoLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GotoLocationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GotoLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
