import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { APIError } from 'src/app/utils/api-error';
import { APIResponse } from 'src/app/utils/api-response';
import { environment } from 'src/environments/environment';
import { LoginData } from '../models/login-data';
import { User } from '../models/user';
import * as sha1 from 'js-sha1';
import { ToolPermission } from 'src/app/pages/admin-panel/models/tool-permission';

/**
 * Servicio para interactuar con la información y sesiones de los usuarios del sistema.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Variable que contiene la cadena del json de permisos del sistema.
   */
  permission: ToolPermission[] = undefined as unknown as ToolPermission[];
  /**
   * Constructor de servicio de autentificación.
   * @param http Variable HttpClient para hacer peticiones http.
   * @param router Variable Router para hacer el manejo de rutas dentro de la aplicación.
   */
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Obtiene los datos del usuario autentificado en el sistema con {@link User}.
   * @returns {User} datos del usuario autentificado.
   */
  getUser(): User {
    const data = sessionStorage.getItem('auth.user');
    const user: User = this.decodeUser(data as string);
    return user;
  }

  /**
   * Realiza la autentificación de un usuario en el sistema por medio de sus datos con el API de visor con {@link APIResponse}.
   * Si se puede autentificar con los datos proporcionados devuelve el usuario y lo guarda en el sistema, sino el error relacionado al por que no pudo autentificar.
   * @param loginData objeto con la información del usuario por autentificar {@link LoginData}.
   * @returns {User | Error} información del usuario autentificado o error del sistema.
   */
  login(loginData: LoginData): Observable<User> {
    return this.http.post<APIResponse<any>>(
      `${environment.constants.API_URL}/auth`, {
        username: loginData.username,
        password: this.hashPassword(loginData.password)
      }, { 
        withCredentials: true 
      }
    ).pipe(
      map((response: APIResponse<any>) => response.data),
      map((data: any): User => new User(
        data.idUser,
        data.username,
        data.token,
        data.fullName,
        data.job,
        data.company,
        data.idRol,
        data.isAdmin
      )),
      tap((user: User) => {
        this.saveUser(user);
      }),
      catchError(this.errorHandler())
    );
  }

  /**
   * Realiza un hash para ofuscar la contraseña.
   * @param password Cadena con la contraseña del usuario.
   * @returns {string} Cadena ofuscada con la contraseña.
   */
  hashPassword(password: string): string {
    return this.arrayBufferToBase64(sha1.array(this.toUTF8Array(password)));
  }

  /**
   * Convierte un arreglo a cadena base64.
   * @param buffer Arreglo UTF8 de la contraseña.
   * @returns {string} Cadena ofuscada con la contraseña.
   */
  private arrayBufferToBase64(buffer: any): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Obtiene el UTF8 de una cadena en un arreglo.
   * @param str Cadena con la contraseña del usuario.
   * @returns Arreglo de numeros con los codigos char de la contraseña.
   */
  private toUTF8Array(str: string): any[] {
    const utf8: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const charcode: number = str.charCodeAt(i);
      if (charcode < 0x80) { utf8.push(charcode); }
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6),
          0x80 | (charcode & 0x3f));
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f));
      }
      else {
        utf8.push(0xef, 0xbf, 0xbd);
      }
    }
    return utf8;
  }

  /**
   * Cierra la sesión de un usuario autentificado borrando su sesión en el sistema con {@link APIResponse}.
   * @returns {User | Error} devuelve el usuario nulo o un error del sistema.
   */
  logout() {
    const user = this.getUser();
    const authHeaders = new HttpHeaders().append('Authorization', `Bearer ${user.Token}`);
    const httpOptions = {
      headers: authHeaders,
      withCredentials: true
    }
    return this.http.delete<APIResponse<any>>(
      `${environment.constants.API_URL}/auth`,
      httpOptions
    ).pipe(
      map((response: any) => response.data),
      tap((_: User) => {
        this.deleteUser();
      }),
      catchError(this.errorHandler())
    );
  }

  /**
   * Guarda la sesión del usuario en el sistema codificandolo.
   * @param user Instancia del usuario autentificado.
   */
  saveUser(user: User): void {
    sessionStorage.removeItem('auth.user');
    sessionStorage.setItem('auth.user', this.encodeUser(user));
  }

  /**
   * Borra los datos del usuario autentificado en el sistema.
   * @returns {User} Datos nulos de usuario.
   */
  deleteUser(): User {
    sessionStorage.removeItem('auth.user');
    sessionStorage.removeItem('auth.permission');
    this.permission = undefined as unknown as ToolPermission[];
    return this.getUser();
  }

  /**
   * Codifica la informacion de un usuario autentificado.
   * @param user Instancia del usuario autentificado.
   * @returns {string} cadena codificada el usuario autentificado.
   */
  private encodeUser(user: User): string {
    const data = {
      idUser: user.IdUser,
      userName: user.UserName,
      token: user.Token,
      fullName: user.FullName,
      job: user.Job,
      company: user.Company,
      idRol: user.IdRol,
      isAdmin: user.IsAdmin,
    };
    return JSON.stringify(data);
  }

  /**
   * Decodifica la información de un usuario autentificado.
   * @param input cadena identificadora de la sesión del usuario.
   * @returns {User} Objeto con la información del usuario.
   */
  private decodeUser(input: string): User {
    try {
      const data = JSON.parse(input);
      return new User (
        data.idUser,
        data.userName,
        data.token,
        data.fullName,
        data.job,
        data.company,
        data.idRol,
        data.isAdmin
      );
    } catch {
      return null as unknown as User;
    }
  }

  /**
   * Guarda los permisos del usuario en el sistema codificandolo.
   * @param permission Arreglo de objetos con los permisos del usuario.
   */
  savePermissions(permission: ToolPermission[]): void {
    sessionStorage.removeItem('auth.permission');
    sessionStorage.setItem('auth.permission', JSON.stringify(permission));
  }

  /**
   * Carga los permisos del usuario.
   */
  loadPermission() {
    const data = sessionStorage.getItem('auth.permission');
    this.permission = JSON.parse(data as string);
  }

  /**
   * Verifica si el usuario cuenta con un permiso para utilizar alguna herramienta.
   * @param pemissionKey Cadena con el código del permiso a verificar.
   * @returns {boolean} Booleano que indica el valor del permiso
   */
  hasPermission(pemissionKey: string): boolean {
    if (this.permission === undefined) {
      this.loadPermission();
    }
    const index = this.permission.findIndex((p: ToolPermission) => p.code === pemissionKey);
    if (index >= 0) {
      return true;
    } else {
      return false;
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
            throw new APIError(error.message);
          case 401:
          case 403:
            self.router.navigate(['/login']);
            throw new APIError(error.error.data);
          case 500:
            throw new APIError(error.message);
        }
        throw new Error('Server Error');
      } else {
        throw new Error('Unexpected Error');
      }
    };
  }
}
