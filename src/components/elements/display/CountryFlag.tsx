import type { FlagComponent } from 'country-flag-icons/react/3x2'

import FR from 'country-flag-icons/react/3x2/FR'
import GB from 'country-flag-icons/react/3x2/GB'
import ES from 'country-flag-icons/react/3x2/ES'
import DE from 'country-flag-icons/react/3x2/DE'
import IT from 'country-flag-icons/react/3x2/IT'
import PT from 'country-flag-icons/react/3x2/PT'
import NL from 'country-flag-icons/react/3x2/NL'
import PL from 'country-flag-icons/react/3x2/PL'
import RO from 'country-flag-icons/react/3x2/RO'
import RU from 'country-flag-icons/react/3x2/RU'
import UA from 'country-flag-icons/react/3x2/UA'
import SA from 'country-flag-icons/react/3x2/SA'
import TR from 'country-flag-icons/react/3x2/TR'
import CN from 'country-flag-icons/react/3x2/CN'
import JP from 'country-flag-icons/react/3x2/JP'
import KR from 'country-flag-icons/react/3x2/KR'
import IN from 'country-flag-icons/react/3x2/IN'
import SE from 'country-flag-icons/react/3x2/SE'
import NO from 'country-flag-icons/react/3x2/NO'
import DK from 'country-flag-icons/react/3x2/DK'
import FI from 'country-flag-icons/react/3x2/FI'
import CZ from 'country-flag-icons/react/3x2/CZ'
import GR from 'country-flag-icons/react/3x2/GR'
import IL from 'country-flag-icons/react/3x2/IL'
import TH from 'country-flag-icons/react/3x2/TH'
import VN from 'country-flag-icons/react/3x2/VN'
import ID from 'country-flag-icons/react/3x2/ID'
import HU from 'country-flag-icons/react/3x2/HU'
import BG from 'country-flag-icons/react/3x2/BG'
import RS from 'country-flag-icons/react/3x2/RS'
import HR from 'country-flag-icons/react/3x2/HR'
import BE from 'country-flag-icons/react/3x2/BE'
import LU from 'country-flag-icons/react/3x2/LU'

import { cn } from '@/utils/classnames'

// Flag drawn for each country code
const FLAGS: Record<string, FlagComponent> = {
  FR,
  GB,
  ES,
  DE,
  IT,
  PT,
  NL,
  PL,
  RO,
  RU,
  UA,
  SA,
  TR,
  CN,
  JP,
  KR,
  IN,
  SE,
  NO,
  DK,
  FI,
  CZ,
  GR,
  IL,
  TH,
  VN,
  ID,
  HU,
  BG,
  RS,
  HR,
  BE,
  LU,
}

export interface CountryFlagProps {
  country: string
  className?: string
}

/**
 * Flag of a country
 * @param {string} country - ISO country code
 * @param {string} [className] - Sizing classes
 * @return {JSX.Element | null} - Nothing for an unknown country
 */

export const CountryFlag = ({ country, className }: CountryFlagProps) => {
  const Flag = FLAGS[country]

  return Flag ? (
    <Flag aria-hidden="true" className={cn('h-4 w-6 shrink-0 rounded-[3px]', className)} />
  ) : null
}
