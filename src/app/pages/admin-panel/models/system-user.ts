export interface SystemUser {
  idUser: string;
  username: string;
  password: string;
  createdAt: Date;
  idRol: string;
  rol: string;
  isAdmin: boolean;
  givenname: string;
  surname: string;
  company: string;
  job: string;
}