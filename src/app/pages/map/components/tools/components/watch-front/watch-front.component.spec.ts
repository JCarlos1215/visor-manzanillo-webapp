import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchFrontComponent } from './watch-front.component';

describe('WatchFrontComponent', () => {
  let component: WatchFrontComponent;
  let fixture: ComponentFixture<WatchFrontComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WatchFrontComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
