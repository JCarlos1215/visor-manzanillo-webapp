import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { SearchGroup } from 'src/app/modules/search/models/search-group';
import { SearchResult } from 'src/app/modules/search/models/search-result';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { FeatureService } from './feature.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService extends APIService {
  constructor(
    http: HttpClient,
    auth: AuthService, 
    router: Router,
    private featureService: FeatureService
  ) {
    super(http, auth, router);
  }

  search(term: string, idPrefix: string): Observable<SearchGroup<any>[]> {
    const params = new HttpParams().append('filter', term);
    return this.get(`${environment.constants.API_URL}/search`, params).pipe(
      map((data: any): SearchGroup<any>[] => {
        return data.map((groupData: any): SearchGroup<any> => {
          return {
            term: groupData.term,
            group: groupData.group,
            status: true,
            total: groupData.items.length,
            content: groupData.items.map((row: any): SearchResult<any> => {
              return {
                type: groupData.term,
                display: row.display,
                data: row.data,
                feature: this.featureService.createFeature(idPrefix, row.data.geometry, row.data)
              }
            })
          }
        })
      })
    );
  }
}
