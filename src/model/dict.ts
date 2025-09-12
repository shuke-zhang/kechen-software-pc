export interface DictModel {
  dictType?: string
  dictName?: string
  remark?: string
  dictId?: number
  status?: string
  /**
   * 时间-前端判断
   */
  dateRange?: string[]
}

export interface DictSelectorModel {
  dictId: number
  dictName: string
  dictType: string
}

export interface DictDataSelectorModel {
  dictCode: number
  dictLabel: string
  dictSort: string
  dictType: string
  dictValue: string
  /**
   * 是否停用 0-启用 1-停用
   */
  status: number
}

export interface DictDataModel {
  dictType?: string
  dictName?: string
  remark?: string
  dictId?: number
  status?: number
  /**
   * 字典编码
   */
  dictCode?: number
  /**
   *  字典类型
   */
  dictLabel?: string
  /**
   * 字典键值
   */
  dictValue?: string
}

export interface DictDataCssModel {
  label: string
  value: string
  dictType: string
  cssType?: 'success' | 'warning' | 'info' | 'primary' | 'danger'
}
