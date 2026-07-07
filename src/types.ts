export interface ProductInfo {
  productName: string;
  batchNo: string;
  testItem: string;
  specResult: string;
  incidentDetail: string;
}

export interface HistoryEntry {
  stage: "classification" | "why" | "capa" | "report";
  why_number: number;
  narrative: string;
  selected_option: string;
}

export interface OOSResponse {
  stage: "classification" | "why" | "capa" | "report";
  why_number: number;
  narrative: string;
  options: string[];
  report: {
    overview: string;
    incident: string;
    initial_assessment: string;
    root_cause: string;
    correction: string;
    preventive_action: string;
    effectiveness_check: string;
  } | null;
}
