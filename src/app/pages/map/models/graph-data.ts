interface Colors {
  backgroundColor: string[];
}

interface Totals {
  type: string;
  count: number;
}

interface ExtraData {
  name: string;
  data: number;
  type: string;
}

export interface GraphData {
  chartColors: Colors[];
  chartData: number[] | { data: number[]; label: string }[];
  chartLabels: string[];
  title: string;
  total: Totals[];
  extraData: ExtraData[];
}
