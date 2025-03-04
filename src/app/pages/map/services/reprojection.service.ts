import { Injectable } from '@angular/core';
import proj4 from 'proj4';

export enum ProjectionEnum {
  LatLong = 1,
  EPSG_3857 = 2,
  EPSG_4326 = 3,
  EPSG_6368 = 4,
  EPSG_32613 = 5,
  EPSG_6369 = 6,
  EPSG_100000 = 7
}

@Injectable({
  providedIn: 'root'
})
export class ReprojectionService {
  constructor() { }

  reproject(source: ProjectionEnum, destination: ProjectionEnum, coordinate: { x: number, y: number }): { x: number, y: number } {
    const reprojected = proj4(this.getProjectionString(source), this.getProjectionString(destination), coordinate);
    return { x: reprojected.x, y: reprojected.y };
  }
  
  private getProjectionString(projection: ProjectionEnum): string {
    switch (projection) {
      case ProjectionEnum.LatLong:
      return '+proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees +no_defs';
      case ProjectionEnum.EPSG_3857:
      return '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 '
        + '+x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs';
      case ProjectionEnum.EPSG_4326:
      return '+proj=longlat +datum=WGS84 +no_defs';
      case ProjectionEnum.EPSG_6368:
      return '+proj=utm +zone=13 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
      case ProjectionEnum.EPSG_32613:
      return '+proj=utm +zone=13 +datum=WGS84 +units=m +no_defs';
      case ProjectionEnum.EPSG_6369:
      return '+proj=utm +zone=14 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
      case ProjectionEnum.EPSG_100000:
      return '+proj=lcc +lat_1=19.21666666000047 +lat_2=19.48333333000023 +lat_0=19.03333330000026 +lon_0=-99.1666666599984 +x_0=40031.5 +y_0=-53.5 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
    }
  }
}
