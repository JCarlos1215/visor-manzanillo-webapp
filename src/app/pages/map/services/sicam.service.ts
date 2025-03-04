import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { PredioSICAM } from '../components/tools/components/padron-data/models/predio-sicam';
import { SICAMData } from '../components/tools/components/padron-data/models/sicam-data';
import { FeatureService } from './feature.service';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

@Injectable({
  providedIn: 'root'
})
export class SICAMService extends APIService {
  constructor(
    http: HttpClient,
    auth: AuthService,
    router: Router,
    private featureService: FeatureService
  ) {
    super(http, auth, router);
  }

  getPrediosByManzanaClave(clave: string, idPrefix: string): Observable<PredioSICAM[]> {
    return this.get(`${environment.constants.API_URL}/sicam/manzana/${clave}`).pipe(
      map((data: any): PredioSICAM[] => {
        return data.map((row: any): PredioSICAM => {
          return {
            idPredio: row.idPredio,
            clase: row.clase,
            clave: row.clave,
            subpredio: row.subpredio,
            tipoPredio: row.tipoPredio,
            cuenta: row.cuenta,
            areaCartografica: row.areaCartografica,
            areaPadron: row.areaPadron,
            porcentaje: row.porcentaje,
            propietario: row.propietario,
            ubicacion: row.ubicacion,
            numExterior: row.numExterior,
            numInterior: row.numInterior,
            colonia: row.colonia,
            geometry: row.geometry,
            feature: row.geometry? this.featureService.createFeature(idPrefix, row.geometry) : null as unknown as Feature<Geometry>,
            isSelected: false
          }
        })
      })
    )
  }

  getSICAMData(tipo: string, cuenta: number, clave: string): Observable<SICAMData> {
    return this.get(`${environment.constants.API_URL}/sicam/data/${tipo}/${cuenta}/${clave}`);
  }

  getCertificateData(folio: number): Observable<{ applicant: string, capture: string }> {
    return this.get(`${environment.constants.API_URL}/sicam/certificado/${folio}`);
  }

  sendAvaluoToSICAM(idPredio: string, folio: string, observation: string, year: number): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/sicam/avaluo`, {
      idpredio: idPredio,
      folio,
      observation,
      year
    });
  }

  getFichaReport(idPredio: string) {
    return this.get(`${environment.constants.API_URL}/sicam/report/ficha/${idPredio}`);
  }
}
