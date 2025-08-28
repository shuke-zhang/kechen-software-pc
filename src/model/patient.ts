/**
 * 表示包含详细信息的患者模型。
 *
 */
export interface PatientModel {
  /**
   * 患者的唯一标识符。
   */
  id?: number
  /**
   * 患者的全名。
   */
  name?: string
  /**
   * 患者的年龄。
   */
  age?: number
  /**
   * 患者的性别。
   */
  gender?: Gender
  /**
   * 患者的联系电话号码。
   */
  phone?: string
  /**
   * 患者的电子邮件地址。
   */
  email?: string
  /**
   * 患者的居住地址。
   */
  address?: string
  /**
   * 患者的病史记录列表。
   */
  medicalHistory?: string[]
}
