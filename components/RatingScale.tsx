'use client'

interface RatingScaleProps {
  value?: number
  onChange: (value: number) => void
  min: number
  max: number
  minLabel: string
  maxLabel: string
}

export default function RatingScale({ value, onChange, min, max, minLabel, maxLabel }: RatingScaleProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(num => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-200 ${
              value === num
                ? 'bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}