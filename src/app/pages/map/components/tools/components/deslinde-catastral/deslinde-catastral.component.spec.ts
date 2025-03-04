import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeslindeCatastralComponent } from './deslinde-catastral.component';

describe('DeslindeCatastralComponent', () => {
  let component: DeslindeCatastralComponent;
  let fixture: ComponentFixture<DeslindeCatastralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeslindeCatastralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeslindeCatastralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
