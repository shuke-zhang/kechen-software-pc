import { flatMapDeep } from 'lodash-es'

/**
 * 将树形结构拍平为一维数组
 * @param tree - 节点数组
 * @param childrenKey - 子节点字段名，默认 'children'
 */
export function getTreeFlatList<T extends Record<string, any>>(
  tree: T[],
  childrenKey: keyof T = 'children' as keyof T,
): T[] {
  return flatMapDeep(tree, (item: T): (T | T[])[] => {
    const children = item[childrenKey] as unknown as T[] | undefined
    if (children && children.length) {
      return [item, ...getTreeFlatList(children, childrenKey)]
    }
    return [item]
  })
}
