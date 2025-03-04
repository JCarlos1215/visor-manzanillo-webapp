import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { Predio } from '../models/predio';
import { PredioOption } from '../models/predio-option';
import { Construction } from '../models/construction';
import { NumeroExterior } from '../models/numero-exterior';
import { Fusion } from '../models/fusion';
import { Division } from '../models/division';
import { EditionLayer } from '../models/edition-layer';
import { EditionAttribute } from '../models/edition-attribute';
import { EditionObject } from '../models/edition-object';
import { PrintData } from '../components/tools/components/print/models/print-data';
import { CertificateData } from '../components/tools/components/print/models/certificate-data';
import { Colonia } from '../components/tools/components/multiple-avaluo/models/colonia';
import { Manzana } from '../components/tools/components/multiple-avaluo/models/manzana';
import { Lindero } from '../components/tools/components/predio-divison/models/lindero';
import { Paralela } from '../components/tools/components/predio-divison/models/paralela';
import { Sector } from '../components/tools/components/multiple-avaluo/models/sector';
import { PredioInformation } from '../models/predio-information';
import { KMLGeometryData } from '../components/tools/components/upload-geom/models/kml-geometry-data';
import { FeatureService } from './feature.service';
import { ConoStreetView } from '../models/cono-street-view';

@Injectable({
  providedIn: 'root'
})
export class CatastroService extends APIService {
  constructor(
    http: HttpClient,
    auth: AuthService,
    router: Router,
    private featureService: FeatureService
  ) {
    super(http, auth, router);
  }

  getPredioAtPoint(x: number, y: number, options: PredioOption): Observable<Predio> {
    return this.post(`${environment.constants.API_URL}/catastro/predio`, {
      x,
      y,
      options
    }).pipe(
      map((result: any) => (result.total === 1 ? result.predios[0] : null))
    );
  }

