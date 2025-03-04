import { TestBed } from '@angular/core/testing';

import { CatastroService } from './catastro.service';

describe('CatastroService', () => {
  let service: CatastroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatastroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
