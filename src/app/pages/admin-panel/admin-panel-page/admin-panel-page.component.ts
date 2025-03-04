import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { User } from 'src/app/modules/security/models/user';
import { AuthService } from 'src/app/modules/security/services/auth.service';
import { UserService } from '../services/user.service';
import { Rol } from '../models/rol';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from '../components/question-dialog/question-dialog.component';
import { Question } from '../models/question';
import { TOCGroup } from '../models/toc-group';
import { TocService } from '../../map/services/toc.service';
import { TOCLayer } from '../models/toc-layer';
import { ToolGroup } from '../models/tool-group';
import { ToolPermission } from '../models/tool-permission';
import { Parameter } from '../models/parameter';
import { SystemUser } from '../models/system-user';
import { getFormattedDate } from 'src/app/utils/formatted-date';

@Component({
  selector: 'sic-admin-panel-page',
  templateUrl: './admin-panel-page.component.html',
  styleUrls: ['./admin-panel-page.component.scss']
})
export class AdminPanelPageComponent implements OnInit {
  user!: User;
  confirmPassword: string = '';
  newEditionUser: SystemUser = {
    idUser: '',
    username: '',
    password: '',
    createdAt: null as unknown as Date,
    idRol: '',
    rol: '',
    isAdmin: false,
    givenname: '',
    surname: '',
    company: '',
    job: ''
  };

  newEditionCurrentRol: Rol = {
    idRol: '',
    rolName: ''
  };
  view: string = 'user-list';

  backdropMessage: string = '...';
  showLoading: boolean = false;
  showResult = false;
  resultCorrect = true;
  resultMessage = '';

  rol: Rol[] = [];

  usuarios = new MatTableDataSource<SystemUser>([]);
  userColumns: string[] = ['apellido', 'nombre', 'rol', 'username', 'company', 'job', 'createdDate', 'actions'];

  roles = new MatTableDataSource<Rol>([]);
  rolColumns: string[] = ['rol', 'actions'];

  tocGroup: TOCGroup[] = [];
  permissionLayers: TOCLayer[] = [];

  toolGroup: ToolGroup[] = [];
  permissionTools: ToolPermission[] = [];

