import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { AvaluoService } from 'src/app/pages/map/services/avaluo.service';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { Manzana } from './models/manzana';
import { Colonia } from './models/colonia';
import { ZonaCatastral } from './models/zona-catastral';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { AuthService } from 'src/app/modules/security/services/auth.service';

const FEATURE_MULTIPLE_AVALUO_PREFIX = '[MULTIPLE_AVALUO_TOOL]';
const MULTIPLE_AVALUO_PREDIO_STYLE: Style = new Style({
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
  selector: 'sic-multiple-avaluo',
  templateUrl: './multiple-avaluo.component.html',
  styleUrls: ['./multiple-avaluo.component.scss']
})
export class MultipleAvaluoComponent implements OnInit, OnDestroy {
  layerSelected: string = '';
  showClipMap: boolean = false;
  toMultipleValue: string = '';
  mapEventHandlerId!: string;
  hasValidCoords: boolean = false;
  id: string = '';
  objectGeo!: Manzana | Colonia | ZonaCatastral;
  typeSelectedObject: string = '';

  backdropMessage = '';
  showLoading = false;

  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  showQuestionDeleteAvaluos = false;

  // Permission
  canDeleteAllAvaluos!: boolean;

  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private catastroService: CatastroService,
    private avaluoService: AvaluoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.canDeleteAllAvaluos = this.authService.hasPermission('avmb2');
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_MULTIPLE_AVALUO_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  handleSelectLayer() {
    this.showQuestionDeleteAvaluos = false;
    this.showClipMap = true;
    this.showResult = false;
    switch (this.layerSelected) {
      case 'Manzana':
        this.toMultipleValue = 'manzana';
        break;
      case 'Colonia':
        this.toMultipleValue = 'colonia';
        break;
      case 'ZonaCatastral':
        this.toMultipleValue = 'zona catastral';
        break;
      default:
        break;
    }
    if (this.toMultipleValue !== '' && !this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      this.showResult = false;
      const [x, y] = evt.coordinate;
      switch (this.layerSelected) {
        case 'Manzana':
          this.catastroService.getManzanaAtPoint(x, y).subscribe((res) => {
            this.objectGeo = res;
            if (this.objectGeo !== null) {
              this.typeSelectedObject = `Manzana: ${this.objectGeo.clave}`;
              this.hasValidCoords = true;
              this.id = this.objectGeo.idManzana;
              const feature = this.featureService.createFeature(
                FEATURE_MULTIPLE_AVALUO_PREFIX,
                this.objectGeo.geometry,
                { 
                  idManzana: this.objectGeo.idManzana,
                  clave: this.objectGeo.clave
                }
              );
              this.mapService.clearDrawings(FEATURE_MULTIPLE_AVALUO_PREFIX);
              this.mapService.drawFeature(feature, MULTIPLE_AVALUO_PREDIO_STYLE);
            }
          });
          break;
        case 'Colonia':
          this.catastroService.getColoniaAtPoint(x, y).subscribe((res) => {
            this.objectGeo = res;
            if (this.objectGeo !== null) {
              this.typeSelectedObject = `Colonia: ${this.objectGeo.nombre}`;
              this.hasValidCoords = true;
              this.id = this.objectGeo.idColonia;
              const feature = this.featureService.createFeature(
                FEATURE_MULTIPLE_AVALUO_PREFIX,
                this.objectGeo.geometry,
                { 
                  idColonia: this.objectGeo.idColonia,
                  nombre: this.objectGeo.nombre
                }
              );
              this.mapService.clearDrawings(FEATURE_MULTIPLE_AVALUO_PREFIX);
              this.mapService.drawFeature(feature, MULTIPLE_AVALUO_PREDIO_STYLE);
            }
          });
          break;
        case 'ZonaCatastral':
          /*this.catastroService.getZonaCatastralAtPoint(x, y).subscribe((res) => {
            this.objectGeo = res;
            if (this.objectGeo !== null) {
              this.typeSelectedObject = `Zona: ${this.objectGeo.nombre}`;
              this.hasValidCoords = true;
              this.id = this.objectGeo.idZonaCatastral;
              const feature = this.featureService.createFeature(
                FEATURE_MULTIPLE_AVALUO_PREFIX,
                this.objectGeo.geometry,
                { 
                  idZonaCatastral: this.objectGeo.idZonaCatastral,
                  zona: this.objectGeo.zona
                }
              );
              this.mapService.clearDrawings(FEATURE_MULTIPLE_AVALUO_PREFIX);
              this.mapService.drawFeature(feature, MULTIPLE_AVALUO_PREDIO_STYLE);
            }
          });*/
          break;
        default:
          break;
      }
    }
  }

  generateAvaluoMultiple() {
    this.showQuestionDeleteAvaluos = false;
    this.backdropMessage = `Generando avaluos multiples de ${this.toMultipleValue}, espere un momento...`;
    this.showLoading = true;
    const timeStart = new Date(Date.now());
    this.avaluoService.executeMultipleAvaluo(this.id, this.layerSelected).subscribe((res) => {
      this.showLoading = false;
      this.showResult = true;
      this.hasValidCoords = false;
      const timeEnd = new Date(Date.now());
      const diffTime = Math.abs(timeEnd.getTime() - timeStart.getTime()); // tiempo en milisegundos
      let resultDifTime = diffTime / 1000; // tiempo en segundos
      let formatTime: string;
      if (resultDifTime > 60) {
        const timeMinutes = Math.floor(resultDifTime / 60);
        const timeMinOnSeconds = timeMinutes * 60;
        const seconds = +(resultDifTime - timeMinOnSeconds).toFixed();
        const minutes =  (timeMinutes > 1) ? 'minutos ' : 'minuto ';
        formatTime = `${timeMinutes} ${minutes} ${seconds}`;
      } else {
        formatTime = resultDifTime.toFixed(2);
      }
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = `Avaluos generados \n${formatTime} segundos`;
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Error al generar avaluos.';
      }
    }, (error) => {
      console.log(error);
      this.showLoading = false;
      this.showResult = true;
      this.resultCorrect = false;
      this.resultMessage = 'Error al generar avaluos.';
    });
  }

  deleteAvaluoMultiple() {
    this.showQuestionDeleteAvaluos = false;
    this.backdropMessage = `Eliminando todos los avaluos, espere un momento...`;
    this.showLoading = true;
    this.avaluoService.deleteMultipleAvaluo().subscribe((res) => {
      this.showLoading = false;
      this.showResult = true;
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Avaluos borrados.';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Error al borrar avaluos.';
      }
    });
  }
}
