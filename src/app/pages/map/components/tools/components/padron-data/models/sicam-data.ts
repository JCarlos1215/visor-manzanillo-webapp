import { DebtSICAM } from './debt-sicam';
import { HistorySICAM } from './history-sicam';
import { AvaluoSICAMData } from './avaluo-sicam-data';
import { PaidSICAM } from './paid-sicam';

export interface SICAMData {
  avaluoSICAM: AvaluoSICAMData[];
  debtSICAM: DebtSICAM[];
  paidSICAM: PaidSICAM[];
  historySICAM: HistorySICAM[];
}
