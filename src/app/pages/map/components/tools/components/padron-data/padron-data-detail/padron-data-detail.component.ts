import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Manzana } from '../../multiple-avaluo/models/manzana';
import { SICAMService } from 'src/app/pages/map/services/sicam.service';
import { MatTableDataSource } from '@angular/material/table';
import { PredioSICAM } from '../models/predio-sicam';
import { Geometry } from 'geojson';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MapService } from 'sic-mapping-toolkit';
import { AvaluoSICAMData } from '../models/avaluo-sicam-data';
import { DebtSICAM } from '../models/debt-sicam';
import { PaidSICAM } from '../models/paid-sicam';
import { HistorySICAM } from '../models/history-sicam';
import { SICAMData } from '../models/sicam-data';
import { getFormattedDate } from 'src/app/utils/formatted-date';
import { getFormattedNumber } from 'src/app/utils/formatted-number';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/modules/security/services/auth.service';

const FEATURE_PADRON_PREDIO_PREFIX = '[PADRON_TOOL][DETAIL]';
const PADRON_PREDIO_STYLE: Style = new Style({
  stroke: new Stroke({
    color: '#e94e1b',
    width: 2,
    lineDash: undefined,
  }),
  fill: new Fill({
    color: 'rgba(233, 78, 27, 0.2)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: '#e94e1b',
    }),
    fill: new Fill({
      color: '#e94e1b',
    }),
  }),
});

@Component({
  selector: 'sic-padron-data-detail',
  templateUrl: './padron-data-detail.component.html',
  styleUrls: ['./padron-data-detail.component.scss']
})
export class PadronDataDetailComponent implements OnInit, AfterViewInit {
  title: string = 'Predios asociados a la manzana ';
  backdropMessage: string = 'Cargando predios asociados a la manzana...';
  showLoading: boolean = true;

  predioSelected: PredioSICAM = {
    idPredio: '',
    clase: 0,
    clave: '',
    subpredio: '',
    tipoPredio: '',
    cuenta: 0,
    areaCartografica: 0,
    areaPadron: 0,
    porcentaje: 0,
    propietario: '',
    ubicacion: '',
    numExterior: '',
    numInterior: '',
    colonia: '',
    geometry: null,
    feature: null as unknown as Geometry,
    isSelected: false
  };
  totalPredios: number = 0;
  totalPredioSinCartografia: number = 0;
  totalAreaDentroDel10: number = 0;
  totalAreaFueraDel10: number = 0;
  totalPredioCartografiaSinVinculoPadron: number = 0;
  totalRegimenCondominio: number = 0;
  totalPendienteRegularizacion: number = 0;
  totalPredioProcesoVinculacion: number = 0;
  totalZonaFederal: number = 0;

  predios = new MatTableDataSource<PredioSICAM>([]);
  predioColumns: string[] = ['clave', 'subpredio', 'tipoPredio', 'cuenta', 'areaCartografica', 'areaPadron', 'porcentaje', 'propietario', 'ubicacion', 'numExterior', 'numInterior', 'colonia'];
  avaluo = new MatTableDataSource<AvaluoSICAMData>([]);
  avaluoColumns: string[] = ['fecha', 'superficieTerreno', 'superficieConstruccion', 'valorTerreno', 'valorConstruccion', 'valorFiscal', 'indiviso', 'frente', 'profundidad', 'perimetro'];
  debt = new MatTableDataSource<DebtSICAM>([]);
  debtColumns: string[] = ['cuenta', 'recaudadora', 'clave', 'subpredio', 'tasa', 'importeAdeudado', 'recargoAdeudado', 'multas', 'saldo'];
  paid = new MatTableDataSource<PaidSICAM>([]);
  paidColumns: string[] = ['cuenta', 'recaudadora', 'clave', 'subpredio', 'tasa', 'fecha', 'folio', 'importePagado'];
  history = new MatTableDataSource<HistorySICAM>([]);
  historyColumns: string[] = ['cuenta', 'recaudadora', 'clave', 'subpredio', 'movimineto', 'descripcion', 'yearComprobante', 'folioComprobante'];

  // Permission
  canWatchPredioCategorization!: boolean;

  constructor(
    public dialogRef: MatDialogRef<PadronDataDetailComponent>,
    private SICAMService: SICAMService,
    private mapService: MapService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: Manzana
  ) { }

