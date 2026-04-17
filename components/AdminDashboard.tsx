'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  Mail, 
  Calendar, 
  TrendingUp,
  Download,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Target,
  AlertCircle,
  BarChart3,
  MapPin,
  Briefcase,
  Lightbulb,
  MessageSquare
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { PMFResponse, PMFStats } from '@/types'

interface AdminDashboardProps {
  onLogout: () => void
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [entries, setEntries] = useState<PMFResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEntry, setSelectedEntry] = useState<PMFResponse | null>(null)
  const [pmfStats, setPmfStats] = useState<PMFStats>({
    totalResponses: 0,
    veryDisappointed: 0,
    somewhatDisappointed: 0,
    notDisappointed: 0,
    notSure: 0,
    averageConfidence: 0,
    averageNPS: 0,
    topLocations: [],
    topUserTypes: [],
    commonBlockers: [],
    featureRequests: []
  })
  
  const itemsPerPage = 10

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('pmf_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: PMFResponse[]) => {
    const total = data.length
    
    // Sean Ellis PMF calculation (Q15)
    const veryDisappointed = data.filter(e => e.sean_ellis_score === 'Very disappointed — I\'d have no good alternative').length
    const somewhatDisappointed = data.filter(e => e.sean_ellis_score === 'Somewhat disappointed — but I\'d find workarounds').length
    const notDisappointed = data.filter(e => e.sean_ellis_score === 'Not disappointed — I can manage without it').length
    const notSure = data.filter(e => e.sean_ellis_score === 'I\'m not sure yet').length
    
    // Average confidence (Q4)
    const avgConfidence = data.reduce((sum, e) => sum + (e.confidence_level || 0), 0) / total || 0
    
    // Average NPS (Q16)
    const avgNPS = data.reduce((sum, e) => sum + (e.nps_score || 0), 0) / total || 0
    
    // Top locations (Q3)
    const locationMap = new Map()
    data.forEach(e => {
      locationMap.set(e.location, (locationMap.get(e.location) || 0) + 1)
    })
    const topLocations = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Top user types (Q1)
    const userTypeMap = new Map()
    data.forEach(e => {
      userTypeMap.set(e.user_type, (userTypeMap.get(e.user_type) || 0) + 1)
    })
    const topUserTypes = Array.from(userTypeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Common blockers (Q5)
    const blockerMap = new Map()
    data.forEach(e => {
      e.blockers?.forEach(blocker => {
        blockerMap.set(blocker, (blockerMap.get(blocker) || 0) + 1)
      })
    })
    const commonBlockers = Array.from(blockerMap.entries())
      .map(([blocker, count]) => ({ blocker, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // Feature requests (Q17)
    const featureMap = new Map()
    data.forEach(e => {
      if (e.must_have_feature) {
        const feature = e.must_have_feature.toLowerCase().slice(0, 50)
        featureMap.set(feature, (featureMap.get(feature) || 0) + 1)
      }
    })
    const featureRequests = Array.from(featureMap.entries())
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    setPmfStats({
      totalResponses: total,
      veryDisappointed,
      somewhatDisappointed,
      notDisappointed,
      notSure,
      averageConfidence: avgConfidence,
      averageNPS: avgNPS,
      topLocations,
      topUserTypes,
      commonBlockers,
      featureRequests
    })
  }

  const filteredEntries = entries.filter(entry =>
    entry.user_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const exportToCSV = () => {
    const headers = [
      'Date', 'User Type', 'Location', 'Work Areas', 
      'Confidence Level', 'Blockers', 'Validation Method',
      'Planning Difficulty', 'Execution Challenges', 'Tools Count',
      'Impact Areas', 'Impact Barrier', 'Impact Platform Value',
      'Platform Appeal', 'Credibility Score Impact', 'Sean Ellis Score (PMF)',
      'NPS Score', 'Must Have Feature', 'Early Access Interest', 'Email'
    ]
    
    const csvData = filteredEntries.map(entry => [
      new Date(entry.created_at).toLocaleDateString(),
      entry.user_type,
      entry.location,
      entry.work_areas?.join('; ') || '',
      entry.confidence_level,
      entry.blockers?.join('; ') || '',
      entry.validation_method,
      entry.planning_difficulty,
      entry.execution_challenges?.join('; ') || '',
      entry.tools_count,
      entry.impact_areas?.join('; ') || '',
      entry.impact_barrier,
      entry.impact_platform_value,
      entry.platform_appeal,
      entry.credibility_score_impact,
      entry.sean_ellis_score,
      entry.nps_score,
      entry.must_have_feature?.replace(/,/g, ';') || '',
      entry.early_access_interest,
      entry.email || ''
    ])

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pmf-survey-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pmfScore = pmfStats.totalResponses > 0 
    ? (pmfStats.veryDisappointed / pmfStats.totalResponses) * 100 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">PMF Survey Dashboard</h1>
              <p className="text-sm text-gray-400">Product-Market Fit Analytics & Responses</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuth')
                  onLogout()
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PMF Score Card - The Critical Metric */}
        <div className="mb-8">
          <div className="bg-linear-to-br from-purple-900/50 to-purple-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Sean Ellis PMF Score (Question 15)
                </p>
                <p className="text-4xl font-bold text-white mt-1">
                  {pmfScore.toFixed(1)}%
                </p>
                <p className="text-sm text-purple-300 mt-1">
                  {pmfStats.veryDisappointed} of {pmfStats.totalResponses} respondents
                </p>
              </div>
              <div className="p-3 bg-purple-600/30 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">Very Disappointed (PMF Signal)</span>
                <span className="text-white font-semibold">{pmfStats.veryDisappointed}</span>
              </div>
              <div className="w-full bg-purple-900/50 rounded-full h-3">
                <div 
                  className="bg-linear-to-br from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pmfScore}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-purple-700/50">
                <div>
                  <p className="text-xs text-purple-300">Somewhat Disappointed</p>
                  <p className="text-lg font-semibold text-white">{pmfStats.somewhatDisappointed}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300">Not Disappointed</p>
                  <p className="text-lg font-semibold text-white">{pmfStats.notDisappointed}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-300">Not Sure</p>
                  <p className="text-lg font-semibold text-white">{pmfStats.notSure}</p>
                </div>
              </div>
              
              <div className={`mt-3 p-3 rounded-lg ${pmfScore >= 40 ? 'bg-green-900/30 border border-green-700' : 'bg-yellow-900/30 border border-yellow-700'}`}>
                <p className={`text-sm font-medium ${pmfScore >= 40 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {pmfScore >= 40 
                    ? '✅ Strong PMF Signal - Above 40% threshold! Ready for scaling.'
                    : '⚠️ Below 40% threshold - Continue iterating and gathering feedback.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Industry standard: 40%+ "Very disappointed" indicates strong product-market fit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Responses</p>
                <p className="text-3xl font-bold text-white">{pmfStats.totalResponses}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Confidence (1-7)</p>
                <p className="text-3xl font-bold text-white">{pmfStats.averageConfidence.toFixed(1)}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg NPS (1-7)</p>
                <p className="text-3xl font-bold text-white">{pmfStats.averageNPS.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Early Access Signups</p>
                <p className="text-3xl font-bold text-white">
                  {entries.filter(e => e.early_access_interest?.startsWith('Yes')).length}
                </p>
              </div>
              <Mail className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Locations */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Top Locations</h3>
            </div>
            <div className="space-y-3">
              {pmfStats.topLocations.map((loc, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-300">{loc.location}</span>
                  <span className="text-white font-semibold">{loc.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top User Types */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">User Distribution</h3>
            </div>
            <div className="space-y-3">
              {pmfStats.topUserTypes.map((type, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{type.type}</span>
                  <span className="text-white font-semibold">{type.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Common Blockers */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Top Blockers</h3>
            </div>
            <div className="space-y-3">
              {pmfStats.commonBlockers.map((blocker, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{blocker.blocker.substring(0, 50)}</span>
                  <span className="text-white font-semibold">{blocker.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Requests */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Top Feature Requests</h3>
            </div>
            <div className="space-y-3">
              {pmfStats.featureRequests.map((feature, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">{feature.feature}</span>
                  <span className="text-white font-semibold">{feature.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-800 rounded-lg shadow-lg mb-6 border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PMF Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">NPS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {paginatedEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs truncate">
                        {entry.user_type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{entry.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.sean_ellis_score?.includes('Very disappointed')
                          ? 'bg-red-900/50 text-red-300 border border-red-700'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {entry.sean_ellis_score?.substring(0, 20)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{entry.nps_score}/7</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{entry.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-gray-300"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Survey Response Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">User Type</label>
                  <p className="mt-1 text-white">{selectedEntry.user_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Location</label>
                  <p className="mt-1 text-white">{selectedEntry.location}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-400">Work Areas</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedEntry.work_areas?.map((area, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Confidence Level</label>
                  <p className="mt-1 text-white">{selectedEntry.confidence_level}/7</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Planning Difficulty</label>
                  <p className="mt-1 text-white">{selectedEntry.planning_difficulty}/7</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Platform Appeal</label>
                  <p className="mt-1 text-white">{selectedEntry.platform_appeal}/7</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">NPS Score</label>
                  <p className="mt-1 text-white">{selectedEntry.nps_score}/7</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-400">Sean Ellis PMF Score</label>
                  <p className="mt-1 text-white font-semibold">{selectedEntry.sean_ellis_score}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-400">Must-Have Feature</label>
                  <p className="mt-1 text-white">{selectedEntry.must_have_feature}</p>
                </div>
                {selectedEntry.email && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <p className="mt-1 text-white">{selectedEntry.email}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-400">Submitted On</label>
                  <p className="mt-1 text-gray-300">
                    {new Date(selectedEntry.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}