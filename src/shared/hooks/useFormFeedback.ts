import { useState } from 'react'

export function useFormFeedback() {
  const [feedback, setFeedback] = useState('')

  return {
    feedback,
    clearFeedback: () => setFeedback(''),
    setSuccess: (message: string) => setFeedback(message),
    setError: (error: unknown, fallbackMessage: string) => {
      setFeedback(error instanceof Error ? error.message : fallbackMessage)
    },
  }
}
