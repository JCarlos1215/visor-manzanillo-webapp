export interface AvaluoSICAMData {
  idCuenta: number;
  clave: string;
  cuenta: number;
  superficieTerreno: number;
  superficieConstruccion: number;
	valorTerreno: number;
	valorConstruccion: number;
	valorFiscal: number;
	indiviso: number;
	frente: number;
	profundidad: number;
	perimetro: number;
	distanciaEsquina: number;
	izquierdaDerecha: string;
	agua: string;
	alumbrado: string;
	banqueta: string;
	drenaje: string;
	electricidad: string;
	telefono: string;
	pavimento: string;
	aplicado: string;
	tipoValuacion: string;
  areaTitulo: number;
	capturista: string;
  fecha: Date;
}
