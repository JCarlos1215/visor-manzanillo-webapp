import { TestBed } from '@angular/core/testing';

import { ReprojectionService } from './reprojection.service';

describe('ReprojectionService', () => {
  let service: ReprojectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReprojectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
