'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertCircle,
  Users,
  Lightbulb,
  Target,
  Globe,
  Shield,
  TrendingUp,
  Send,
  Mail
} from 'lucide-react'
import type { PMFResponse, ValidationErrors } from '@/types'
import RatingScale from './RatingScale'

const sections = [
  { id: 1, title: 'Your Background', icon: Users, description: 'Tell us about yourself' },
  { id: 2, title: 'Ideas & Validation', icon: Lightbulb, description: 'How you validate concepts' },
  { id: 3, title: 'Strategy & Execution', icon: Target, description: 'Your planning approach' },
  { id: 4, title: 'Community & Impact', icon: Globe, description: 'Social impact ideas' },
  { id: 5, title: 'Platform Fit', icon: Shield, description: 'What you need from us' },
  { id: 6, title: 'Final Thoughts', icon: TrendingUp, description: 'Help us build better' }
]

export default function PMFSurvey() {
  const [currentSection, setCurrentSection] = useState(1)
  const [formData, setFormData] = useState<Partial<PMFResponse>>({
    work_areas: [],
    blockers: [],
    execution_challenges: [],
    impact_areas: []
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)

  const updateField = (field: keyof PMFResponse, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const updateArrayField = (field: keyof PMFResponse, value: string, checked: boolean) => {
    const current = (formData[field] as string[]) || []
    if (checked) {
      updateField(field, [...current, value])
    } else {
      updateField(field, current.filter(v => v !== value))
    }
  }

  const validateSection = (section: number): boolean => {
    const newErrors: ValidationErrors = {}

    switch(section) {
      case 1:
        if (!formData.user_type) newErrors.user_type = 'Please select an option'
        if (!formData.work_areas?.length) newErrors.work_areas = 'Select at least one area'
        if (!formData.location) newErrors.location = 'Please select your location'
        break
      case 2:
        if (formData.confidence_level === undefined) newErrors.confidence_level = 'Please rate your confidence'
        if (!formData.blockers?.length) newErrors.blockers = 'Select at least one blocker'
        if (!formData.validation_method) newErrors.validation_method = 'Please select a method'
        break
      case 3:
        if (formData.planning_difficulty === undefined) newErrors.planning_difficulty = 'Please rate the difficulty'
        if (!formData.execution_challenges?.length) newErrors.execution_challenges = 'Select at least one challenge'
        if (!formData.tools_count) newErrors.tools_count = 'Please select an option'
        break
      case 4:
        if (!formData.impact_areas?.length) newErrors.impact_areas = 'Select at least one area'
        if (!formData.impact_barrier) newErrors.impact_barrier = 'Please select an option'
        if (formData.impact_platform_value === undefined) newErrors.impact_platform_value = 'Please rate the value'
        break
      case 5:
        if (formData.platform_appeal === undefined) newErrors.platform_appeal = 'Please rate the appeal'
        if (!formData.credibility_score_impact) newErrors.credibility_score_impact = 'Please select an option'
        if (!formData.sean_ellis_score) newErrors.sean_ellis_score = 'This is required for PMF measurement'
        break
      case 6:
        if (formData.nps_score === undefined) newErrors.nps_score = 'Please rate your likelihood'
        if (!formData.must_have_feature?.trim()) newErrors.must_have_feature = 'This field is required'
        if (!formData.early_access_interest) newErrors.early_access_interest = 'Please select an option'
        if ((formData.early_access_interest === 'Yes — sign me up' || 
             formData.early_access_interest === 'Yes — but only if it fits my use case') && 
            !formData.email) {
          newErrors.email = 'Email is required for early access'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(prev => Math.min(prev + 1, 6))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    setCurrentSection(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateSection(6)) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Submission failed')
      
      setIsSubmitted(true)
    } catch (error) {
      setErrors({ submit: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (formData.early_access_interest?.startsWith('Yes')) {
      setShowEmailField(true)
    } else {
      setShowEmailField(false)
      updateField('email', undefined)
    }
  }, [formData.early_access_interest])

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 max-w-md text-center border border-gray-700">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Thank You!</h2>
          <p className="text-gray-300 mb-6">
            Your responses have been recorded. You're helping shape the future of product development.
          </p>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">
              {formData.sean_ellis_score === 'Very disappointed' && 
                "🔥 You're exactly who we're building for. We'll prioritize your feedback."}
              {formData.early_access_interest?.startsWith('Yes') && 
                "📧 Check your inbox for early access updates."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const SectionIcon = sections[currentSection - 1].icon

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Section {currentSection} of {sections.length}
            </span>
            <span className="text-sm font-medium text-blue-400">
              {Math.round((currentSection / sections.length) * 100)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-br from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${(currentSection / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Section Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl">
              <SectionIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {sections[currentSection - 1].title}
              </h1>
              <p className="text-gray-400 mt-1">
                {sections[currentSection - 1].description}
              </p>
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="space-y-8">
          {/* Section 1: Background */}
          {currentSection === 1 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  Which best describes you right now? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    "I have an idea I haven't acted on yet",
                    "I'm actively building something",
                    "I've launched something before",
                    "I invest in or advise early-stage ventures",
                    "I work in a community or development organisation"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="user_type"
                        value={option}
                        checked={formData.user_type === option}
                        onChange={(e) => updateField('user_type', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.user_type && <p className="text-red-400 text-sm mt-2">{errors.user_type}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  What areas do your ideas or work touch? <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-sm ml-2">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Technology & Software",
                    "Agriculture & Food Systems",
                    "Climate & Environment",
                    "Community & Social Impact",
                    "Finance & Fintech",
                    "Health & Wellbeing",
                    "Education",
                    "Other"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.work_areas || []).includes(option)}
                        onChange={(e) => updateArrayField('work_areas', option, e.target.checked)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.work_areas && <p className="text-red-400 text-sm mt-2">{errors.work_areas}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  Where are you primarily based? <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.location || ''}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your location</option>
                  {[
                    "Sub-Saharan Africa",
                    "North Africa / Middle East",
                    "South / Southeast Asia",
                    "Europe",
                    "North America",
                    "Latin America",
                    "Other"
                  ].map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.location && <p className="text-red-400 text-sm mt-2">{errors.location}</p>}
              </div>
            </>
          )}

          {/* Section 2: Ideas & Validation */}
          {currentSection === 2 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-4">
                  When you have an idea, how confident are you that it solves a real problem people will pay for? <span className="text-red-400">*</span>
                </label>
                <RatingScale
                  value={formData.confidence_level}
                  onChange={(value) => updateField('confidence_level', value)}
                  min={1}
                  max={7}
                  minLabel="Not at all confident"
                  maxLabel="Very confident"
                />
                {errors.confidence_level && <p className="text-red-400 text-sm mt-2">{errors.confidence_level}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  What has stopped you from moving forward with an idea? <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-sm ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {[
                    "Not sure if people actually want it",
                    "Don't know where to start strategically",
                    "Hard to find the right team or collaborators",
                    "No structured way to test it quickly",
                    "Difficult to explain it to potential partners or funders",
                    "Overwhelmed by how many tools and steps are involved",
                    "Nothing — I move quickly once I have an idea"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.blockers || []).includes(option)}
                        onChange={(e) => updateArrayField('blockers', option, e.target.checked)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.blockers && <p className="text-red-400 text-sm mt-2">{errors.blockers}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  How do you currently figure out if an idea has legs? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    "I ask friends and family",
                    "I research online manually",
                    "I post in communities and see the reaction",
                    "I build a quick prototype and test it",
                    "I don't — I just start building",
                    "I don't have a consistent method"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="validation_method"
                        value={option}
                        checked={formData.validation_method === option}
                        onChange={(e) => updateField('validation_method', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.validation_method && <p className="text-red-400 text-sm mt-2">{errors.validation_method}</p>}
              </div>
            </>
          )}

          {/* Section 3: Strategy & Execution */}
          {currentSection === 3 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-4">
                  How difficult do you find it to turn an idea into a clear, structured plan others can follow? <span className="text-red-400">*</span>
                </label>
                <RatingScale
                  value={formData.planning_difficulty}
                  onChange={(value) => updateField('planning_difficulty', value)}
                  min={1}
                  max={7}
                  minLabel="Very easy"
                  maxLabel="Extremely difficult"
                />
                {errors.planning_difficulty && <p className="text-red-400 text-sm mt-2">{errors.planning_difficulty}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  Which execution challenges have you personally experienced? <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-sm ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {[
                    "Unclear milestones — didn't know what to do next",
                    "No way to measure if we were making real progress",
                    "Team wasn't aligned on priorities",
                    "Spent time on the wrong things",
                    "Couldn't communicate progress to stakeholders",
                    "Lost momentum after early excitement faded"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.execution_challenges || []).includes(option)}
                        onChange={(e) => updateArrayField('execution_challenges', option, e.target.checked)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.execution_challenges && <p className="text-red-400 text-sm mt-2">{errors.execution_challenges}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  How many different tools or platforms do you currently use to manage an idea from concept to launch? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    "1–2 (pretty simple)",
                    "3–5 (manageable)",
                    "6–10 (it's a lot)",
                    "More than 10 (chaotic)",
                    "I don't use any structured tools"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="tools_count"
                        value={option}
                        checked={formData.tools_count === option}
                        onChange={(e) => updateField('tools_count', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.tools_count && <p className="text-red-400 text-sm mt-2">{errors.tools_count}</p>}
              </div>
            </>
          )}

          {/* Section 4: Community & Impact */}
          {currentSection === 4 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  Have you ever had an idea to address any of the following? <span className="text-red-400">*</span>
                  <span className="text-gray-500 text-sm ml-2">(Select all that apply)</span>
                </label>
                <div className="space-y-3">
                  {[
                    "A farming or food access problem in your community",
                    "A climate or environmental challenge",
                    "A public health or sanitation issue",
                    "An infrastructure problem (roads, energy, water)",
                    "Economic inclusion or poverty reduction",
                    "Youth development or education access",
                    "I haven't had ideas in these areas"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.impact_areas || []).includes(option)}
                        onChange={(e) => updateArrayField('impact_areas', option, e.target.checked)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.impact_areas && <p className="text-red-400 text-sm mt-2">{errors.impact_areas}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  What is the biggest barrier when you have an idea meant to help a community or address a global challenge? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    "I don't know how to turn it into a real project",
                    "No platform to share it where it can get traction",
                    "Hard to find people or organisations willing to fund or support it",
                    "The idea feels too big to tackle alone",
                    "I'm not sure who the right stakeholders are",
                    "I've never had such an idea"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="impact_barrier"
                        value={option}
                        checked={formData.impact_barrier === option}
                        onChange={(e) => updateField('impact_barrier', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.impact_barrier && <p className="text-red-400 text-sm mt-2">{errors.impact_barrier}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-4">
                  How valuable would it be to have a dedicated space where community and global-impact ideas are surfaced, refined collaboratively, and converted into structured projects? <span className="text-red-400">*</span>
                </label>
                <RatingScale
                  value={formData.impact_platform_value}
                  onChange={(value) => updateField('impact_platform_value', value)}
                  min={1}
                  max={7}
                  minLabel="Not valuable"
                  maxLabel="Extremely valuable"
                />
                {errors.impact_platform_value && <p className="text-red-400 text-sm mt-2">{errors.impact_platform_value}</p>}
              </div>
            </>
          )}

          {/* Section 5: Platform Fit */}
          {currentSection === 5 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-4">
                  How appealing is the idea of a single platform that takes you from raw idea → validated concept → structured execution → investor-ready? <span className="text-red-400">*</span>
                </label>
                <RatingScale
                  value={formData.platform_appeal}
                  onChange={(value) => updateField('platform_appeal', value)}
                  min={1}
                  max={7}
                  minLabel="Not appealing"
                  maxLabel="Extremely appealing"
                />
                {errors.platform_appeal && <p className="text-red-400 text-sm mt-2">{errors.platform_appeal}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  If your startup or project had a publicly visible credibility score based on real execution data, how would that affect you? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    "It would strongly motivate me to move faster",
                    "It would help me attract partners and funders more easily",
                    "It would create unnecessary pressure",
                    "I wouldn't care either way",
                    "I'd want more control over what's visible"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="credibility_score_impact"
                        value={option}
                        checked={formData.credibility_score_impact === option}
                        onChange={(e) => updateField('credibility_score_impact', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.credibility_score_impact && <p className="text-red-400 text-sm mt-2">{errors.credibility_score_impact}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-4">
                  Imagine you had access to this kind of platform today. How would you feel if it disappeared tomorrow? <span className="text-red-400">*</span>
                  <span className="text-blue-400 text-sm ml-2 block mt-1">(Sean Ellis PMF Test - Critical Metric)</span>
                </label>
                <div className="space-y-3">
                  {[
                    "Very disappointed — I'd have no good alternative",
                    "Somewhat disappointed — but I'd find workarounds",
                    "Not disappointed — I can manage without it",
                    "I'm not sure yet"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="sean_ellis_score"
                        value={option}
                        checked={formData.sean_ellis_score === option}
                        onChange={(e) => updateField('sean_ellis_score', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.sean_ellis_score && <p className="text-red-400 text-sm mt-2">{errors.sean_ellis_score}</p>}
              </div>
            </>
          )}

          {/* Section 6: Final Thoughts */}
          {currentSection === 6 && (
            <>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-4">
                  How likely are you to recommend a platform like this to someone building something? <span className="text-red-400">*</span>
                </label>
                <RatingScale
                  value={formData.nps_score}
                  onChange={(value) => updateField('nps_score', value)}
                  min={1}
                  max={7}
                  minLabel="Would not recommend"
                  maxLabel="Would strongly recommend"
                />
                {errors.nps_score && <p className="text-red-400 text-sm mt-2">{errors.nps_score}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  What's one thing a platform like this absolutely must get right to be useful to you? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.must_have_feature || ''}
                  onChange={(e) => updateField('must_have_feature', e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder="Share your most critical requirement..."
                />
                {errors.must_have_feature && <p className="text-red-400 text-sm mt-2">{errors.must_have_feature}</p>}
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <label className="block text-white font-semibold mb-3">
                  Would you be interested in early access when this platform is ready? <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    "Yes — sign me up",
                    "Yes — but only if it fits my use case",
                    "Maybe, I'd like to learn more first",
                    "Not at this time"
                  ].map(option => (
                    <label key={option} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="early_access_interest"
                        value={option}
                        checked={formData.early_access_interest === option}
                        onChange={(e) => updateField('early_access_interest', e.target.value)}
                        className="w-4 h-4 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700 border-gray-600"
                      />
                      <span className="text-gray-300">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.early_access_interest && <p className="text-red-400 text-sm mt-2">{errors.early_access_interest}</p>}
              </div>

              {showEmailField && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <label className="block text-white font-semibold mb-3">
                    Email Address for Early Access <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email}</p>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          
          {currentSection < 6 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-linear-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  Submit Survey
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{errors.submit}</p>
          </div>
        )}
      </div>
    </div>
  )
}