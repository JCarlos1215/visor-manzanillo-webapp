export interface EditionAttribute {
  idAttribute: string;
  idLayer: string;
  attributeName: string;
  attributeShow: string;
  hasCatalogue: boolean;
  queryCatalogue: string;
  catalogue: Catalogue[];
  value: string;
  attributeType: string;
}

export interface Catalogue {
  id: string;
  descripcion: string;
}
