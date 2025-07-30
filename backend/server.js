import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('Warning: OPENAI_API_KEY not set in environment variables')
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.post('/api/chat', async (req, res) => {
  try {
    console.log('Chat request received:', {
      hasMessage: !!req.body.message,
      hasMessages: !!req.body.messages,
      attachmentsCount: req.body.context?.attachments?.length || 0
    })

    const { message, context, messages, contextType, contextId } = req.body

    if (!message && (!messages || !Array.isArray(messages))) {
      return res.status(400).json({ error: 'Message or messages array is required' })
    }

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    let systemPrompt = "You are a helpful AI assistant for document management. Keep responses concise and under 200 words."
    
    if (context?.attachments && context.attachments.length > 0) {
      systemPrompt += "\n\nFiles attached to this message:"
      context.attachments.forEach(file => {
        const fileName = file.name
        const fileType = file.type
        
        if (fileType === 'application/pdf') {
          systemPrompt += `\n- ${fileName} (PDF) - You can help analyze and summarize PDF content based on the document title and user's questions.`
        } else if (fileType.startsWith('image/')) {
          systemPrompt += `\n- ${fileName} (Image) - You can help identify and analyze image content.`
        } else if (fileType.startsWith('video/')) {
          systemPrompt += `\n- ${fileName} (Video) - You can help with video organization and metadata.`
        } else {
          systemPrompt += `\n- ${fileName} (${fileType})`
        }
      })
      systemPrompt += "\n\nProvide helpful, concise guidance about these files."
    }
    
    if (contextType === 'document' && contextId) {
      systemPrompt += " Focus your responses on the document content and related questions."
    } else if (contextType === 'classification' && contextId) {
      systemPrompt += " Focus your responses on organizing, managing, and understanding documents in this folder."
    } else {
      systemPrompt += " Provide assistance with document organization and management."
    }

    let apiMessages = [
      { role: 'system', content: systemPrompt }
    ]

    if (messages && Array.isArray(messages)) {
      apiMessages.push(...messages.slice(-10))
    } else if (message) {
      apiMessages.push({ role: 'user', content: message })
    }

    console.log('Sending request to OpenAI API...')
    const response = await axios.post(OPENAI_API_URL, {
      model: 'gpt-3.5-turbo',
      messages: apiMessages,
      max_tokens: 300,
      temperature: 0.7,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    })
    
    console.log('OpenAI API response received successfully')

    const aiResponse = response.data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    res.json({
      content: aiResponse,
      contextType,
      contextId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    })
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({ error: 'Request timeout - AI took too long to respond' })
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key' })
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' })
    }

    if (error.response?.status >= 400 && error.response?.status < 500) {
      return res.status(error.response.status).json({ 
        error: error.response.data?.error?.message || 'OpenAI API request failed'
      })
    }

    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔑 OpenAI API Key: ${OPENAI_API_KEY ? 'Configured' : 'Not configured'}`)
})
