



"use client"

import type React from "react"
import { useState } from "react"
import type { RegistrationData } from "@/app/page"

// Define the type for the form data managed by the parent
type FormData = {
  name: string
  dob: string
  occupation: string
  mobile: string
  email: string
  car_model: string
}

interface RegistrationPageProps {
  city: string
  // --- FIX: Update the 'onSubmit' prop type ---
  onSubmit: (data: Omit<RegistrationData, "uid">) => void;
  onViewTerms: () => void
  // Add props for lifted state
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  termsAccepted: boolean
  setTermsAccepted: React.Dispatch<React.SetStateAction<boolean>>
  isLoading: boolean // Add loading prop
  externalEmailError?: string // Add external email error prop
  clearEmailError?: () => void // Add function to clear email error
}

export default function RegistrationPage({
  city,
  onSubmit,
  onViewTerms,
  formData,
  setFormData,
  termsAccepted,
  setTermsAccepted,
  isLoading, // Destructure loading prop
  externalEmailError, // Destructure external email error
  clearEmailError, // Destructure clear email error function
}: RegistrationPageProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Full name is required"
    if (!formData.dob) newErrors.dob = "Date of birth is required"
    if (!formData.occupation.trim()) newErrors.occupation = "Occupation is required"
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Valid 10-digit mobile number is required"
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid email is required"
    if (!termsAccepted) newErrors.terms = "You must accept Terms & Conditions"
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return // Prevent multiple submissions

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    // onSubmit now just passes the data up
    // This object ({ ...formData, city }) correctly matches Omit<RegistrationData, "uid">
    onSubmit({ ...formData, city })
    console.log("Form submitted:", { ...formData, city })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Use the setFormData prop
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    // Clear external email error when user types in email field
    if (name === "email" && clearEmailError) {
      clearEmailError()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">

      {/* Hero Section */}
      <img
        src={`/cover/${city.toLowerCase()}.png`} // Dynamic src
        alt="Drum Tao"
        className="w-full h-auto max-h-64 object-cover"
      />

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 mt-6 text-pretty">Let's Get You Started</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... (input fields remain the same, using props for value/onChange) ... */}
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              maxLength={14}
              value={formData.name} // Value from prop
              onChange={handleChange}
              style={{ backgroundColor: '#222222', fontSize: '18px' }}
              className="w-full px-4 py-3 text-white placeholder-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              {/* <span className="text-gray-400 text-xs">{formData.name.length}/10</span> */}
            </div>
          </div>

          {/* Date of Birth */}
          <div className="relative w-full">
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]} // prevent future dates
              style={{ backgroundColor: '#222222', fontSize: '18px' }}
              className="w-full px-4 py-3 text-white focus:outline-none focus:border-red-500 bg-[#222222] text-[18px] appearance-none"
            />

            

            {/* Custom calendar icon */}
            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3333 1.66663V4.99996M6.66663 1.66663V4.99996" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.8333 3.33337H9.16667C6.02397 3.33337 4.45262 3.33337 3.47631 4.30968C2.5 5.286 2.5 6.85734 2.5 10V11.6667C2.5 14.8094 2.5 16.3808 3.47631 17.357C4.45262 18.3334 6.02397 18.3334 9.16667 18.3334H10.8333C13.976 18.3334 15.5474 18.3334 16.5237 17.357C17.5 16.3808 17.5 14.8094 17.5 11.6667V10C17.5 6.85734 17.5 5.286 16.5237 4.30968C15.5474 3.33337 13.976 3.33337 10.8333 3.33337Z" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 8.33337H17.5" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.99621 11.6666H10.0037M9.99621 15H10.0037M13.3258 11.6666H13.3333M6.66663 11.6666H6.6741M6.66663 15H6.6741" stroke="#FF0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}

            <style jsx>{`
    input[type="date"]::-webkit-calendar-picker-indicator {
      display: none;
      -webkit-appearance: none;
      appearance: none;
    }
    input[type="date"]::-moz-calendar-picker-indicator {
      display: none;
    }
    /* Hide the native placeholder text (dd/mm/yyyy) */
    input[type="date"]::-webkit-datetime-edit-text,
    input[type="date"]::-webkit-datetime-edit-month-field,
    input[type="date"]::-webkit-datetime-edit-day-field,
    input[type="date"]::-webkit-datetime-edit-year-field {
      color: transparent;
    }
    /* Show date values in white when a date is selected */
    input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-text,
    input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-month-field,
    input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-day-field,
    input[type="date"]:not(:placeholder-shown)::-webkit-datetime-edit-year-field {
      color: white;
    }
    input[type="date"][value]:not([value=""])::-webkit-datetime-edit-text,
    input[type="date"][value]:not([value=""])::-webkit-datetime-edit-month-field,
    input[type="date"][value]:not([value=""])::-webkit-datetime-edit-day-field,
    input[type="date"][value]:not([value=""])::-webkit-datetime-edit-year-field {
      color: white;
    }
  `}</style>
          </div>

          {/* Occupation */}
          <div>
            <input
              type="text"
              name="occupation"
              placeholder="Occupation"
              value={formData.occupation} // Value from prop
              onChange={handleChange}
              style={{ backgroundColor: '#222222', fontSize: '18px' }}
              className="w-full px-4 py-3 text-white placeholder-white focus:outline-none focus:border-red-500"
            />
            {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              maxLength={10}
              value={formData.mobile} // Value from prop
              onChange={handleChange}
              style={{ backgroundColor: '#222222', fontSize: '18px' }}
              className="w-full px-4 py-3 text-white placeholder-white focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
              {/* <span className="text-gray-400 text-xs">{formData.mobile.length}/10</span> */}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email} // Value from prop
              onChange={handleChange}
              style={{ backgroundColor: '#222222', fontSize: '18px' }}
              className="w-full px-4 py-3 text-white placeholder-white focus:outline-none focus:border-red-500"
            />
            {(errors.email || externalEmailError) && (
              <p className="text-red-500 text-sm mt-1">{errors.email || externalEmailError}</p>
            )}
          </div>

          {/* Car Model */}
          <div>
            <textarea
              name="car_model"
              placeholder={"Current Car / Vehicle Owned by You / Family"}
              value={formData.car_model} // 🆕 Controlled input
              onChange={(e) => {
                const { name, value } = e.target
                setFormData((prev) => ({ ...prev, [name]: value }))
              }}
              rows={2}
              style={{ backgroundColor: '#222222', fontSize: '18px', resize: 'none' }}
              className="w-full px-4 py-3 text-white placeholder-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-center gap-3 mb-6">
            <div className="custom-checkbox-wrapper">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted} // Value from prop
                onChange={(e) => {
                  setTermsAccepted(e.target.checked) // Use setTermsAccepted prop
                  if (errors.terms) {
                    setErrors((prev) => ({ ...prev, terms: "" }))
                  }
                }}
                className="cursor-pointer flex-shrink-0 custom-checkbox"
              />
              <style jsx>{`
                .custom-checkbox {
                  appearance: none;
                  width: 24px;
                  height: 24px;
                  border: 3px solid #FF0000;
                  background-color: #000000;
                  border-radius: 6px;
                  cursor: pointer;
                  position: relative;
                  flex-shrink: 0;
                  vertical-align: middle;
                }
                .custom-checkbox:checked::after {
                  content: '✓';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  color: #FF0000;
                  font-size: 16px;
                  font-weight: bold;
                }
              `}</style>
            </div>
            <label htmlFor="terms" className="cursor-pointer flex items-center">
              <button
                type="button"
                onClick={onViewTerms}
                style={{ fontSize: '18px', color: '#FF0000', textDecoration: 'underline', lineHeight: '24px' }}
                className="hover:text-red-500"
              >
                Terms & Conditions
              </button>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading} // Disable button when loading
            className="w-full bg-red-600 text-white py-4 mb-8 font-semibold text-lg hover:bg-red-700 transition-colors disabled:bg-gray-500"
          >
            {isLoading ? "Submitting..." : "SUBMIT"}
          </button>
        </form>
      </div>
    </div>
  )
}