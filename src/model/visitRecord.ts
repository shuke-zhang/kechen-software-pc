export interface VisitRecordModel {
  id?: number
  patientId?: number
  patientName?: string
  visitDate?: string // ISO 字符串
  department?: string
  diagnosis?: string
  treatment?: string
  doctor?: string
  cost?: number
  notes?: string
}
