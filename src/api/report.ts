import type { ReportModel } from '@/model/report'

/**
 * @description 分页查询报告-键列表
 */
export function getReportList(data?: ListPageQuery<ReportModel>) {
  return request.post<ResponseListData<ReportModel[]>>({
    url: '/api/videoReport/list',
    data,
  })
}

/**
 * @description 查询报告详情-键数据
 */
export function getReportInfo(id: number) {
  return request.post({
    url: `/api/videoReport/${id}`,
  })
}

/**
 * @description 新增报告-键数据
 */
export function addReport(data: ReportModel) {
  return request.post({
    url: '/api/videoReport/add',
    data,
  })
}
/**
 * @description 修改报告-键数据
 */
export function PutReport(data: ReportModel) {
  return request.post({
    url: '/api/videoReport/update',
    data,
  })
}
/**
 * @description 删除报告-键数据
 */
export function DelReport(idList: number[]) {
  return request.delete({
    url: `/api/videoReport/delete`,
    data: idList,
  })
}