  getConstructionAtPoint(x: number, y: number): Observable<Construction> {
    return this.post(`${environment.constants.API_URL}/catastro/construction`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.total === 1 ? result.construcciones[0] : null))
    );
  }

  getNumeroExteriorAtPoint(x: number, y: number): Observable<NumeroExterior> {
    return this.post(`${environment.constants.API_URL}/catastro/numero-exterior`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.numerosExteriores.length > 0 ? result.numerosExteriores[0] : null))
    );
  }

  getHeading(idPredioFrente: string): Observable<number> {
    return this.get(`${environment.constants.API_URL}/catastro/predio/frente/${idPredioFrente}`);
  }

  getReferredHeading(idPredioFrente: string): Observable<number> {
    return this.get(`${environment.constants.API_URL}/catastro/predio/frente-referred/${idPredioFrente}`);
  }

  getManzanaAtPoint(x: number, y: number): Observable<Manzana> {
    return this.post(`${environment.constants.API_URL}/catastro/manzana`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.total === 1 ? result.manzanas[0] : null))
    );
  }

  getColoniaAtPoint(x: number, y: number): Observable<Colonia> {
    return this.post(`${environment.constants.API_URL}/catastro/colonia`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.total === 1 ? result.colonias[0] : null))
    );
  }

  getSectorAtPoint(x: number, y: number): Observable<Sector> {
    return this.post(`${environment.constants.API_URL}/catastro/sector`, {
      x,
      y
    }).pipe(
      map((result: any) => (result.total === 1 ? result.sector[0] : null))
    );
  }

  getPredioByClave(clave: string): Observable<Predio> {
    return this.get(`${environment.constants.API_URL}/catastro/predio/${clave}`);
  }

  getPredioPlano(clave: string) {
    return this.get(`${environment.constants.API_URL}/catastro/predio/${clave}/plano`);
  }

  getReportPredioPlanoSimple(printData: PrintData) {
    return this.post(`${environment.constants.API_URL}/catastro/predio/plano-simple`, {
      printData
    });
  }

  getReportManzanaPlanoSimple(printData: PrintData) {
    return this.post(`${environment.constants.API_URL}/catastro/manzana/plano-simple`, {
      printData
    });
  }

  getReportPredioPlanoCertificado(printData: PrintData, certificateData: CertificateData) {
    return this.post(`${environment.constants.API_URL}/catastro/predio/plano-certificado`, {
      printData,
      certificateData
    });
  }

  getReportManzanaPlanoCertificado(printData: PrintData, certificateData: CertificateData) {
    return this.post(`${environment.constants.API_URL}/catastro/manzana/plano-certificado`, {
      printData,
      certificateData
    });
  }

  createFusion(json: string): Observable<Fusion> {
    return this.post(`${environment.constants.API_URL}/catastro/fusion/generate`, {
      json
    });
  }

  applyFusion(idFusion: string, idPredominante: string): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/catastro/fusion/apply`, {
      idFusion,
      idPredominante
    });
  }

  validateFusion(claves: string[]): Observable<number> {
    return this.post(`${environment.constants.API_URL}/catastro/fusion/validate`, {
      claves
    });
  }

  validateFusionOwnerDebt(claves: string[]): Observable<string> {
    return this.post(`${environment.constants.API_URL}/catastro/fusion/validate-owner-debt`, {
      claves
    });
  }

  getLinderos(idPredio: string): Observable<Lindero[]> {
    return this.get(`${environment.constants.API_URL}/catastro/division/linderos/${idPredio}`);
  }

  deleteLinderos(idPredio: string) {
    return this.delete(`${environment.constants.API_URL}/catastro/division/linderos/${idPredio}`);
  }

  divideLindero(linderoData: Lindero) {
    return this.post(`${environment.constants.API_URL}/catastro/division/lindero`, {
      linderoData
    });
  }

  generateParalela(linderoData: Lindero) {
    return this.post(`${environment.constants.API_URL}/catastro/division/paralela`, {
      linderoData
    });
  }

  getParalelas(idPredio: string): Observable<Paralela[]> {
    return this.get(`${environment.constants.API_URL}/catastro/division/paralela/${idPredio}`);
  }

  cleanPredioDivision(idPredio: string) {
    return this.delete(`${environment.constants.API_URL}/catastro/division/clean/${idPredio}`);
  }

  createDivision(json: string, id: string): Observable<Division> {
    return this.post(`${environment.constants.API_URL}/catastro/division/generate`, {
      json,
      id
    });
  }

  applyDivision(idDivision: string): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/catastro/division/apply`, {
      idDivision
    });
  }

  validateDivision(claves: string[]): Observable<number> {
    return this.post(`${environment.constants.API_URL}/catastro/division/validate`, {
      claves
    });
  }

  alignLindero(idPredios: string[]): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/catastro/division/align-lindero`, {
      idPredios
    });
  }

  splitConstructions(idPredios: string[]): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/catastro/division/split-construction`, {
      idPredios
    });
  }

  getEditionLayers(): Observable<EditionLayer[]> {
    return this.get(`${environment.constants.API_URL}/catastro/edition/layers`);
  }

  getEditionAttributes(idLayer: string): Observable<EditionAttribute[]> {
    return this.get(`${environment.constants.API_URL}/catastro/edition/attribute/${idLayer}`);
  }

  isValidClasificationConstruction(clasification: string): Observable<boolean> {
    return this.get(`${environment.constants.API_URL}/catastro/construction/${clasification}/is-valid`);
  }

  updateAttributes(layer: EditionLayer, attributes: EditionAttribute[], id: string): Observable<boolean> {
    const attr: EditionAttribute[] = [];
    attributes.map((a) => {
      attr.push({
        idAttribute: a.idAttribute,
        idLayer: a.idLayer,
        attributeName: a.attributeName,
        attributeShow: a.attributeShow,
        hasCatalogue: a.hasCatalogue,
        queryCatalogue: a.queryCatalogue,
        catalogue: [],
        value: a.value,
        attributeType: a.attributeType
      });
    });

    return this.put(`${environment.constants.API_URL}/catastro/edition/attribute/`, {
      layer,
      attributes: attr,
      id
    });
  }

  getObjectAtPoint(layer: EditionLayer, attributes: EditionAttribute[], x: number, y: number): Observable<EditionObject> {
    const attr: EditionAttribute[] = [];
    attributes.map((a) => {
      attr.push({
        idAttribute: a.idAttribute,
        idLayer: a.idLayer,
        attributeName: a.attributeName,
        attributeShow: a.attributeShow,
        hasCatalogue: a.hasCatalogue,
        queryCatalogue: a.queryCatalogue,
        catalogue: [],
        value: a.value,
        attributeType: a.attributeType
      });
    });

    return this.post(`${environment.constants.API_URL}/catastro/object`, {
      layer,
      attributes: attr,
      x,
      y
    }).pipe(
      map((result: any) => (result.total === 1 ? result.objects[0] : null))
    );
  }

  deleteObjectById(layer: EditionLayer, id: string): Observable<boolean> {
    const params = new HttpParams().append('idLayer', layer.idLayer).append('schema', layer.schema).append('name', layer.name).append('layerName', layer.layerName).append('idName', layer.idName).append('canDelete', layer.canDelete);
    return this.delete(`${environment.constants.API_URL}/catastro/edition/${id}`, params);
  }

  getDeslindeReport(idPredio: string) {
    return this.get(`${environment.constants.API_URL}/catastro/report/deslinde-catastral/${idPredio}`);
  }

  addPredioCotaLegal(idPredio: string): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/catastro/predio/cota-legal`, {
      idpredio: idPredio
    });
  }

  getPredioInformationAtPoint(x: number, y: number): Observable<{ PredioUrbano: PredioInformation[], PredioUP: PredioInformation[], PredioParcela: PredioInformation[], PredioRustico: PredioInformation[] }> {
    return this.post(`${environment.constants.API_URL}/catastro/predio/information`, {
      x,
      y
    });
  }

  getFichaTecnicaReport(formattedClave: string, typePredio: string) {
    return this.get(`${environment.constants.API_URL}/catastro/report/ficha/${formattedClave}/${typePredio}`);
  }

  uploadGeometryKML(kml: string, name: string, description: string, idPrefix: string): Observable<KMLGeometryData[]> {
    return this.post(`${environment.constants.API_URL}/catastro/upload-kml`, {
      kml: kml,
      name: name,
      description: description
    }).pipe(
      map((data: any): KMLGeometryData[] => {
        return data.map((kml: any): KMLGeometryData => {
          return {
            id: kml.id,
            name: kml.name,
            description: kml.description,
            user: kml.user,
            fecha: kml.fecha,
            geometry: kml.geometry,
            feature: this.featureService.createFeature(idPrefix, kml.geometry)
          }
        })
      })
    );
  }

  getStreetViewTaking( latitud: number, longitud: number, heading: number, pitch: number, zoom: number, idPrefix: string): Observable<ConoStreetView> {
    return this.post(`${environment.constants.API_URL}/catastro/street-view-taking`, {
      latitud: latitud,
      longitud: longitud,
      heading: heading,
      pitch: pitch,
      zoom: zoom,
    }).pipe(
      map((data: any): ConoStreetView => {
        return {
          idCono: data.idCono,
          geometry: data.geometry,
          featureGeometry: this.featureService.createFeature(idPrefix, data.geometry),
          fuenteToma: data.fuenteToma,
          featureFuente: this.featureService.createFeature(idPrefix, data.fuenteToma),
          objetivoToma: data.objetivoToma,
          featureObjetivo: this.featureService.createFeature(idPrefix, data.objetivoToma),
          baseToma: data.baseToma,
          featureBase: this.featureService.createFeature(idPrefix, data.baseToma),
          extentGeom: data.extentGeom,
          featureExtent: this.featureService.createFeature(idPrefix, data.extentGeom),
          zoom: data.zoom,
          azimut: data.azimut,
          vertical: data.vertical,
          fecha: data.fecha,
          url: data.url,
          usuario: data.usuario,
          descripcion: data.descripcion
        }
      })
    );
  }

  deleteStreetViewTaking(): Observable<boolean> {
    return this.delete(`${environment.constants.API_URL}/catastro/street-view-taking`);
  }
}
