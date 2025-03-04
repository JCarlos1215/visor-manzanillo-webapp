import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadGeomComponent } from './upload-geom.component';

describe('UploadGeomComponent', () => {
  let component: UploadGeomComponent;
  let fixture: ComponentFixture<UploadGeomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadGeomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadGeomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
