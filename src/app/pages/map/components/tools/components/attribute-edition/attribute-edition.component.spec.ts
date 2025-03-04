import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributeEditionComponent } from './attribute-edition.component';

describe('AttributeEditionComponent', () => {
  let component: AttributeEditionComponent;
  let fixture: ComponentFixture<AttributeEditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttributeEditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttributeEditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
