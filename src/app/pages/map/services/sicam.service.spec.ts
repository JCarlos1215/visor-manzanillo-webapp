import { TestBed } from '@angular/core/testing';

import { SicamService } from './sicam.service';

describe('SicamService', () => {
  let service: SicamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SicamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
