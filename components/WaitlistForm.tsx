'use client'

import { useState } from 'react'
import { 
  User, 
  Mail, 
  Building2, 
  Briefcase, 
  Code2, 
  Target, 
  Users,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import type { WaitlistFormData } from '@/types'

const techStackOptions = [
  'JavaScript/TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'React/Next.js',
  'Vue/Nuxt',
  'Angular',
  'Node.js',
  'Django',
  'Spring Boot',
  'Other'
]

const useCaseOptions = [
  'Building web applications',
  'Mobile app development',
  'Data science/AI',
  'DevOps/Cloud',
  'Enterprise software',
  'Startup MVP',
  'Learning/Education',
  'Other'
]

const heardFromOptions = [
  'Twitter/X',
  'LinkedIn',
  'GitHub',
  'Tech newsletter',
  'Friend/Colleague',
  'Podcast',
  'Other'
]

export default function WaitlistForm() {
  const [formData, setFormData] = useState<WaitlistFormData>({
    full_name: '',
    email: '',
    company: '',
    job_title: '',
    tech_stack: '',
    use_case: '',
    heard_from: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      setSuccess(true)
      setFormData({
        full_name: '',
        email: '',
        company: '',
        job_title: '',
        tech_stack: '',
        use_case: '',
        heard_from: ''
      })
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">You're on the list!</h2>
        <p className="text-gray-600">Thanks for joining TechIt waitlist. We'll keep you updated!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-linear-to-br from-blue-600 to-purple-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white">Join the Waitlist</h2>
        <p className="text-blue-100 mt-1">Be first to experience TechIt revolution</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your company"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Tech Stack *
            </label>
            <div className="relative">
              <Code2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="tech_stack"
                required
                value={formData.tech_stack}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select your tech stack</option>
                {techStackOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Use Case *
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="use_case"
                required
                value={formData.use_case}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select your use case</option>
                {useCaseOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did you hear about us? *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="heard_from"
                required
                value={formData.heard_from}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select an option</option>
                {heardFromOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-br from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            'Submitting...'
          ) : (
            <>
              <Send className="w-5 h-5" />
              Join Waitlist
            </>
          )}
        </button>
      </form>
    </div>
  )
}