  params = new MatTableDataSource<Parameter>([]);
  paramColumns: string[] = ['nombre', 'descripcion', 'valor', 'actions'];

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private tocService: TocService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user.IsAdmin) {
      this.backdropMessage = 'Cargando usuarios...';
      this.showLoading = true;
      this.userService.getUsers().subscribe((res) => {
        this.usuarios.data = res;
        this.showLoading = false;
      });
    } else {
      this.router.navigate(['/map']);
    }
  }

  openMap() {
    this.router.navigate(['/map']);
  }

  selectedTab(tabChangeEvent: MatTabChangeEvent) {
    if (tabChangeEvent.index !== -1) {
      if (tabChangeEvent.index === 1) {
        this.changeView('rol-list');
      } else if (tabChangeEvent.index === 2) {
        this.changeView('param-list');
      } else {
        this.changeView('user-list');
      }
    }
  }

  applyFilterUser(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usuarios.filter = filterValue.trim().toLowerCase();
  }

  applyFilterRol(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.roles.filter = filterValue.trim().toLowerCase();
  }

  changeView(section: string) {
    this.view = section;
    this.showResult = false;
    switch(this.view) {
      case 'user-new':
        this.confirmPassword = '';
        this.newEditionUser = {
          idUser: '',
          username: '',
          password: '',
          createdAt: null as unknown as Date,
          idRol: '',
          rol: '',
          isAdmin: false,
          givenname: '',
          surname: '',
          company: '',
          job: ''
        };
        this.userService.getRols().subscribe((r) => {
          this.rol = r;
        });
        break;
      case 'user-edition':
        this.userService.getRols().subscribe((r) => {
          this.rol = r;
        });
        break;
      case 'user-list':
        this.backdropMessage = 'Cargando usuarios...';
        this.showLoading = true;
        this.userService.getUsers().subscribe((res) => {
          this.usuarios.data = res;
          this.usuarios.filter = '';
          this.showLoading = false;
        });
        break;
      case 'rol-list':
        this.backdropMessage = 'Cargando roles...';
        this.showLoading = true;
        this.userService.getRols().subscribe((res) => {
          this.roles.data = res;
          this.roles.filter = '';
          this.showLoading = false;
        });
        break;
      case 'rol-new':
        this.newEditionCurrentRol = {
          idRol: '',
          rolName: ''
        };
        break;
      case 'rol-edition':
        break;
      case 'permission-layer':
        this.backdropMessage = 'Cargando capas...';
        this.showLoading = true;
        this.tocService.getLayers().subscribe((res) => {
          this.tocGroup = res;
          this.tocService.getLayersByRol(this.newEditionCurrentRol.idRol).subscribe((permission) => {
            permission.map((g: TOCGroup) => {
              const indexGroup = this.tocGroup.findIndex((x: TOCGroup) => x.idTocGroup === g.idTocGroup);
              if (indexGroup >= 0) {
                g.tocLayers.map((l: TOCLayer) => {
                  const indexLayer = this.tocGroup[indexGroup].tocLayers.findIndex((x: TOCLayer) => x.idLayer === l.idLayer);
                  if (indexLayer >= 0) {
                    this.tocGroup[indexGroup].tocLayers[indexLayer].hasPermission = true;
                  }
                });
              }
            });
            this.showLoading = false;
          });
        });
        break;
      case 'permission-tool':
        this.backdropMessage = 'Cargando herramientas...';
        this.showLoading = true;
        this.userService.getTools().subscribe((res) => {
          this.toolGroup = res;
          this.userService.getToolsByRol(this.newEditionCurrentRol.idRol).subscribe((permission) => {
            permission.map((g: ToolGroup) => {
              const indexGroup = this.toolGroup.findIndex((x: ToolGroup) => x.group === g.group);
              if (indexGroup >= 0) {
                g.tools.map((t: ToolPermission) => {
                  const indexTool = this.toolGroup[indexGroup].tools.findIndex((x: ToolPermission) => x.idTool === t.idTool);
                  if (indexTool >= 0) {
                    this.toolGroup[indexGroup].tools[indexTool].hasPermission = true;
                  }
                });
              }
            });
            this.showLoading = false;
          });
        });
        break;
      case 'param-list':
        this.backdropMessage = 'Cargando parámetros...';
        this.showLoading = true;
        this.userService.getParams().subscribe((res) => {
          this.params.data = res;
          this.showLoading = false;
        });
        break;
      default:
        console.log('No disponible');
        break;
    }
  }

  getFormatDate(fecha: string) {
    return getFormattedDate(new Date(fecha));
  }

  userEdition(row: SystemUser) {
    this.changeView('user-edition');
    this.confirmPassword = '*****';
    this.newEditionUser = {
      idUser: row.idUser,
      username: row.username,
      password: '*****',
      createdAt: row.createdAt,
      idRol: row.idRol,
      rol: row.rol,
      isAdmin: row.isAdmin,
      givenname: row.givenname,
      surname: row.surname,
      company: row.company,
      job: row.job
    };
  }

  saveUser() {
    this.backdropMessage = 'Guardando usuario...';
    this.showLoading = true;
    if (this.view === 'user-edition') {
      if (this.newEditionUser.givenname !== '') {
        if (this.newEditionUser.idRol !== '') {
          if (this.newEditionUser.username !== '') {
            if (this.newEditionUser.password !== '' && this.confirmPassword !== '') {
              if (this.newEditionUser.password === this.confirmPassword) {
                this.confirmPassword !== '*****' ? this.newEditionUser.password = this.authService.hashPassword(this.confirmPassword) : false;
                this.userService.updateUser(this.newEditionUser).subscribe((_user) => {
                  this.resultCorrect = true;
                  this.resultMessage = 'Usuario editado correctamente';
                  this.confirmPassword = '*****';
                  this.newEditionUser.password = '*****';
                  this.showResult = true;
                  this.showLoading = false;
                }, (error) => {
                  this.resultCorrect = false;
                  this.resultMessage = error;
                  this.showResult = true;  
                  this.showLoading = false;
                })
              } else {
                this.resultCorrect = false;
                this.resultMessage = 'Las contraseñas no coinciden';
                this.showResult = true;
                this.showLoading = false;
              }
            } else {
              this.resultCorrect = false;
              this.resultMessage = 'Se requiere la contraseña y su confirmación';
              this.showResult = true;
              this.showLoading = false;
            }
          } else {
            this.resultCorrect = false;
            this.resultMessage = 'Se requiere un nombre de usuario';
            this.showResult = true;
            this.showLoading = false;
          }
        } else {
          this.resultCorrect = false;
          this.resultMessage = 'Se requiere elegir un rol';
          this.showResult = true;
          this.showLoading = false;
        }
        
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Se requiere el campo nombre';
        this.showResult = true;
        this.showLoading = false;
      }
    } else {
      if (this.newEditionUser.givenname !== '') {
        if (this.newEditionUser.idRol !== '') {
          if (this.newEditionUser.username !== '') {
            if (this.newEditionUser.password !== '' && this.confirmPassword !== '') {
              if (this.newEditionUser.password === this.confirmPassword) {
                this.newEditionUser.password = this.authService.hashPassword(this.confirmPassword);
                this.userService.createUser(this.newEditionUser).subscribe((_user) => {
                  this.resultCorrect = true;
                  this.resultMessage = 'Usuario guardado correctamente';
                  this.confirmPassword = '';
                  this.newEditionUser.password = '';
                  this.showResult = true;
                  this.showLoading = false;
                }, (error) => {
                  this.resultCorrect = false;
                  this.resultMessage = error;
                  this.showResult = true;  
                  this.showLoading = false;
                });
              } else {
                this.resultCorrect = false;
                this.resultMessage = 'Las contraseñas no coinciden';
                this.showResult = true;
                this.showLoading = false;
              }
            } else {
              this.resultCorrect = false;
              this.resultMessage = 'Se requiere la contraseña y su confirmación';
              this.showResult = true;
              this.showLoading = false;
            }
          } else {
            this.resultCorrect = false;
            this.resultMessage = 'Se requiere un nombre de usuario';
            this.showResult = true;
            this.showLoading = false;
          }
        } else {
          this.resultCorrect = false;
          this.resultMessage = 'Se requiere elegir un rol';
          this.showResult = true;
          this.showLoading = false;
        }
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Se requiere el campo nombre';
        this.showResult = true;
        this.showLoading = false;
      }
    }
  }

  userDelete(row: SystemUser) {
    const question: Question = {
      title: `Eliminar usuario ${row.username}`,
      question: '¿Está seguro que desea eliminar el usuario?',
      answerNo: 'No',
      answerYes: 'Si'
    };

    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      data: question,
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((dialogResponse) => {
      if (dialogResponse) {
        this.backdropMessage = 'Borrando usuario...';
        this.showLoading = true;
        this.userService.deleteUser(row.idUser).subscribe((res) => {
          if (res) {
            this.resultCorrect = true;
            this.resultMessage = 'Usuario eliminado correctamente';
            this.showResult = true;
            this.showLoading = false;
            this.changeView('user-list');
          } else {
            this.resultCorrect = false;
            this.resultMessage = 'No se pudo eliminar usuario';
            this.showResult = true;
            this.showLoading = false;
          }
        }, (error) => {
          console.log(error);
          this.resultCorrect = false;
          this.resultMessage = 'Error al eliminar usuario';
          this.showResult = true;
          this.showLoading = false;
        });
      }
    });
  }

  rolEdition(row: Rol) {
    this.changeView('rol-edition');
    this.newEditionCurrentRol = row;
  }

  saveRol() {
    this.backdropMessage = 'Guardando rol...';
    this.showLoading = true;
    if (this.view === 'rol-edition'){
      if (this.newEditionCurrentRol.rolName !== '') {
        this.userService.updateRol(this.newEditionCurrentRol).subscribe((_rol) => {
          this.resultCorrect = true;
          this.resultMessage = 'Rol editado correctamente';
          this.showResult = true;
          this.showLoading = false;
        }, (error) => {
          this.resultCorrect = false;
          this.resultMessage = error;
          this.showResult = true;  
          this.showLoading = false;
        });
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Se necesita el nombre del rol';
        this.showResult = true;
        this.showLoading = false;
      }
    } else {
      if (this.newEditionCurrentRol.rolName !== '') {
        this.userService.createRol(this.newEditionCurrentRol).subscribe((_rol) => {
          this.resultCorrect = true;
          this.resultMessage = 'Rol guardado correctamente';
          this.showResult = true;
          this.showLoading = false;
        }, (error) => {
          this.resultCorrect = false;
          this.resultMessage = error;
          this.showResult = true;  
          this.showLoading = false;
        }); 
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Se necesita el nombre del rol';
        this.showResult = true;
        this.showLoading = false;
      }
    }
  }

  rolDelete(row: Rol) {
    const question: Question = {
      title: `Eliminar rol ${row.rolName}`,
      question: '¿Está seguro que desea eliminar el rol?',
      answerNo: 'No',
      answerYes: 'Si'
    };

    const dialogRef = this.dialog.open(QuestionDialogComponent, {
      data: question,
      width: '300px'
    });

    dialogRef.afterClosed().subscribe((dialogResponse) => {
      if (dialogResponse) {
        this.backdropMessage = 'Borrando rol...';
        this.showLoading = true;
        this.userService.deleteRol(row.idRol).subscribe((res) => {
          if (res) {
            this.resultCorrect = true;
            this.resultMessage = 'Rol eliminado correctamente';
            this.showResult = true;
            this.showLoading = false;
            this.changeView('rol-list');
          } else {
            this.resultCorrect = false;
            this.resultMessage = 'No se pudo eliminar rol';
            this.showResult = true;
            this.showLoading = false;
          }
        }, (error) => {
          console.log(error);
          this.resultCorrect = false;
          this.resultMessage = 'Error al eliminar rol';
          this.showResult = true;
          this.showLoading = false;
        });
      }
    });
  }

  watchPermissionLayer(row: Rol) {
    this.newEditionCurrentRol = {
      idRol: row.idRol,
      rolName: row.rolName
    };
    this.changeView('permission-layer');
  }

  watchPermissionTool(row: Rol) {
    this.newEditionCurrentRol = {
      idRol: row.idRol,
      rolName: row.rolName
    };
    this.changeView('permission-tool');
  }

  saveLayersPermission() {
    this.backdropMessage = 'Guardando permisos de capas...';
    this.showLoading = true;
    this.permissionLayers = [];
    this.tocGroup.map((g: TOCGroup) => {
      g.tocLayers.map((l: TOCLayer) => {
        if (l.hasPermission) {
          this.permissionLayers.push(l);
        }
      });
    });
    this.tocService.updateLayerPermissions(this.newEditionCurrentRol.idRol, this.permissionLayers).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Permisos de capas guardados correctamente';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Error al guardar permisos de capas';
      }
      this.showResult = true;
      this.showLoading = false;
    }, (error) => {
      this.resultCorrect = false;
      this.resultMessage = error;
      this.showResult = true;  
      this.showLoading = false;
    });
  }

  saveToolsPermission() {
    this.backdropMessage = 'Guardando permisos de herramientas...';
    this.showLoading = true;
    this.permissionTools = [];
    this.toolGroup.map((g: ToolGroup) => {
      g.tools.map((t: ToolPermission) => {
        if (t.hasPermission) {
          this.permissionTools.push(t);
        }
      });
    });
    this.userService.updateToolPermissions(this.newEditionCurrentRol.idRol, this.permissionTools).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = 'Permisos de herramientas guardados correctamente';
      } else {
        this.resultCorrect = false;
        this.resultMessage = 'Error al guardar permisos de herramientas';
      }
      this.showResult = true;
      this.showLoading = false;
    }, (error) => {
      this.resultCorrect = false;
      this.resultMessage = error;
      this.showResult = true;  
      this.showLoading = false;
    });
  }

  saveParam(row: Parameter) {
    this.backdropMessage = 'Guardando cambios...';
    this.showLoading = true;
    this.userService.updateParam(row).subscribe((res) => {
      if (res) {
        this.resultCorrect = true;
        this.resultMessage = `Cambios en el parámetro ${row.parameterName} guardados correctamente`;
      } else {
        this.resultCorrect = false;
        this.resultMessage = `Error al guardar cambios en el parámetro ${row.parameterName}`;
      }
      this.showResult = true;
      this.showLoading = false;
    }, (error) => {
      this.resultCorrect = false;
      this.resultMessage = error;
      this.showResult = true;  
      this.showLoading = false;
    });
  }
}
