import { createRegistry } from '@/core/lib/registry'
import { IntegrationLinkKinds } from '@/utils/constants/integration'
import type { IntegrationLinkKindName } from '@/utils/constants/integration'

/**
 * What one link kind does once its form is submitted
 * @typedef {Object} IntegrationLinkOption
 * @property {string} label - Display label
 * @property {string} hint - What the mode changes for the person
 * @property {string} accent - Colour token
 * @property {boolean} createsAccount - Opens a member account
 * @property {boolean} enrolsAcademy - Takes a seat on the academy session
 * @property {boolean} awaitsApproval - Holds the account until a responsable validates it
 */

interface IntegrationLinkOption {
  label: string
  hint: string
  accent: string
  createsAccount: boolean
  enrolsAcademy: boolean
  awaitsApproval: boolean
}

const LINK_KIND_MAP: Record<IntegrationLinkKindName, IntegrationLinkOption> = {
  [IntegrationLinkKinds.Account]: {
    label: 'Avec création de compte',
    hint: 'Le formulaire ouvre le compte modérateur et son accès au dashboard.',
    accent: 'success',
    createsAccount: true,
    enrolsAcademy: false,
    awaitsApproval: false,
  },
  [IntegrationLinkKinds.Profile]: {
    label: 'Sans création de compte',
    hint: 'Les réponses sont recueillies, aucun compte n’est ouvert.',
    accent: 'neutral',
    createsAccount: false,
    enrolsAcademy: false,
    awaitsApproval: false,
  },
  [IntegrationLinkKinds.Academy]: {
    label: 'Compte + Academy, en attente',
    hint: 'Le compte est ouvert et inscrit sur la session, un Responsable le valide ensuite.',
    accent: 'info',
    createsAccount: true,
    enrolsAcademy: true,
    awaitsApproval: true,
  },
}

export const INTEGRATION_LINK_KIND_REGISTRY = createRegistry(LINK_KIND_MAP)
