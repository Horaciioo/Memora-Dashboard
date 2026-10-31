// Header naming the tab behind a request
export const TAB_HEADER = 'x-memora-tab'

// One identifier per open tab, lets a tab skip the signals of its own writes
export const TAB_ID: string = globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2)
