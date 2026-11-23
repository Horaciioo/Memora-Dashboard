// Row or card that holds an element
const BOX = 'a, li, tr, article, [role="row"], [role="listitem"]'

// Part taller than this share of the screen is a section, never the box asked for
const MAX_SHARE = 0.5

// The box around an element, none when it is really a whole section
const boxOf = (element: Element): Element | null => {
  const box = element.closest(BOX) ?? element

  return box.getBoundingClientRect().height > window.innerHeight * MAX_SHARE ? null : box
}

// First text of the page that names the record
const byLabel = (label: string): Element | null => {
  const main = document.querySelector('main')
  if (!main) return null

  const wanted = label.toLowerCase()
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const holder = node.parentElement
    if (
      holder &&
      !holder.closest('[role="dialog"]') &&
      node.textContent?.toLowerCase().includes(wanted)
    ) {
      return holder
    }
  }

  return null
}

/**
 * The box of a record on the open page, found by its link, its marker or its title
 * @param {string | null} key - Route of the record
 * @param {string | null} label - Title of the record
 * @return {Element | null} - Box to ring, none when the page does not show it
 */

export const locateBox = (key: string | null, label: string | null): Element | null => {
  const marked = key
    ? (document.querySelector(`[data-recap-target="${key}"]`) ??
      document.querySelector(`main a[href="${key}"]`))
    : null
  const found = marked ?? (label ? byLabel(label) : null)

  return found ? boxOf(found) : null
}
