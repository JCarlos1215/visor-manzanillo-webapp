import { ToolPermission } from './tool-permission';

export interface ToolGroup {
  group: string;
  idPermissionType: string;
  permissionType: string;
  idRol: string;
  status: boolean;
  tools: ToolPermission[];
}
