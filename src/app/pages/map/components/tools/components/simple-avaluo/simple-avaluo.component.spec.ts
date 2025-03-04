import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleAvaluoComponent } from './simple-avaluo.component';

describe('SimpleAvaluoComponent', () => {
  let component: SimpleAvaluoComponent;
  let fixture: ComponentFixture<SimpleAvaluoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleAvaluoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleAvaluoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
