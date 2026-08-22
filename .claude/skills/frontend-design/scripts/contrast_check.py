#!/usr/bin/env python3
"""
Check WCAG contrast ratios for a design plan's palette before committing to it.

The skill's "quality floor" (visible keyboard focus, accessible contrast) is easy to
break precisely when a plan is at its most distinctive - a muted accent on a warm
paper background, a near-black on near-black hover state. Run this on every
foreground/background pair the plan actually uses (body text, accent links, disabled
states, focus rings) instead of eyeballing it.

Usage:
    python3 contrast_check.py "#3a3530" "#fdfaf4"
    python3 contrast_check.py "#3a3530" on "#fdfaf4" "#e3ded0" "#c9432b"
        (checks the first color against every color after it)

Exit code is non-zero if any pair fails WCAG AA.
"""

import sys


def parse_hex(value: str) -> tuple[float, float, float]:
    value = value.strip().lstrip('#')
    if len(value) == 3:
        value = ''.join(ch * 2 for ch in value)
    if len(value) != 6:
        raise ValueError(f'not a hex color: {value!r}')
    r, g, b = (int(value[i:i + 2], 16) for i in (0, 2, 4))
    return r / 255, g / 255, b / 255


def channel_luminance(c: float) -> float:
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def relative_luminance(rgb: tuple[float, float, float]) -> float:
    r, g, b = (channel_luminance(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(hex_a: str, hex_b: str) -> float:
    l1 = relative_luminance(parse_hex(hex_a))
    l2 = relative_luminance(parse_hex(hex_b))
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def verdict(ratio: float) -> str:
    aa_normal = ratio >= 4.5
    aa_large = ratio >= 3.0
    aaa_normal = ratio >= 7.0
    if aaa_normal:
        return 'AAA (passes at any text size)'
    if aa_normal:
        return 'AA (passes normal text, also AAA large)'
    if aa_large:
        return 'AA LARGE ONLY (18pt+/14pt bold+ - fails normal body text)'
    return 'FAIL (does not meet WCAG AA at any size)'


def main(argv: list[str]) -> int:
    args = [a for a in argv if a.lower() != 'on']
    if len(args) < 2:
        print(__doc__)
        return 1

    base, *others = args
    failed = False
    for other in others:
        ratio = contrast_ratio(base, other)
        status = verdict(ratio)
        if 'FAIL' in status:
            failed = True
        print(f'{base} vs {other}: {ratio:.2f}:1 - {status}')

    return 1 if failed else 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv[1:]))
