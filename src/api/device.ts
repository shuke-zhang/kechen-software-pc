/**
 * @description 分页查询班级列表列表
 */
export function getDeviceList(params?: ListQuery<Api.DeviceModel>) {
  return request.get<ResponseData<Api.DeviceModel[]>>({
    url: '/admin/device',
    params,
  })
}

/**
 * @description 新增数据
 */
export function addDevice(data: ListQuery<Device.DeviceModel>) {
  return request.post({
    url: '/admin/device',
    data,
  })
}
/**
 * @description 修改数据
 */
export function PutDevice(data: ListQuery<Device.DeviceModel>) {
  return request.put({
    url: '/admin/device',
    data,
  })
}
/**
 * @description 删除数据
 */
export function DelDevice(idList: string[]) {
  // 将数组转换为多个 `idList` 查询参数
  const queryString = idList.map(id => `idList=${id}`).join('&')

  return request.delete({
    url: `/admin/device?${queryString}`,
  })
}
