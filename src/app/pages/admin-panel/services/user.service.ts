import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { User } from 'src/app/modules/security/models/user';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { APIService } from 'src/app/utils/api.service';
import { environment } from 'src/environments/environment';
import { Rol } from '../models/rol';
import { ToolGroup } from '../models/tool-group';
import { ToolPermission } from '../models/tool-permission';
import { Parameter } from '../models/parameter';
import { SystemUser } from '../models/system-user';

@Injectable({
  providedIn: 'root'
})
export class UserService extends APIService {
  constructor(http: HttpClient, auth: AuthService, router: Router) {
    super(http, auth, router);
  }

  createUser(user: SystemUser): Observable<SystemUser> {
    return this.post(`${environment.constants.API_URL}/user`, user);
  }

  updateUser(user: SystemUser): Observable<User> {
    return this.put(`${environment.constants.API_URL}/user`, user);
  }

  deleteUser(idUser: string): Observable<boolean> {
    return this.delete(`${environment.constants.API_URL}/user/${idUser}`);
  }

  getUsers(): Observable<SystemUser[]> {
    return this.get(`${environment.constants.API_URL}/user`);
  }

  getRols(): Observable<Rol[]> {
    return this.get(`${environment.constants.API_URL}/user/rol`);
  }

  createRol(rol: Rol): Observable<Rol> {
    return this.post(`${environment.constants.API_URL}/user/rol`, rol);
  }

  updateRol(rol: Rol): Observable<Rol> {
    return this.put(`${environment.constants.API_URL}/user/rol`, rol);
  }

  deleteRol(idRol: string): Observable<boolean> {
    return this.delete(`${environment.constants.API_URL}/user/rol/${idRol}`);
  }

  getTools(): Observable<ToolGroup[]> {
    return this.get(`${environment.constants.API_URL}/user/tools`).pipe(
      map((data: any): ToolGroup[] => {
        return data.map((group: any): ToolGroup => {
          return {
            group: group.group,
            idPermissionType: group.idPermissionType,
            permissionType: group.permissionType,
            idRol: group.idRol,
            status: false,
            tools: group.tools.map((row: any): ToolPermission => {
              return {
                idTool: row.idTool,
                name: row.name,
                description: row.description,
                code: row.code,
                hasPermission: false
              }
            })
          }
        });
      })
    );
  }

  getToolsByRol(rol: string): Observable<ToolGroup[]> {
    return this.get(`${environment.constants.API_URL}/user/tools/${rol}`).pipe(
      map((data: any): ToolGroup[] => {
        return data.map((group: any): ToolGroup => {
          return {
            group: group.group,
            idPermissionType: group.idPermissionType,
            permissionType: group.permissionType,
            idRol: group.idRol,
            status: false,
            tools: group.tools.map((row: any): ToolPermission => {
              return {
                idTool: row.idTool,
                name: row.name,
                description: row.description,
                code: row.code,
                hasPermission: true
              }
            })
          }
        });
      })
    );
  }

  updateToolPermissions(idRol: string, tools: ToolPermission[]): Observable<boolean> {
    return this.post(`${environment.constants.API_URL}/user/permissions`, {
      idRol: idRol,
      toolPermissions: tools
    });
  }

  getUserPermissions(): Observable<ToolPermission[]> {
    return this.get(`${environment.constants.API_URL}/user/permissions`);
  }

  getParams(): Observable<Parameter[]> {
    return this.get(`${environment.constants.API_URL}/user/param`);
  }

  updateParam(param: Parameter): Observable<Parameter> {
    return this.put(`${environment.constants.API_URL}/user/param`, {
      parameter: param
    });
  }
}
