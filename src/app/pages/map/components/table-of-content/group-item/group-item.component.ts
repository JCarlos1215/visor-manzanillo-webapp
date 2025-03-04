import { Component, Input, OnInit } from '@angular/core';
import { TocTreeItem } from '../../../models/toc-tree-item';

@Component({
  selector: 'sic-group-item',
  templateUrl: './group-item.component.html',
  styleUrls: ['./group-item.component.scss']
})
export class GroupItemComponent implements OnInit {
  @Input() group!: TocTreeItem;
  isLayer: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.isLayer = this.group.IsLayer;
  }

  getIcon(icon: string): string {
    return `assets/icons/group/${icon}`;
  }

  /*toggleAll(item: TocTreeItem): void {
    item.toggleActiveStatus();
    const isTurnOn = item.IsActive;
    item.children.forEach((child) => {
      this.toggleChildren(child, isTurnOn);
      // this.toggleAll(layer);
      // layer.toggleActiveStatus();
    });
    //if (item.IsActive) {
      /*item.children.forEach((layer) => {
        //this.toggleAll(layer);
        layer.toggleActiveStatus();
      });*
    //}
    
    
    if (item.isLayer) {
      const data = item.getLayerData();
      if (item.isActive) {
        this.layerService.addLayer(data.id, data);
        this.updateOpacity(item, this.opacity);
      } else {
        this.layerService.removeLayer(data.id);
      }
    }*
  }

  toggleChildren(item: TocTreeItem, isTurnOn: boolean) {
    if (isTurnOn) {
      
    }

  }

  /*turnOnActiveLayers(toc: TocTreeItem) {
    if (toc.isLayer) {
      if (toc.IsActive) {
        const data = toc.getLayerData();
        this.layerService.addLayer(data.id, data);
        this.layerService.setOpacity(data.id, data.opacity);
      }
    } else {
      toc.children.forEach((layer) => {
        this.turnOnActiveLayers(layer);
      });
    }
  }*

  exclusiveClick(event: MouseEvent) {
    event.stopPropagation();
  }*/
}
