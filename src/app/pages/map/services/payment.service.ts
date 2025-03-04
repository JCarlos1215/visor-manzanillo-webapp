import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PredioDebt } from '../models/predio-debt';
import { PredioPaid } from '../models/predio-paid';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends APIService {
  constructor(
    http: HttpClient,
    auth: AuthService,
    router: Router
  ) {
    super(http, auth, router);
  }

  getPredioDebtXCol(x: number, y: number): Observable<PredioDebt[]> {
    return this.post(`${environment.constants.API_URL}/payment/debt-col`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.predios))
    );
  }

  getPredioPaidXCol(x: number, y: number): Observable<PredioPaid[]> {
    return this.post(`${environment.constants.API_URL}/payment/paid-col`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.predios))
    );
  }

  getPredioDebtXMnz(x: number, y: number): Observable<PredioDebt[]> {
    return this.post(`${environment.constants.API_URL}/payment/debt-mnz`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.predios))
    );
  }

  getPredioPaidXMnz(x: number, y: number): Observable<PredioPaid[]> {
    return this.post(`${environment.constants.API_URL}/payment/paid-mnz`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.predios))
    );
  }

  getPaidReportXCol(colonia: string) {
    return this.get(`${environment.constants.API_URL}/payment/paid-col/${colonia}`);
  }

  getDebtReportXCol(colonia: string) {
    return this.get(`${environment.constants.API_URL}/payment/debt-col/${colonia}`);
  }

  getPaidReportXMnz(manzana: string) {
    return this.get(`${environment.constants.API_URL}/payment/paid-mnz/${manzana}`);
  }

  getDebtReportXMnz(manzana: string) {
    return this.get(`${environment.constants.API_URL}/payment/debt-mnz/${manzana}`);
  }
}
