// PMF Survey Response Type
export interface PMFResponse {
  id: string
  // Section 1 - Background
  user_type: string
  work_areas: string[]
  location: string
  
  // Section 2 - Ideas & Validation
  confidence_level: number
  blockers: string[]
  validation_method: string
  
  // Section 3 - Strategy & Execution
  planning_difficulty: number
  execution_challenges: string[]
  tools_count: string
  
  // Section 4 - Community & Impact
  impact_areas: string[]
  impact_barrier: string
  impact_platform_value: number
  
  // Section 5 - Platform Fit
  platform_appeal: number
  credibility_score_impact: string
  sean_ellis_score: string  // Critical PMF metric - Q15
  
  // Section 6 - Final Thoughts
  nps_score: number
  must_have_feature: string
  early_access_interest: string
  email?: string
  
  created_at: string
}

// Legacy Waitlist Entry Type (if you still need it for backward compatibility)
export interface WaitlistEntry {
  id: string
  full_name: string
  email: string
  company?: string
  job_title?: string
  tech_stack: string
  use_case: string
  heard_from: string
  created_at: string
}

// Form Data Types
export interface WaitlistFormData {
  full_name: string
  email: string
  company: string
  job_title: string
  tech_stack: string
  use_case: string
  heard_from: string
}

export interface SurveyQuestion {
  id: keyof WaitlistFormData
  label: string
  type: 'text' | 'email' | 'select'
  placeholder?: string
  options?: string[]
  required?: boolean
}

export interface ValidationErrors {
  [key: string]: string
}

// Admin Dashboard Stats Types
export interface PMFStats {
  totalResponses: number
  veryDisappointed: number
  somewhatDisappointed: number
  notDisappointed: number
  notSure: number
  averageConfidence: number
  averageNPS: number
  topLocations: Array<{ location: string; count: number }>
  topUserTypes: Array<{ type: string; count: number }>
  commonBlockers: Array<{ blocker: string; count: number }>
  featureRequests: Array<{ feature: string; count: number }>
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}