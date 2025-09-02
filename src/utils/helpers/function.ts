/**
 * @description 判断元素文本是否溢出（被截断）
 * @param el 需要检测的 DOM 元素
 * @returns {boolean} true 表示文本被截断，false 表示完全可见
 */
export function isTextTruncated(el: HTMLElement | null): boolean {
  if (!el)
    return false
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
}
