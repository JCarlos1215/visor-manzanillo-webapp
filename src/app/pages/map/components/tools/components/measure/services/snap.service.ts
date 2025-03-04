import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, of, tap } from 'rxjs';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SnapService extends APIService {
  config;
  snapLayers: any[] = [];

  constructor(
    http: HttpClient,
    auth: AuthService,
    router: Router
  ) {
    super(http, auth, router);
  }

  saveSnapConfig(layers: any[]) {
    this.snapLayers = layers;
  }

  getSnapLayers() {
    return this.snapLayers;
  }

  getConfiguration() {
    if (!!this.config) {
      return of(this.config);
    } else {
      return this.get(`${environment.constants.API_URL}/snap/layers`)
      .pipe(
        map((response: any) => response),
        tap((data) => {
          this.config = data;
          this.snapLayers = data;
        })
      );
    }
  }

  getFeatures(idLayer: string, bbox: number[], scale: number) {
    const params = new HttpParams().append('bbox', bbox.join(',')).append('scale', `${scale}`);
    return this.get(`${environment.constants.API_URL}/snap/${idLayer}/query`, params).pipe(
      map((response: any) => response)
    );
  }
}
