import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapConfigComponent } from './snap-config.component';

describe('SnapConfigComponent', () => {
  let component: SnapConfigComponent;
  let fixture: ComponentFixture<SnapConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnapConfigComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SnapConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
