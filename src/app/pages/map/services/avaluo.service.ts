import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AvaluoData } from '../components/tools/components/simple-avaluo/models/avaluo-data';

@Injectable({
  providedIn: 'root'
})
export class AvaluoService extends APIService {
  constructor(
    http: HttpClient,
    auth: AuthService,
    router: Router
  ) {
    super(http, auth, router);
  }

  executeSimpleAvaluo(idPredio: string): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/avaluo/simple`, {
      idPredio
    });
  }

  executeMultipleAvaluo(idPredio: string, layer: string): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/avaluo/multiple`, {
      idPredio,
      layer
    });
  }

  getAvaluoData(idPredio: string): Observable<AvaluoData> {
    return this.get(`${environment.constants.API_URL}/avaluo/${idPredio}/data`);
  }

  getAvaluoReport(idPredio: string, type: string) {
    return this.get(`${environment.constants.API_URL}/avaluo/report/${idPredio}/${type}`);
  }

  hasAvaluo(clave: string) {
    return this.get(`${environment.constants.API_URL}/avaluo/has-avaluo/${clave}`);
  }

  deleteMultipleAvaluo(): Observable<boolean> {
    return this.delete(`${environment.constants.API_URL}/avaluo/multiple`);
  }

  executeReferredAvaluo(idPredio: string, year: number): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/avaluo/referido`, {
      idPredio,
      year
    });
  }

  getAvaluoReferred(idPredio: string, year: number): Observable<AvaluoData> {
    return this.get(`${environment.constants.API_URL}/avaluo/referido/${idPredio}/${year}`);
  }

  getAvaluoReferredReport(idPredio: string, year: number) {
    return this.get(`${environment.constants.API_URL}/avaluo/report/referido/${idPredio}/${year}`);
  }

  hasAvaluoReferred(idPredio: string, year: number) {
    return this.get(`${environment.constants.API_URL}/avaluo/referido/has-avaluo/${idPredio}/${year}`);
  }
}
