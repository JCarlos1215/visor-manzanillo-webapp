export abstract class SidePanel {
  data: unknown;

  abstract hide(): void;
  abstract show(): void;

  setData(data: any): void {
    this.data = data;
  }

  getData(): unknown {
    return this.data;
  }
}
