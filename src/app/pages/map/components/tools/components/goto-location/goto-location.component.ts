import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MapService } from 'sic-mapping-toolkit';
import { ProjectionEnum, ReprojectionService } from 'src/app/pages/map/services/reprojection.service';
import Overlay from 'ol/Overlay';

@Component({
  selector: 'sic-goto-location',
  templateUrl: './goto-location.component.html',
  styleUrls: ['./goto-location.component.scss']
})
export class GotoLocationComponent implements OnInit {
  coordinateX = new FormControl('');
  coordinateY = new FormControl('');
  labelX = 'Coordenada X';
  labelY = 'Coordenada Y';
  type = new FormControl(5);
  pointTooltip!: Overlay;

  constructor(
    private mapService: MapService,
    private reprojectionService: ReprojectionService
  ) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.deleteOverlay();
  }

  gotoCoordinate() {
    this.deleteOverlay();
    // const data = this.coordinate.value;
    const tipo = +this.type.value;
    const [x, y] = [Number(this.coordinateX.value), Number(this.coordinateY.value)];
    //data.split(',').map((d: string) => d.trim()).map((d: string) => Number(d));
    if (x && y) {
      const map = this.mapService.getMapById(this.mapService.default);
      map.setZoom(20);
      if (tipo === ProjectionEnum.EPSG_32613) {
        map.setCenter([x, y]);
        this.pointTooltip = this.createTooltip(`x: ${x.toFixed(2)}<br>y: ${y.toFixed(2)}`);
        this.mapService.addOverlay(this.pointTooltip);
        this.pointTooltip.setPosition([x, y]);
      } else {
        const ll2utm = this.reprojectionService.reproject(ProjectionEnum.LatLong, ProjectionEnum.EPSG_32613, { x, y });
        map.setCenter([ll2utm.x, ll2utm.y]);
        this.pointTooltip = this.createTooltip(`x: ${ll2utm.x.toFixed(2)}<br>y: ${ll2utm.y.toFixed(2)}`);
        this.mapService.addOverlay(this.pointTooltip);
        this.pointTooltip.setPosition([ll2utm.x, ll2utm.y]);
      }
    }
  }

  createTooltip(text: string){
    const measureTooltipElement = document.createElement('div');
    measureTooltipElement.innerHTML = text;
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    const measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -7],
      positioning: 'bottom-center',
    });
    return measureTooltip;
  }
  
  deleteOverlay(): void {
    if (this.pointTooltip) {
      this.mapService.removeOverlay(this.pointTooltip);
      this.pointTooltip = null as unknown as Overlay;
    }
  }

  handleTypeCoord() {
    const tipo = +this.type.value;
    if (tipo === ProjectionEnum.EPSG_32613) {
      this.labelX = 'Coordenada X';
      this.labelY = 'Coordenada Y';
    } else {
      this.labelX = 'Longitud Oeste';
      this.labelY = 'Latitud Norte';
    }
  }
}
