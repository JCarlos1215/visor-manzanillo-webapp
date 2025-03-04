import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LayerService } from 'src/app/modules/layer/services/layer.service';
import { TocTreeItem } from '../../../models/toc-tree-item';
import { GraphService } from '../../../services/graph.service';
import { ChartDialogComponent } from '../chart-dialog/chart-dialog.component';
import { TocService } from '../../../services/toc.service';
import { MapService } from 'sic-mapping-toolkit';

@Component({
  selector: 'sic-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.scss']
})
export class LayerItemComponent implements OnInit {
  showDetails = false;
  simbology: any = '';
  opacity = 1;
  isRefreshing = false;
  color = '';

  @Input() contenido!: TocTreeItem;

  constructor(
    public dialog: MatDialog,
    private layerService: LayerService,
    private graphService: GraphService,
    private tocService: TocService,
    private mapService: MapService
  ) { }

  ngOnInit(): void {
    this.showDetails = false;
    this.opacity = this.contenido.getLayerData().opacity;
  }

  toggleDetails(item: TocTreeItem): void {
    if (item.isLayer) {
      this.simbology = item.getLayerData().legend;
      this.showDetails = !this.showDetails;
    }
  }

  toggle(item: TocTreeItem): void {
    item.toggleActiveStatus();
    if (item.isLayer) {
      const data = item.getLayerData();
      if (item.isActive) {
        this.layerService.addLayer(data.id, data);
        this.updateOpacity(item, this.opacity);
      } else {
        this.layerService.removeLayer(data.id);
      }
    }
  }

  updateOpacity(item: TocTreeItem, value: number | null): void {
    this.opacity = value as number;
    const data = item.getLayerData();
    if (item.isActive) {
      this.layerService.setOpacity(data.id, this.opacity);
    }
  }

  async openChart(layer: TocTreeItem) {
    const layerData = layer.getLayerData();
    this.graphService.getStatistic(layerData.id, layerData.service, layerData.graphOptions).subscribe((result: any) => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '60vw';
      dialogConfig.data = result;
      dialogConfig.data.title = layer.title;
      dialogConfig.data.isGraphBar = layerData.graphOptions.hasBar;
      dialogConfig.data.selectData = [];
      if (Array.isArray(result)) {
        for (let it = 0; it < result.length; it++) {
          dialogConfig.data.selectData.push({ view: result[it].title, value: it });
        }
      }
      this.dialog.open(ChartDialogComponent, dialogConfig);
    });
  }

  async refreshData(layer: TocTreeItem) {
    this.isRefreshing = true;
    const layerData = layer.getLayerData();
    this.tocService.updateDataTocLayer(layerData.refreshOption).subscribe((result: boolean) => {
      if (result) {
        alert('Datos actualizados con éxito');
      } else {
        alert('No se pudo actualizar datos');
      }
      this.isRefreshing = false;
    }, (error) => {
      alert(error);
      this.isRefreshing = false;
    });
  }

  isHex(item: TocTreeItem): boolean {
    let isNumberHex: boolean = false;
    if (item.isLayer) {
      const c = item.getLayerData().color;
      if (c[0] === '#') {
        isNumberHex = true;
        this.color = `background-color: ${c};`
      } else {
        this.color = c;
      }
    }
    return isNumberHex;
  }

  hasColorProperty(item: TocTreeItem): boolean {
    let hasColor: boolean = false;
    if (item.isLayer) {
      const c = item.getLayerData().color;
      if (c !== null) {
        hasColor = true;
      }
    }
    return hasColor;
  }

  getIcon(): string {
    return `assets/icons/layer/${this.color}`;
  }

  navigateToLayer(item: TocTreeItem) {
    const layerData = item.getLayerData();
    const bbox: Array<number> = [];
    const queryUrlCap = `${layerData.server}?service=WMS&version=1.1.1&request=GetCapabilities&format=text/xml`;

    fetch(queryUrlCap)
      .then(resp => resp.text())
      .then(capabilities => {
        let parser = new DOMParser()
        let doc = parser.parseFromString(capabilities, "application/xml");
        const layerNode = Array.from(doc.querySelectorAll('Layer Layer')).find(node => node.querySelector('Name')?.textContent === layerData.service.split(':')[1]);
        if (layerNode && layerNode.querySelector('BoundingBox')) {
          bbox.push(Number(layerNode.querySelector('BoundingBox')?.getAttribute('minx')))
          bbox.push(Number(layerNode.querySelector('BoundingBox')?.getAttribute('miny')))
          bbox.push(Number(layerNode.querySelector('BoundingBox')?.getAttribute('maxx')))
          bbox.push(Number(layerNode.querySelector('BoundingBox')?.getAttribute('maxy')))
        }
        if (bbox.length === 4) {
          this.mapService.getMapById(this.mapService.default).moveTo(bbox, true);
        }
      });  
  }
}
