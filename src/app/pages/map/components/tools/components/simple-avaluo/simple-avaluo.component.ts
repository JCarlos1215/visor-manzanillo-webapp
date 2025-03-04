import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { AnalysisDetailComponent } from './analysis-detail/analysis-detail.component';
import { AvaluoService } from 'src/app/pages/map/services/avaluo.service';
import { AuthService } from 'src/app/modules/security/services/auth.service';

const FEATURE_SIMPLE_AVALUO_PREFIX = '[SIMPLE_AVALUO_TOOL]';
const SIMPLE_AVALUO_PREDIO_STYLE: Style = new Style({
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
  selector: 'sic-simple-avaluo',
  templateUrl: './simple-avaluo.component.html',
  styleUrls: ['./simple-avaluo.component.scss']
})
export class SimpleAvaluoComponent implements OnInit, OnDestroy {
  mapEventHandlerId!: string;
  hasValidCoords: boolean = false;
  predio!: Predio;
  
  // Permission
  canBuildIndividualAvaluo!: boolean;
  canBuildReferredAvaluo!: boolean;

  titleTool: string = '';
  backdropMessage: string = 'Obteniendo avalúo...';
  showLoading: boolean = false;

  @Input() isReferred!: boolean;
  referredYears: number[] = [];
  yearSelected: number = 0;

  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private catastroService: CatastroService,
    private avaluoService: AvaluoService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {
    /*const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    for (let i = currentYear - 1; i >= 2018;  i--) {
      this.referredYears.push(i);
    }*/
    this.referredYears.push(2018, 2019, 2020, 2021, 2022, 2023);
  }

  ngOnInit(): void {
    this.canBuildIndividualAvaluo = this.authService.hasPermission('avig2');
    this.canBuildReferredAvaluo = this.authService.hasPermission('avrg2');

    if (this.isReferred) {
      this.titleTool = 'Avalúo referido';
      this.mapEventHandlerId = null as unknown as string;
    } else {
      this.titleTool = 'Avalúo individual';
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    }
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_SIMPLE_AVALUO_PREFIX);
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
      this.dialog.closeAll();
      this.showLoading = true;
      this.catastroService.getPredioAtPoint(x, y, predioOption).subscribe((res) => {
        this.predio = res;
        if (this.predio !== null) {
          this.hasValidCoords = true;
          const feature = this.featureService.createFeature(
            FEATURE_SIMPLE_AVALUO_PREFIX,
            this.predio.geometry,
            { 
              clave: this.predio.clave,
              idPredio: this.predio.idPredio
            }
          );
          this.mapService.clearDrawings(FEATURE_SIMPLE_AVALUO_PREFIX);
          this.mapService.drawFeature(feature, SIMPLE_AVALUO_PREDIO_STYLE);

          if (this.isReferred) {
            if (this.canBuildReferredAvaluo) {
              this.avaluoService.executeReferredAvaluo(this.predio.idPredio, this.yearSelected).subscribe((_res) => {
                this.openAnalisysDetail();
              }, (error) => {
                console.log(error);
                this.showLoading = false;
                window.alert('Error al ejecutar la función para el avalúo referido.');
              });
            } else {
              this.avaluoService.hasAvaluoReferred(this.predio.idPredio, this.yearSelected).subscribe((hasAvaluoReferredPredio) => {
                if (hasAvaluoReferredPredio) {
                  this.openAnalisysDetail();
                } else {
                  window.alert('No se tiene el permiso para generar avalúo referido.');
                  this.showLoading = false;
                }
              }, (error) => {
                console.log(error);
                this.showLoading = false;
                window.alert('Error al verificar si existe avalúo referido');
              });
            }
          } else {
            if (this.canBuildIndividualAvaluo) {
              this.avaluoService.executeSimpleAvaluo(this.predio.idPredio).subscribe((_res) => {
                this.openAnalisysDetail();
              }, (error) => {
                console.log(error);
                this.showLoading = false;
                window.alert('Error al ejecutar la función para el avalúo individual');
              });
            } else {
              this.avaluoService.hasAvaluo(this.predio.clave).subscribe((hasAvaluoPredio) => {
                if (hasAvaluoPredio) {
                  this.openAnalisysDetail();
                } else {
                  window.alert('No se tiene el permiso para generar avalúo.');
                  this.showLoading = false;
                }
              }, (error) => {
                console.log(error);
                this.showLoading = false;
                window.alert('Error al verificar si existe avalúo individual');
              });
            }
          }
        } else {
          this.showLoading = false;
        }
      });
    }
  }

  async openAnalisysDetail() {
    const dialogConfig = new MatDialogConfig();
    // dialogConfig.autoFocus = true;
    dialogConfig.width = '50vw';
    dialogConfig.maxHeight = 'calc(100% - 80px)';
    dialogConfig.position = {right: '64px', top: '80px'};
    // dialogConfig.disableClose = true;
    dialogConfig.hasBackdrop = false; 
    dialogConfig.data = { idPredio: this.predio.idPredio, isReferred: this.isReferred, year: this.yearSelected };
    this.showLoading = false;
    this.dialog.open(AnalysisDetailComponent, dialogConfig);
  }

  handleSelectYearReferred(evt: any) {
    const selectElement = evt.target;
    const value = selectElement.value;
    this.yearSelected = value;
    if (!this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
    } 
  }
}
