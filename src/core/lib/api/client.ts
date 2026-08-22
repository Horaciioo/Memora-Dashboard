export interface ApiClientErrorIssue {
  message: string
}

/**
 * API client error
 * @typedef {Object} ApiClientError
 * @property {ApiClientErrorIssue[]} issues - Issues
 * @constructor
 */

export class ApiClientError extends Error {
  issues: ApiClientErrorIssue[]

  constructor(message: string, issues: ApiClientErrorIssue[] = []) {
    super(message)
    this.name = 'ApiClientError'
    this.issues = issues
  }
}
