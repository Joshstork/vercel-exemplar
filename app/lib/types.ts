export type ProjectStatus = 'development' | 'pre-production' | 'production' | 'post-production' | 'completed'
export type FundingType = 'grant' | 'investment' | 'loan' | 'equity' | 'other'
export type TrackingStatus = 'interested' | 'applied' | 'awarded' | 'rejected'

export type FilmProject = {
  id: string
  user_id: string
  title: string
  description: string | null
  genre: string | null
  budget: number | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export type FundingOpportunity = {
  id: string
  created_by: string | null
  title: string
  description: string | null
  amount: number | null
  deadline: string | null
  source: string | null
  type: FundingType
  is_active: boolean
  created_at: string
}

export type ProjectFunding = {
  id: string
  project_id: string
  opportunity_id: string
  status: TrackingStatus
  notes: string | null
  applied_at: string | null
  created_at: string
}

export type ProjectFundingWithOpportunity = ProjectFunding & {
  funding_opportunities: FundingOpportunity
}
