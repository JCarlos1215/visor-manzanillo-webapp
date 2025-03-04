import { Component, OnDestroy, OnInit } from '@angular/core';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { environment } from 'src/environments/environment';

const FEATURE_DESLINDE_CATASTRAL_PREFIX = '[DESLINDE_CATASTRAL_TOOL]';
const DESLINDE_CATASTRAL_STYLE: Style = new Style({
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
  selector: 'sic-deslinde-catastral',
  templateUrl: './deslinde-catastral.component.html',
  styleUrls: ['./deslinde-catastral.component.scss']
})
export class DeslindeCatastralComponent implements OnInit, OnDestroy {
  mapEventHandlerId!: string;
  hasValidCoords: boolean = false;
  predio!: Predio;
  clave: string = '';
  backdropMessage: string = 'Descargando reporte de deslinde catastral...';
  showLoading: boolean = false;

  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  // Permission
  canPrintDeslinde!: boolean;
  canGenerateCotas!: boolean;

  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private catastroService: CatastroService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    this.canPrintDeslinde = this.authService.hasPermission('dscg2');
    this.canGenerateCotas = this.authService.hasPermission('dsce3');
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_DESLINDE_CATASTRAL_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      const [x, y] = evt.coordinate;
      const predioOption: PredioOption = {
        frentes: false,
        construcciones: false
      };
      this.showLoading = true;
      this.backdropMessage = 'Obteniendo datos del predio...';
      this.catastroService.getPredioAtPoint(x, y, predioOption).subscribe((res) => {
        this.predio = res;
        if (this.predio !== null) {
          this.hasValidCoords = true;
          this.clave = this.predio.formattedClave;
          const feature = this.featureService.createFeature(
            FEATURE_DESLINDE_CATASTRAL_PREFIX,
            this.predio.geometry,
            { 
              clave: this.predio.formattedClave,
              idPredio: this.predio.idPredio
            }
          );
          this.mapService.clearDrawings(FEATURE_DESLINDE_CATASTRAL_PREFIX);
          this.mapService.drawFeature(feature, DESLINDE_CATASTRAL_STYLE);
          this.showLoading = false;
        } else {
          this.showLoading = false;
          this.hasValidCoords = false;
        }
      });
    }
  }

  downloadDeslinde() {
    this.showResult = false;
    this.backdropMessage = 'Generando reporte de deslinde catastral...';
    this.showLoading = true;
    this.catastroService.getDeslindeReport(this.predio.idPredio).subscribe((report: any) => {
      this.showLoading = false;
      window.open(`${environment.constants.API_URL.replace('/api', '')}${report.uri}`, '_blank', 'noopener noreferrer');
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      window.alert('No se pudo generar el deslinde catastral');
    });
  }

  generateCotaLegal() {
    this.showResult = false;
    this.backdropMessage = 'Generando medidas según escritura...';
    this.showLoading = true;
    this.catastroService.addPredioCotaLegal(this.predio.idPredio).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Medidas según la escritura generadas';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Error al generar medidas';
      }
      this.showResult = true;
      this.showLoading = false;
    }, (error) => {
      console.log(error);
      this.resultCorrect = false;
      this.resultMessage = 'Error al ejecutar función para generar cotas';
      this.showResult = true;
      this.showLoading = false;
    });
    
  }
}
