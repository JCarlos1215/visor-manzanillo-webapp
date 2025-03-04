import { TOCLayer } from "./toc-layer";

export interface TOCGroup {
  group: string;
  idTocGroup: string;
  idPermissionType: string;
  permissionType: string;
  idRol: string;
  status: boolean;
  tocLayers: TOCLayer[];
}