  ngOnInit(): void {
    this.canWatchPredioCategorization = this.authService.hasPermission('vcpv2');
  }

  ngAfterViewInit(): void {
    this.SICAMService.getPrediosByManzanaClave(this.data.clave, FEATURE_PADRON_PREDIO_PREFIX).subscribe((res: PredioSICAM[]) => {
      this.title += this.data.clave;
      this.predios.data = res;
      if (this.canWatchPredioCategorization) {
        this.totalPredios = res.length;
        this.predios.data.map((p: PredioSICAM) => {
          switch(p.clase) {
            case -1:
              this.totalPredioSinCartografia++;
              break;
            case 1:
              this.totalAreaDentroDel10++;
              break;
            case 2:
              this.totalAreaFueraDel10++;
              break;
            case 3:
              this.totalPredioCartografiaSinVinculoPadron++;
              break;
            case 4:
              this.totalRegimenCondominio++;
              break;
            case 5:
              this.totalPendienteRegularizacion++;
              break;
            case 6:
              this.totalPredioProcesoVinculacion++;
              break;
            case 7:
              this.totalZonaFederal++;
              break;
            default:
              break;
          }
        });
      }
      this.showLoading = false;
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      window.alert('Error al obtener datos de SICAM.');
    });
  }

  callClose(): void {
    this.dialogRef.close();
  }

  selectedPredio(row: PredioSICAM) {
    this.predioSelected.isSelected = false;
    row.isSelected = true;
    this.predioSelected = row;
    this.backdropMessage = `Cargando información del predio ${this.predioSelected.clave}`;
    this.showLoading = true;
    this.SICAMService.getSICAMData(row.tipoPredio, row.cuenta, row.clave).subscribe((res: SICAMData)=> {
      this.avaluo.data = res.avaluoSICAM;
      this.debt.data = res.debtSICAM;
      this.paid.data = res.paidSICAM;
      this.history.data = res.historySICAM;
      this.showLoading = false;
    });
  }

  watchPredio(feature: any): void {
    this.mapService.clearDrawings(FEATURE_PADRON_PREDIO_PREFIX);
    if (feature) {
      this.mapService.drawFeature(feature, PADRON_PREDIO_STYLE);
    }
  }

  getStyleClass(typeClass: number, isSelected: boolean): string {
    let classColor = '';
    switch (typeClass) {
      case -1:
        classColor = 'cianer';
        break;
      case 1:
        classColor = 'greener';
        break;
      case 2:
        classColor = 'yellower';
        break;
      case 3:
        classColor = 'reder';
        break;
      case 4:
        classColor = 'bluer';
        break;
      case 5:
        classColor = 'oranger';
        break;
      case 6:
        classColor = 'magentaer';
        break;
      case 7:
        classColor = 'grayer';
        break;
      default:
        break;
    }

    if (isSelected) {
      classColor += ' activeRow';
    }
    
    return classColor;
  }

  getTypeClass(typeClass: number): string {
    let className = '';
    switch (typeClass) {
      case -1:
        className = 'Predio en padrón sin cartografía';
        break;
      case 1:
        className = 'Área cartografía vs padrón catastral dentro del 10%';
        break;
      case 2:
        className = 'Área cartografía vs padrón catastral fuera del 10%';
        break;
      case 3:
        className = 'Predio en cartografía sin vínculo con padrón';
        break;
      case 4:
        className = 'Régimen de condominio';
        break;
      case 5:
        className = 'Pendiente de regularización';
        break;
      case 6:
        className = 'Predio en proceso de vinculación de utilidad pública';
        break;
      case 7:
        className = 'Predio en zona federal';
        break;
      default:
        break;
    }
    
    return className;
  }

  getFormatDate(fecha: string) {
    return getFormattedDate(new Date(fecha));
  }

  getTotalSaldo() {
    return getFormattedNumber(this.debt.data.map(d => d.saldo).reduce((acc, value) => acc + value, 0));
  }

  getTotalPagado() {
    return getFormattedNumber(this.paid.data.map(p => p.importePagado).reduce((acc, value) => acc + value, 0));
  }

  getReportPredio() {
    this.backdropMessage = 'Generando ficha técnica...';
    this.showLoading = true;
    this.SICAMService.getFichaReport(this.predioSelected.idPredio).subscribe((report: any) => {
      this.showLoading = false;
      window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      window.alert('Error al generar ficha técnica.');
    });
  }
}
