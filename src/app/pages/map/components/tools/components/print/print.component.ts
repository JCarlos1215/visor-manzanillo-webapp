import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { Manzana } from '../multiple-avaluo/models/manzana';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { FormControl } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { PrintData } from './models/print-data';
import { getFormattedDate } from 'src/app/utils/formatted-date';
import { environment } from 'src/environments/environment';
import { CertificateData } from './models/certificate-data';
import { SICAMService } from 'src/app/pages/map/services/sicam.service';
import { AuthService } from 'src/app/modules/security/services/auth.service';

const FEATURE_PRINT_PREFIX = '[PRINT_TOOL]';
const PRINT_GEOM_STYLE: Style = new Style({
  stroke: new Stroke({
    color: '#b51e1c',
    width: 2,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(181, 30, 28, 0.2)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#b51e1c',
    }),
    fill: new Fill({
      color: '#b51e1c',
    }),
  }),
});

@Component({
  selector: 'sic-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit, OnDestroy {
  printOption: string = '';
  printOptionTitle: string = '';

  backdropMessage: string = 'Espere un momento...';
  showLoading: boolean = false;

  mapEventHandlerId!: string;
  hasValidCoords: boolean = false;
  typeGeomSelected: string = '';
  
  scala: string = '';
  personalScala = new FormControl(100);
  observation = new FormControl('');
  // monto = new FormControl(0);

  sizePage: string = '';
  applicant = new FormControl('');
  folio = new FormControl('');
  printer = new FormControl('');
  capture = new FormControl('');
  verify = new FormControl('');
  // fechaPago!: Date;
  activateLegal: boolean = false;

  predio!: Predio;
  manzana!: Manzana;

  // Permission
  canPrintSimple!: boolean;
  canPrintCertificate!: boolean;

  constructor(
    private mapService: MapService,
    private catastroService: CatastroService,
    private featureService: FeatureService,
    private sicamService: SICAMService,
    private adapter: DateAdapter<any>,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.adapter.setLocale('es');
    this.canPrintSimple = this.authService.hasPermission('imps2');
    this.canPrintCertificate = this.authService.hasPermission('impc3');
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_PRINT_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  selectPrintOption(option: string) {
    this.printOption = option;
    switch (option) {
      case 'simple':
        this.printOptionTitle = 'Plano simple';
        break;
      case 'certificado':
        this.printOptionTitle = 'Plano certificado';
        break;
      case 'alineamiento':
        this.printOptionTitle = 'Alineamiento y número oficial';
        break;
      case 'patrimonio':
        this.printOptionTitle = 'Patrimonio';
        break;
      default:
        this.printOptionTitle = '';
        this.typeGeomSelected = '';
        this.hasValidCoords = false;
        this.scala = '';
        this.personalScala.setValue(100);
        this.observation.setValue('');
        // this.monto.setValue(0);

        this.sizePage = '';
        this.applicant.setValue('');
        this.folio.setValue('');
        this.printer.setValue('');
        this.capture.setValue('');
        this.verify.setValue('');
        
        // this.fechaPago = undefined as unknown as Date;
        if (!!this.mapEventHandlerId) {
          this.mapService.removeEventHandler(this.mapEventHandlerId);
          this.mapEventHandlerId = null as unknown as string;
        }
        break;
    }
  }

  handleSelectGeom(evt: any) {
    const selectElement = evt.target;
    const value = selectElement.value;
    this.typeGeomSelected = value;
    this.hasValidCoords = false;
    this.scala = '';
    if (this.typeGeomSelected !== '' && !this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      const [x, y] = evt.coordinate;
      const predioOption: PredioOption = {
        frentes: false,
        construcciones: false
      };
      switch (this.typeGeomSelected) {
        case 'predio':
          this.catastroService.getPredioAtPoint(x, y, predioOption).subscribe((res) => {
            this.predio = res;
            if (this.predio !== null) {
              this.hasValidCoords = true;
              const feature = this.featureService.createFeature(
                FEATURE_PRINT_PREFIX,
                this.predio.geometry,
                { 
                  clave: this.predio.clave,
                  idPredio: this.predio.idPredio
                }
              );
              this.mapService.clearDrawings(FEATURE_PRINT_PREFIX);
              this.mapService.drawFeature(feature, PRINT_GEOM_STYLE);
            }
          });
          break;
        case 'manzana':
          this.catastroService.getManzanaAtPoint(x, y).subscribe((res) => {
            this.manzana = res;
            if (this.manzana !== null) {
              this.hasValidCoords = true;
              const feature = this.featureService.createFeature(
                FEATURE_PRINT_PREFIX,
                this.manzana.geometry,
                { 
                  clave: this.manzana.clave,
                  idManzana: this.manzana.idManzana
                }
              );
              this.mapService.clearDrawings(FEATURE_PRINT_PREFIX);
              this.mapService.drawFeature(feature, PRINT_GEOM_STYLE);
            }
          });
          break;
        default:
          break;
      }
    }
  }

  handleSelectScala(evt: any) {
    const selectElement = evt.target;
    const value = selectElement.value;
    this.scala = value;
  }

  getSimplePlano() {
    this.showLoading = true;
    const printData: PrintData = {
      clave: this.typeGeomSelected === 'predio' ? this.predio.clave : this.manzana.clave,
      typeGeom: this.typeGeomSelected,
      sizePage: this.sizePage,
      scala: this.scala,
      personalScala: this.personalScala.value,
      observation: this.observation.value,
      //amount: this.monto.value,
      //payDate: getFormattedDate(this.fechaPago)
    }

    if (this.typeGeomSelected === 'predio') {
      this.catastroService.getReportPredioPlanoSimple(printData).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      }, (error) => {
        window.alert(`Error al generar reporte: ${error}`);
        this.showLoading = false;
      });
    } else {
      this.catastroService.getReportManzanaPlanoSimple(printData).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      }, (error) => {
        window.alert(`Error al generar reporte: ${error}`);
        this.showLoading = false;
      });
    }
  }

  handleSelectPageSize(evt: any) {
    const selectElement = evt.target;
    const value = selectElement.value;
    this.sizePage = value;
  }

  validateDataSimplePlano(): boolean {
    let isValid = false;
    if (this.scala !== '' && this.sizePage !== '') {
      //if (this.referencia.value !== '' && this.monto.value > 0 && this.fechaPago !== undefined) {
      if (this.scala === 'personalizado') {
        if (this.personalScala.value > 0) {
          isValid = true;
        }
      } else {
        isValid = true;
      }
      //}
    }
    return isValid;
  }

  getPlanoCertificado() {
    this.showLoading = true;
    const printData: PrintData = {
      clave: this.typeGeomSelected === 'predio' ? this.predio.clave : this.manzana.clave,
      typeGeom: this.typeGeomSelected,
      sizePage: this.sizePage,
      scala: this.scala,
      personalScala: this.personalScala.value,
      observation: this.observation.value,
      // amount: this.monto.value,
      // payDate: getFormattedDate(this.fechaPago)
    };

    const certificateData: CertificateData = {
      applicant: this.applicant.value,
      folio: this.folio.value,
      printer: this.printer.value,
      capture: this.capture.value,
      verify: this.verify.value,
      hasCotaLegal: this.activateLegal
    };

    if (this.typeGeomSelected === 'predio') {
      this.catastroService.getReportPredioPlanoCertificado(printData, certificateData).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      }, (error) => {
        window.alert(`Error al generar reporte: ${error}`);
        this.showLoading = false;
      });
    } else {
      this.catastroService.getReportManzanaPlanoCertificado(printData, certificateData).subscribe((report: any) => {
        this.showLoading = false;
        window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
      }, (error) => {
        window.alert(`Error al generar reporte: ${error}`);
        this.showLoading = false;
      });
    }
  }

  validateDataPlanoCertificado(): boolean {
    let isValid = false;
    if (this.scala !== '') {
      if (this.sizePage !== '' && this.applicant.value !== '' && this.folio.value !== '' && this.printer.value !== '' && this.capture.value !== '' && this.verify.value !== '') {
        if (this.scala === 'personalizado') {
          if (this.personalScala.value > 0) {
            isValid = true;
          }
        } else {
          isValid = true;
        }
      }
    }
    return isValid;
  }

  /*getCertificadoData() {
    if (this.folio.value !== '' && !isNaN(this.folio.value)) {
      this.sicamService.getCertificateData(this.folio.value).subscribe((res) => {
        this.capture.setValue(res.capture);
        this.applicant.setValue(res.applicant);
      });
    }
  }*/
}
