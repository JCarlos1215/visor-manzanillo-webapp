import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable } from 'rxjs';
import { AuthService } from '../modules/security/services/auth.service';
import { APIError } from './api-error';
import { APIResponse } from './api-response';

/**
 * Servicio API padre para generar servicios que interactuen con el API de visor.
 */
@Injectable({
  providedIn: 'root'
})
export class APIService {
  /**
   * Constructor de servicio de API.
   * @param http Variable HttpClient para hacer peticiones http.
   * @param auth Variable AuthService para poder usar las funciones del servicio de autentificación {@link AuthService}.
   * @param router Variable Router para hacer el manejo de rutas dentro de la aplicación.
   */
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) { }

  /**
   * Ejecuta una petición Get Blob verificando que el usuario del sistema este previamente autentificado.
   * @param url Cadena con la url a hacer la petición.
   * @param params HttpParams objeto con los parametros opcionales para ejecutar la petición.
   * @returns {Observable | Error} Devuelve el resultado de la petición o el error obtenido.
   */
  protected getBlob(url: string, params?: HttpParams): Observable<any> {
    const user = this.auth.getUser();
    if (user) {
      const authHeaders = new HttpHeaders().append(
        'Authorization',
        `Bearer ${user.Token}`
      );
      const httpOptions = {
        headers: authHeaders,
        params,
        observe: 'body',
        responseType: 'blob',
        withCredentials: true,
      };
      return this.http.get(url, httpOptions as any).pipe(catchError(this.errorHandler()));
    } else {
      throw new Error('No esta loggeado');
    }
  }

  /**
   * Ejecuta una petición Get verificando que el usuario del sistema este previamente autentificado, obteniendo los datos con {@link APIResponse}.
   * @param url Cadena con la url a hacer la petición.
   * @param params HttpParams objeto con los parametros opcionales para ejecutar la petición.
   * @returns {Observable | Error} Devuelve los datos de la petición al API o el error obtenido.
   */
  protected get<T>(url: string, params?: HttpParams): Observable<T> {
    const user = this.auth.getUser();
    if (user) {
      const authHeaders = new HttpHeaders().append(
        'Authorization',
        `Bearer ${user.Token}`
      );
      const httpOptions = {
        headers: authHeaders,
        params,
        withCredentials: true,
      };
      return this.http.get<APIResponse<T>>(url, httpOptions).pipe(
        map((response: APIResponse<T>): T => response.data),
        catchError(this.errorHandler())
      );
    } else {
      throw new Error('No esta loggeado');
    }
  }

  /**
   * Ejecuta una petición Post verificando que el usuario del sistema este previamente autentificado, obteniendo los datos con {@link APIResponse}.
   * @param url Cadena con la url a hacer la petición.
   * @param body Objeto con los datos a enviar a la petición.
   * @param params HttpParams objeto con los parametros opcionales para ejecutar la petición.
   * @returns {Observable | Error} Devuelve los datos de la petición al API o el error obtenido.
   */
  protected post<T>(url: string, body: any, params?: HttpParams): Observable<T> {
    const user = this.auth.getUser();
    if (user) {
      const authHeaders = new HttpHeaders().append(
        'Authorization',
        `Bearer ${user.Token}`
      );
      const httpOptions = {
        headers: authHeaders,
        params,
        withCredentials: true,
      };
      return this.http.post<APIResponse<T>>(url, body, httpOptions).pipe(
        map((response: APIResponse<T>): T => response.data),
        catchError(this.errorHandler())
      );
    } else {
      throw new Error('No esta loggeado');
    }
  }

  /**
   * Ejecuta una petición Put verificando que el usuario del sistema este previamente autentificado, obteniendo los datos con {@link APIResponse}.
   * @param url Cadena con la url a hacer la petición.
   * @param body Objeto con los datos a enviar a la petición.
   * @param params HttpParams objeto con los parametros opcionales para ejecutar la petición.
   * @returns {Observable | Error} Devuelve los datos de la petición al API o el error obtenido.
   */
  protected put<T>(url: string, body: any, params?: HttpParams): Observable<T> {
    const user = this.auth.getUser();
    if (user) {
      const authHeaders = new HttpHeaders().append(
        'Authorization',
        `Bearer ${user.Token}`
      );
      const httpOptions = {
        headers: authHeaders,
        params,
        withCredentials: true,
      };
      return this.http.put<APIResponse<T>>(url, body, httpOptions).pipe(
        map((response: APIResponse<T>): T => response.data),
        catchError(this.errorHandler())
      );
    } else {
      throw new Error('No esta loggeado');
    }
  }

  /**
   * Ejecuta una petición Patch verificando que el usuario del sistema este previamente autentificado, obteniendo los datos con {@link APIResponse}.
   * @param url Cadena con la url a hacer la petición.
   * @param body Objeto con los datos a enviar a la petición.
   * @param params HttpParams objeto con los parametros opcionales para ejecutar la petición.
   * @returns {Observable | Error} Devuelve los datos de la petición al API o el error obtenido.
   */
  protected patch<T>(url: string, body: any, params?: HttpParams): Observable<T> {
    const user = this.auth.getUser();
    if (user) {
      const authHeaders = new HttpHeaders().append(
        'Authorization',
        `Bearer ${user.Token}`
      );
      const httpOptions = {
        headers: authHeaders,
        params,
        withCredentials: true,
      };
      return this.http.patch<APIResponse<T>>(url, body, httpOptions).pipe(
        map((response: APIResponse<T>): T => response.data),
        catchError(this.errorHandler())
      );
    } else {
      throw new Error('No esta loggeado');
    }
  }

  /**
   * Ejecuta una petición Delete verificando que el usuario del sistema este previamente autentificado, obteniendo los datos con {@link APIResponse}.
   * @param url Cadena con la url a hacer la petición..
   * @param body Objeto con los datos a enviar a la petición.
   * @param params HttpParams objeto con los parametros opcionales para ejecutar la petición.
   * @returns {Observable | Error} Devuelve los datos de la petición al API o el error obtenido.
   */
  protected delete<T>(url: string, params?: HttpParams): Observable<T> {
    const user = this.auth.getUser();
    if (user) {
      const authHeaders = new HttpHeaders().append(
        'Authorization',
        `Bearer ${user.Token}`
      );
      const httpOptions = {
        headers: authHeaders,
        params,
        withCredentials: true,
      };
      return this.http.delete<APIResponse<T>>(url, httpOptions).pipe(
        map((response: APIResponse<T>): T => response.data),
        catchError(this.errorHandler())
      );
    } else {
      throw new Error('No esta loggeado');
    }
  }

  /**
   * Manejador de errores, según si es un error HTTP u otro.
   * En caso de no estar autorizado devuelve al login.
   * @returns {Error | APIError} Error del sistema encontrado
   */
  private errorHandler(): any {
    const self = this;
    return (error: any): any => {
      if (error instanceof HttpErrorResponse) {
        switch (error.status) {
          case 400:
            throw new APIError(error.error.data);
          case 401:
          case 403:
            self.router.navigate(['/login']);
            throw new APIError(error.error.data);
          case 500:
            throw new APIError(error.error.data);
        }
        throw new Error('Server Error');
      } else {
        throw new Error('Unexpected error');
      }
    };
  }
}
