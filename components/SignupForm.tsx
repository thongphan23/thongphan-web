'use client'

import { useState, FormEvent } from 'react'
import styles from './SignupForm.module.css'

interface SignupFormProps {
  challengeSlug: string
}

interface FormData {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

export default function SignupForm({ challengeSlug }: SignupFormProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên phải có ít nhất 2 ký tự'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Call signup API
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_slug: challengeSlug,
          name: formData.name.trim(),
          email: formData.email.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }

      // Success
      setIsSuccess(true)

    } catch (error) {
      console.error('Signup error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Success state
  if (isSuccess) {
    return (
      <div className={styles.signupForm}>
        <div className={styles.successMessage}>
          <h3>🎉 Đăng ký thành công!</h3>
          <p>
            Email đầu tiên sẽ đến hộp thư của bạn trong vòng 5 phút.
            <br />
            Nhớ check cả thư mục Spam nhé!
          </p>
        </div>
      </div>
    )
  }

  // Form state
  return (
    <div className={styles.signupForm}>
      {submitError && (
        <div className={styles.errorAlert}>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Tên của bạn
          </label>
          <input
            id="name"
            type="text"
            className={`${styles.input} ${errors.name ? styles.error : ''}`}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Nguyễn Văn A"
            disabled={isSubmitting}
          />
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@example.com"
            disabled={isSubmitting}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>

        <button
          type="submit"
          className={`btn-primary ${styles.submitButton}`}
          disabled={isSubmitting}
        >
          {isSubmitting && <span className={styles.spinner}></span>}
          {isSubmitting ? 'Đang xử lý...' : 'Đăng ký ngay →'}
        </button>
      </form>
    </div>
  )
}
