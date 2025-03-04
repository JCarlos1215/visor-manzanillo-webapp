import { TestBed } from '@angular/core/testing';

import { AvaluoService } from './avaluo.service';

describe('AvaluoService', () => {
  let service: AvaluoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvaluoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
