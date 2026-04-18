import { useMutation } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, type FormEvent } from 'react'
import { trackEvent } from '../lib/analytics/events'
import { submitContactForm } from '../lib/api/contactApi'
import { useSeo } from '../lib/seo/useSeo'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const contactMutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (response) => {
      if (response.ok) {
        setName('')
        setEmail('')
        setMessage('')
        trackEvent('contact_submit_success', 'contact')
      } else {
        trackEvent('contact_submit_failure', 'contact')
      }
      setFeedback(response.message ?? (response.ok ? 'Message sent successfully.' : 'Failed to send message.'))
    },
    onError: () => {
      trackEvent('contact_submit_failure', 'contact')
      setFeedback('Failed to send message. Please try again.')
    },
  })

  useSeo({
    title: 'Contact brew Brewing',
    description:
      'Get in touch with brew Brewing for private events, collaboration ideas, and taproom questions.',
    path: '/contact',
    imagePath: '/og-contact.svg',
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    contactMutation.mutate({ name, email, message })
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Contact
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.3rem', md: '3.6rem' }, lineHeight: 0.92 }}>
            Let&apos;s Talk Beer
          </Typography>
          <Typography color="text.secondary">
            Questions about events, private bookings, or collaboration opportunities? Send us a message.
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack component="form" spacing={1.2} onSubmit={handleSubmit}>
            <TextField label="Name" required value={name} onChange={(event) => setName(event.target.value)} />
            <TextField label="Email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField
              label="Message"
              required
              multiline
              minRows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button type="submit" variant="contained" disabled={contactMutation.isPending} sx={{ alignSelf: 'flex-start' }}>
              {contactMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
            {feedback ? (
              <Alert
                severity={feedback.toLowerCase().includes('failed') ? 'error' : 'success'}
                role="status"
                aria-live="polite"
              >
                {feedback}
              </Alert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
