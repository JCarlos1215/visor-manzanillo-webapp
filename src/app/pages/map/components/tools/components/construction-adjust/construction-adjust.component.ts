import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { Predio } from 'src/app/pages/map/models/predio';
import { PredioOption } from 'src/app/pages/map/models/predio-option';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { FeatureService } from 'src/app/pages/map/services/feature.service';

const FEATURE_CONSTRUCTION_ADJUST_PREFIX = '[CONSTRUCTION_ADJUST_TOOL]';
const CONSTRUCTION_ADJUST_STYLE: Style = new Style({
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
  selector: 'sic-construction-adjust',
  templateUrl: './construction-adjust.component.html',
  styleUrls: ['./construction-adjust.component.scss'],
})
export class ConstructionAdjustComponent implements OnInit, AfterViewInit, OnDestroy {
  backdropMessage: string = '...';
  showLoading: boolean = false;

  optionSelected: string = '';
  isOptionSelected: boolean = false;

  predios = new MatTableDataSource<Predio>([]);
  predioColumns: string[] = [
    'clave',
    'subpredio',
    'cuenta',
    'areaCartografica',
    'actions',
  ];

  mapEventHandlerId!: string;
  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  // tolerance: number = 0.05;

  prediosSelected: Predio[] = [];

  constructor(
    public dialogRef: MatDialogRef<ConstructionAdjustComponent>,
    private mapService: MapService,
    private catastroService: CatastroService,
    private featureService: FeatureService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_CONSTRUCTION_ADJUST_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  callClose(): void {
    this.dialogRef.close();
  }

  handleSelectLayer() {
    this.isOptionSelected = true;
    if (this.optionSelected !== '' && !this.mapEventHandlerId) {
      this.mapEventHandlerId = this.mapService.addEventHandler(
        MapEventType.SINGLECLICK,
        this.mapClickHandler(),
        'HIGH'
      );
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      this.showResult = false;
      this.backdropMessage = 'Obteniendo datos...';
      this.showLoading = true;
      const [x, y] = evt.coordinate;

      const predioOption: PredioOption = {
        frentes: false,
        construcciones: false,
      };
      this.catastroService
        .getPredioAtPoint(x, y, predioOption)
        .subscribe((res) => {
          if (res !== null) {
            const index = this.prediosSelected.findIndex(
              (p) => p.idPredio === res.idPredio
            );
            if (index === -1) {
              this.prediosSelected.push(res);
              this.predios.data = this.prediosSelected;
              const feature = this.featureService.createFeature(
                `${FEATURE_CONSTRUCTION_ADJUST_PREFIX}.${res.idPredio}`,
                res.geometry,
                {
                  idPredio: res.idPredio,
                  clave: res.clave,
                  cuenta: ''//res.cuenta,
                }
              );
              this.mapService.drawFeature(feature, CONSTRUCTION_ADJUST_STYLE);
            }
          }
          this.showLoading = false;
        });
    };
  }

  deleteSelected(id: string) {
    const prediosFilter = this.prediosSelected.filter((p) => p.idPredio !== id);
    this.prediosSelected = prediosFilter;
    this.predios.data = this.prediosSelected;
    this.mapService.clearDrawings(
      `${FEATURE_CONSTRUCTION_ADJUST_PREFIX}.${id}`
    );
  }

  applyAdjust() {
    this.backdropMessage = 'Aplicando ajuste de construcciones...';
    this.showLoading = true;
    this.showResult = false;
    const idPredios: string[] = [];
    this.prediosSelected.map((p) => {
      idPredios.push(p.idPredio);
    });

    if (this.optionSelected === 'align') {
      //if (this.tolerance <= 0.35 && this.tolerance >= 0) {
        this.catastroService.alignLindero(idPredios).subscribe((res) => {
          if (res) {
            this.resultCorrect = true;
            this.resultMessage = 'Ajuste de alinear de lindero realizado';
          } else {
            this.resultCorrect = false;
            this.resultMessage = 'No se pudo alinear lindero';
          }
          this.showResult = true;
          this.showLoading = false;
        }, (error) => {
          console.log(error);
          this.resultCorrect = false;
          this.resultMessage = 'Error al ejecutar alinea lindero';
          this.showResult = true;
          this.showLoading = false;  
        });
      /*} else {
        this.resultCorrect = false;
        this.resultMessage = 'La tolerancia debe estar entre 0 y 0.35';
        this.showResult = true;
        this.showLoading = false;
      }*/      
    } else {
      this.catastroService.splitConstructions(idPredios).subscribe((res) => {
        if (res) {
          this.resultCorrect = true;
          this.resultMessage = 'Ajuste de partir construcciones realizado';
        } else {
          this.resultCorrect = false;
          this.resultMessage = 'No se pudieron partir las construcciones';
        }
        this.showResult = true;
        this.showLoading = false;
      }, (error) => {
        console.log(error);
        this.resultCorrect = false;
        this.resultMessage = 'Error al ejecutar partir construcciones';
        this.showResult = true;
        this.showLoading = false;  
      });
    }
  }
}
