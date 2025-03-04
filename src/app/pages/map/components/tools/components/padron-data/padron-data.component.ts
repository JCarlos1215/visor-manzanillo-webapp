import { Component, OnDestroy, OnInit } from '@angular/core';
import { Circle, Style, Fill, Stroke } from 'ol/style';
import { Manzana } from '../multiple-avaluo/models/manzana';
import { MapEventType, MapService } from 'sic-mapping-toolkit';
import { FeatureService } from 'src/app/pages/map/services/feature.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CatastroService } from 'src/app/pages/map/services/catastro.service';
import { PadronDataDetailComponent } from './padron-data-detail/padron-data-detail.component';

const FEATURE_PADRON_PREFIX = '[PADRON_TOOL]';
const PADRON_MANZANA_STYLE: Style = new Style({
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
  selector: 'sic-padron-data',
  templateUrl: './padron-data.component.html',
  styleUrls: ['./padron-data.component.scss']
})
export class PadronDataComponent implements OnInit, OnDestroy {
  mapEventHandlerId!: string;
  manzana!: Manzana;
  
  backdropMessage: string = 'Obteniendo predios asociados a la manzana...';
  showLoading: boolean = false;

  isOpenDialog: boolean = false;
  constructor(
    private mapService: MapService,
    private featureService: FeatureService,
    private catastroService: CatastroService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.mapEventHandlerId = this.mapService.addEventHandler(MapEventType.SINGLECLICK, this.mapClickHandler(), 'HIGH');
  }

  ngOnDestroy(): void {
    this.mapService.clearDrawings(FEATURE_PADRON_PREFIX);
    if (!!this.mapEventHandlerId) {
      this.mapService.removeEventHandler(this.mapEventHandlerId);
      this.mapEventHandlerId = null as unknown as string;
    }
  }

  mapClickHandler() {
    return (evt: any) => {
      const [x, y] = evt.coordinate;
      this.dialog.closeAll();
      this.showLoading = true;
      this.catastroService.getManzanaAtPoint(x, y).subscribe((res) => {
        this.manzana = res;
        if (this.manzana !== null) {
          const feature = this.featureService.createFeature(
            FEATURE_PADRON_PREFIX,
            this.manzana.geometry,
            { 
              clave: this.manzana.clave,
              idManzana: this.manzana.idManzana,
              manzana: this.manzana.manzana
            }
          );
          this.mapService.clearDrawings(FEATURE_PADRON_PREFIX);
          this.mapService.drawFeature(feature, PADRON_MANZANA_STYLE);
          this.openPadronDetail();
        } else {
          this.showLoading = false;
        }
      });
    }
  }

  async openPadronDetail() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '50vw';
    dialogConfig.maxHeight = 'calc(100% - 80px)';
    dialogConfig.position = {right: '64px', top: '80px'};
    dialogConfig.hasBackdrop = false; 
    dialogConfig.data = this.manzana;
    this.showLoading = false;
    this.isOpenDialog = true;
    const dialogRef = this.dialog.open(PadronDataDetailComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(_res => {
      this.isOpenDialog = false;
    });
  }
}
