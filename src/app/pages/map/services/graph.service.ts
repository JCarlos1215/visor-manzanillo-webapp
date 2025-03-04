import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { GraphOption } from 'src/app/modules/layer/models/graph-option';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { GraphData } from '../models/graph-data';

@Injectable({
  providedIn: 'root'
})
export class GraphService extends APIService {
  constructor(
    http: HttpClient,
    auth: AuthService,
    router: Router
  ) {
    super(http, auth, router);
  }

  getStatistic(idlayer: string, service: string, graphOptions: GraphOption) {
    const typeGraph = graphOptions.hasBar ? 'bar' : 'pie';
    return this.post(`${environment.constants.API_URL}/graph/${idlayer}/${typeGraph}`, {
      service,
      graphOptions
    }).pipe(
      map((graphics) => {
        if (Array.isArray(graphics)) {
          return graphics.map((graph: GraphData): GraphData => {
            return {
              title: graph.title,
              chartColors: graph.chartColors,
              chartData: graph.chartData,
              chartLabels: graph.chartLabels,
              total: graph.total,
              extraData: graph.extraData
            };
          });
        } else {
          return { message: graphics };
        }
      }), catchError(
        (err) => of ({ message: err.message === 'Server Error' ? 'Error al conectar con API' : err.message })
      )
    );
  }
}
