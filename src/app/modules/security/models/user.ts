/**
 * Clase con la estructura de datos que contiene la sesión de un usuario.
 * Incluye los getters para obtener los datos individualmente.
 */
export class User {
  /**
   * Constructor con los datos del usuario.
   * @param idUser cadena que contiene identificador del usuario.
   * @param userName cadena con el nombre de usuario en el sistema.
   * @param token cadena con el token de la sesión para poder utilizar el sistema.
   * @param fullName cadena con el nombre completo del usuario.
   * @param job cadena con el puesto del usuario.
   * @param company compañia a la que pertenece el usuario.
   */
  constructor(
    private idUser: string,
    private userName: string,
    private token: string,
    // Add extra information
    private fullName: string,
    private job: string,
    private company: string,
    private idRol: string,
    private isAdmin: boolean
  ) {}

  get IdUser(): string {
    return this.idUser;
  }

  get UserName(): string {
    return this.userName;
  }

  get Token(): string {
    return this.token;
  }

  get FullName(): string {
    return this.fullName;
  }

  get Job(): string {
    return this.job;
  }

  get Company(): string {
    return this.company;
  }

  get IdRol(): string {
    return this.idRol;
  }

  get IsAdmin(): boolean {
    return this.isAdmin;
  }
}
