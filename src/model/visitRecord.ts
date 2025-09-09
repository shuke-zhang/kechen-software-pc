export interface VisitRecordModel {
  id?: number
  patientName?: string
  videoPlanName?: string
  itemName?: string
  deviceSn?: string
  department?: string
  status?: 'draft' | 'active' | 'paused' | 'archived'
  createdAt?: string
}
