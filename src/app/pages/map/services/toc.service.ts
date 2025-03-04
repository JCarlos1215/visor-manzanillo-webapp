import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import cuid from 'cuid';
import { map, Observable, of, tap } from 'rxjs';
import { LayerData } from 'src/app/modules/layer/models/layer-data';
import { LayerGroup, LayerGroupContent } from 'src/app/modules/layer/models/layer-group';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { TocTreeItem } from '../models/toc-tree-item';
import { TOCGroup } from '../../admin-panel/models/toc-group';
import { TOCLayer } from '../../admin-panel/models/toc-layer';
import { RefreshOption } from 'src/app/modules/layer/models/refresh-option';

@Injectable({
  providedIn: 'root'
})
export class TocService extends APIService {
  tocTree!: TocTreeItem[];

  constructor(http: HttpClient, auth: AuthService, router: Router) {
    super(http, auth, router);
    this.loadLayers();
  }

  loadLayers(): Observable<TocTreeItem[]> {
    if (this.tocTree) {
      return of(this.tocTree);
    } else {
      return this.reloadLayers();
    }
  }

  reloadLayers(): Observable<TocTreeItem[]> {
    return this.get(
      `${environment.constants.API_URL}/toc`).pipe(
      map((data: any): LayerGroup[] => data.groups),
      map((groups: LayerGroup[]) => {
        const toc = groups.map((group): TocTreeItem => this.constructTocTree(group as LayerGroup));
        return toc;
      }),
      tap((toc) => {
        this.tocTree = toc;
      })
    );
  }

  private constructTocTreeRecursive(data: LayerGroupContent, level: number): TocTreeItem {
    let node: TocTreeItem;
    if ((data as LayerGroup).group) {
      node = new TocTreeItem(
        (data as LayerGroup).group,
        (data as LayerGroup).icon,
        false,
        level
      );
      (data as LayerGroup).content.forEach((child) =>
        node.addChild(this.constructTocTreeRecursive(child, level + 1))
      );
    } else {
      node = new TocTreeItem((data as LayerData).title, null as unknown as string, true, level);
      (data as LayerData).id = `Layer.${cuid()}`;
      node.setData(data as LayerData);
      if (node.IsActive !== (data as LayerData).isVisible) {
        node.toggleActiveStatus();
      }
    }
    return node;
  }

  private constructTocTree(data: LayerGroup): TocTreeItem {
    return this.constructTocTreeRecursive(data, 0);
  }

  searchByService(service: string): TocTreeItem {
    if (!this.tocTree) {
      this.reloadLayers();
    }

    let layer: TocTreeItem = null as unknown as TocTreeItem;
    for(let i = 0; i < this.tocTree.length; i++) {
      const res: TocTreeItem = this.findLayer(this.tocTree[i], service);
      if(res){
        layer = res;
        break;
      }
    }
    return layer;
  }

  private findLayer(toc: TocTreeItem, filter: string): TocTreeItem {
    if (toc.isLayer) {
      if (toc.getLayerData().service === filter) {
        return toc;
      } else {
        return null as unknown as TocTreeItem;
      }
    } else {
      let layer: TocTreeItem = null as unknown as TocTreeItem;
      for(let i = 0; i < toc.getChildren().length; i++) {
        const res: TocTreeItem = this.findLayer(toc.getChildren()[i], filter);
        if(res){
          layer = res;
          break;
        }
      }
      return layer;
    }
  }

  updateDataTocLayer(data: RefreshOption): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/toc/update-layer`, data);
  }

  getLayers(): Observable<TOCGroup[]> {
    return this.get(`${environment.constants.API_URL}/toc/layers`).pipe(
      map((data: any): TOCGroup[] => {
        return data.map((group: any): TOCGroup => {
          return {
            group: group.group,
            idTocGroup: group.idTocGroup,
            idPermissionType: group.idPermissionType,
            permissionType: group.permissionType,
            idRol: group.idRol,
            status: false,
            tocLayers: group.tocLayers.map((row: any): TOCLayer => {
              return {
                idLayer: row.idLayer,
                capa: row.capa,
                service: row.service,
                group: row.group,
                idTocElement: row.idTocElement,
                hasPermission: false
              }
            })
          }
        });
      })
    );
  }

  getLayersByRol(rol: string): Observable<TOCGroup[]> {
    return this.get(`${environment.constants.API_URL}/toc/layers/${rol}`).pipe(
      map((data: any): TOCGroup[] => {
        return data.map((group: any): TOCGroup => {
          return {
            group: group.group,
            idTocGroup: group.idTocGroup,
            idPermissionType: group.idPermissionType,
            permissionType: group.permissionType,
            idRol: group.idRol,
            status: false,
            tocLayers: group.tocLayers.map((row: any): TOCLayer => {
              return {
                idLayer: row.idLayer,
                capa: row.capa,
                service: row.service,
                group: row.group,
                idTocElement: row.idTocElement,
                hasPermission: true
              }
            })
          }
        });
      })
    );
  }

  updateLayerPermissions(idRol: string, layers: TOCLayer[]): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/toc/permissions`, {
      idRol: idRol,
      tocLayers: layers
    });
  }
}
