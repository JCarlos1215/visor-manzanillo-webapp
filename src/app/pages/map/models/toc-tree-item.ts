import { LayerData } from "src/app/modules/layer/models/layer-data";

export type NodeData = LayerData | TocTreeItem;

export class TocTreeItem {
  title: string;
  icon: string;
  isLayer: boolean;
  children!: TocTreeItem[];
  layerData!: LayerData;
  isActive: boolean;
  level: number;
  parent!: TocTreeItem;

  constructor(
    title: string,
    icon: string,
    isLayer: boolean,
    level: number = 0
  ) {
    this.title = title;
    this.icon = icon;
    this.isLayer = isLayer;
    if (!isLayer) {
      this.children = [];
    }
    this.isActive = false;
    this.level = level;
  }

  get Title(): string {
    return this.title;
  }

  get IsLayer(): boolean {
    return this.isLayer;
  }

  get IsActive(): boolean {
    return this.isActive;
  }

  get Parent(): TocTreeItem {
    return this.parent;
  }

  get Level(): number {
    return this.level;
  }

  getChildren(): TocTreeItem[] {
    if (!this.isLayer) {
      return this.children;
    } else {
      throw Error('Error operacion "getChildren" no soportada. Es capa');
    }
  }

  private updateLevel(newLevel: number): void {
    this.level = newLevel;
    if (!this.isLayer) {
      this.getChildren().forEach((child) => child.updateLevel(newLevel + 1));
    }
  }

  private setParent(parent: TocTreeItem): void {
    this.parent = parent;
    this.updateLevel(parent.Level + 1);
  }

  setData(data: LayerData): void {
    if (this.isLayer) {
      this.layerData = data;
    } else {
      throw Error('Operacion "setData" no soportada. No es capa');
    }
  }

  addChild(child: TocTreeItem): void {
    if (!this.isLayer) {
      this.children.push(child);
      child.setParent(this);
    } else {
      throw Error('Operacion "addChild" no soportada. Es capa');
    }
  }

  getLayerData(): LayerData {
    if (this.isLayer) {
      return this.layerData;
    } else {
      throw Error('Operacion "getLayerData" no soportada. No es capa');
    }
  }

  findLayerNode(id: string): TocTreeItem {
    if (this.isLayer && this.layerData.id === id) {
      return this;
    } else if (!this.isLayer) {
      const children = this.getChildren();
      const results = children
        .map((child) => child.findLayerNode(id))
        .filter((x) => x !== null);
      if (results.length === 0) {
        return (null as unknown as TocTreeItem);
      } else {
        return results[0];
      }
    } else {
      return (null as unknown as TocTreeItem);
    }
  }

  toggleActiveStatus(): void {
    this.isActive = !this.isActive;
  }

  toString(): string {
    return `(${this.level}) ${this.title}`;
  }
}
