// Press inside a sideways scroller
export const isInScroller = (target: EventTarget): boolean => {
  let node = target instanceof HTMLElement ? target : null

  while (node) {
    const overflow = getComputedStyle(node).overflowX
    if ((overflow === 'auto' || overflow === 'scroll') && node.scrollWidth > node.clientWidth) {
      return true
    }
    node = node.parentElement
  }

  return false
}

// Press inside a field or editor
export const isInField = (target: EventTarget): boolean =>
  target instanceof HTMLElement &&
  Boolean(target.closest('input, textarea, select, [contenteditable="true"]'))
