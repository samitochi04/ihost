import React, { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDroppable } from '@dnd-kit/core'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import { apiCall, apiConfig } from '../config/api'
import { Send, X, Bot, User, Loader2, Paperclip, FileText, Image as ImageIcon, Video, Trash2, Upload } from 'lucide-react'

const ChatPanel = ({ selectedDocument, selectedClassification, onClose, draggedFiles = [] }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatSession, setChatSession] = useState(null)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef(null)

  // Make ChatPanel droppable for files from folders
  const { setNodeRef, isOver } = useDroppable({
    id: 'chat-panel',
  })

  useEffect(() => {
    initializeChatSession()
  }, [selectedDocument, selectedClassification])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle files dragged from app folders
  useEffect(() => {
    if (draggedFiles.length > 0) {
      const processedFiles = draggedFiles.map(doc => ({
        id: doc.id,
        name: doc.title || doc.file_path?.split('/').pop() || 'Unknown file',
        type: doc.mime_type || 'application/octet-stream',
        url: doc.file_path, // This should be the Supabase storage URL
        path: doc.file_path,
        size: doc.size || 0,
        isFromApp: true // Mark as dragged from app
      }))
      
      setAttachedFiles(prev => [...prev, ...processedFiles])
      toast.success(`${processedFiles.length} file(s) attached from folder`)
    }
  }, [draggedFiles])

  const handleFileUpload = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    try {
      const uploadedFiles = []
      
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `chat-attachments/${fileName}`
        
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(filePath, file)
        
        if (error) {
          console.error('Upload error:', error)
          toast.error(`Failed to upload ${file.name}: ${error.message}`)
          continue
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)
        
        uploadedFiles.push({
          id: Math.random().toString(36).substring(2),
          name: file.name,
          type: file.type,
          url: urlData.publicUrl,
          path: filePath,
          size: file.size,
          isFromApp: false // Mark as newly uploaded
        })
      }
      
      setAttachedFiles(prev => [...prev, ...uploadedFiles])
      toast.success(`${uploadedFiles.length} file(s) uploaded and attached`)
    } catch (error) {
      toast.error('Failed to upload files')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'video/mp4': ['.mp4'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: handleFileUpload
  })

  const removeAttachedFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeChatSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('No authenticated user found')
        return
      }

      // Ensure we have either a document or classification, but not both
      let sessionData = {
        user_id: user.id,
        document_id: null,
        classification_id: null
      }

      if (selectedDocument?.id) {
        sessionData.document_id = selectedDocument.id
      } else if (selectedClassification?.id) {
        sessionData.classification_id = selectedClassification.id
      } else {
        // If neither is selected, we'll create a general chat session
        // For this, we need to modify the CHECK constraint or handle it differently
        // console.log('Creating general chat session without specific context')
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(sessionData)
        .select()
        .single()

      if (error) {
        console.error('Error creating chat session:', error)
        throw error
      }
      
      setChatSession(data)
      setMessages([])
    } catch (error) {
      console.error('Error creating chat session:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() && attachedFiles.length === 0) return
    if (loading) return

    const userMessage = inputMessage.trim()
    const currentAttachedFiles = [...attachedFiles]
    setInputMessage('')
    setAttachedFiles([])
    setLoading(true)

    // Add user message to UI immediately
    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      content: userMessage,
      attachments: currentAttachedFiles,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      // Save user message to database
      if (chatSession) {
        await supabase
          .from('messages')
          .insert({
            chat_session_id: chatSession.id,
            sender: 'user',
            content: userMessage,
          })
      }

      // Prepare context with attachments
      const context = {
        selectedDocument: selectedDocument ? {
          name: selectedDocument.name,
          type: selectedDocument.type
        } : null,
        selectedClassification: selectedClassification ? {
          name: selectedClassification.name
        } : null,
        attachments: currentAttachedFiles.map(file => ({
          name: file.name,
          type: file.type,
          url: file.url
        }))
      }

      // Send to backend API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout (backend has 10s)

      const data = await apiCall('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage,
          context: context,
          messages: [...messages, newUserMessage].map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          contextType: selectedDocument ? 'document' : 'classification',
          contextId: selectedDocument?.id || selectedClassification?.id,
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: data.content || 'Sorry, I could not generate a response.',
        created_at: new Date().toISOString(),
      }

      setMessages(prev => [...prev, aiMessage])

      // Save AI message to database
      if (chatSession) {
        await supabase
          .from('messages')
          .insert({
            chat_session_id: chatSession.id,
            sender: 'ai',
            content: aiMessage.content,
          })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = 'Sorry, I encountered an error. Please try again.'
      
      if (error.name === 'AbortError') {
        errorContent = '⏰ The AI response took too long. Please try a shorter message or try again later.'
      } else if (error.message.includes('timeout')) {
        errorContent = '⏰ Request timed out. Please try again with a shorter message.'
      } else if (error.message.includes('Failed to fetch')) {
        errorContent = '🔌 Connection error. Please check your internet connection.'
      } else if (error.message.includes('Server error: 408')) {
        errorContent = '⏰ The AI is taking too long to respond. Please try a shorter message.'
      } else if (error.message.includes('Server error: 429')) {
        errorContent = '⚠️ Too many requests. Please wait a moment and try again.'
      } else if (error.message.includes('Invalid API key')) {
        errorContent = '🔑 API configuration error. Please contact support.'
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        content: errorContent,
        created_at: new Date().toISOString(),
        error: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const contextName = selectedDocument?.title || selectedClassification?.name || 'All Documents'

  return (
    <div 
      ref={setNodeRef}
      className={`w-full h-full glass-dark flex flex-col transition-all duration-200 ${
        isOver ? 'bg-purple-500/20 border-purple-400/50' : ''
      }`}
    >
      <div className="p-3 sm:p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <h3 className="text-white font-semibold text-sm sm:text-base">AI Assistant</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/20 transition-colors xl:hidden"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>
        <p className="text-white/60 text-xs sm:text-sm mt-1">
          Context: {contextName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {isOver && (
          <div className="absolute inset-4 border-2 border-dashed border-purple-400 rounded-lg bg-purple-500/10 flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-purple-400 mb-2" />
              <p className="text-purple-400 font-medium text-sm">Drop files here to attach to chat</p>
            </div>
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-white/60 mt-6 sm:mt-8">
            <Bot className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 text-white/40" />
            <p className="text-sm sm:text-base">Start a conversation about your {selectedDocument ? 'document' : 'folder'}!</p>
            <p className="text-xs text-white/40 mt-2">💡 Drag files from your folders to attach them</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${message.sender === 'user' ? 'bg-purple-600' : 'bg-white/10'}
            `}>
              {message.sender === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white/70" />
              )}
            </div>

            <div className={`
              flex-1 max-w-[80%] p-3 rounded-xl
              ${message.sender === 'user' 
                ? 'bg-purple-600 text-white' 
                : message.error 
                  ? 'bg-red-500/20 border border-red-500/50 text-red-200'
                  : 'glass text-white/90'
              }
            `}>
              {/* Message attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-2 space-y-1">
                  {message.attachments.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-black/20 rounded text-xs">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-3 h-3" />
                      ) : file.type === 'application/pdf' ? (
                        <FileText className="w-3 h-3" />
                      ) : file.type === 'video/mp4' ? (
                        <FileText className="w-3 h-3" />
                      ) : (
                        <Paperclip className="w-3 h-3" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`
                text-xs mt-1
                ${message.sender === 'user' ? 'text-purple-100' : 'text-white/40'}
              `}>
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white/70" />
            </div>
            <div className="glass p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white/60" />
                <span className="text-white/60 text-sm">AI is thinking... ⚡ hold on</span>
              </div>
              <p className="text-xs text-white/40 mt-1">Faster responses with ihost AI</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
        {/* File Attachments Preview */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="text-xs text-white/60 flex items-center gap-2">
              <Paperclip className="w-3 h-3" />
              Attached Files ({attachedFiles.length})
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {attachedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 glass rounded text-xs">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="w-3 h-3 text-green-400" />
                  ) : file.type === 'application/pdf' ? (
                    <FileText className="w-3 h-3 text-red-400" />
                  ) : file.type === 'video/mp4' ? (
                    <Video className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Paperclip className="w-3 h-3 text-white/60" />
                  )}
                  <span className="flex-1 truncate text-white/80">{file.name}</span>
                  {file.isFromApp && (
                    <span className="text-purple-400 text-xs">📁</span>
                  )}
                  <span className="text-white/40">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(file.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          {...getRootProps()}
          className={`
            mb-3 p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-purple-400 bg-purple-400/10' 
              : 'border-white/20 hover:border-white/40'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={uploading} />
          <div className="text-center">
            {uploading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-white/60">Uploading...</span>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-6 h-6 mx-auto text-white/40" />
                <p className="text-xs text-white/60">
                  {isDragActive 
                    ? 'Drop files here...' 
                    : 'Drop files or click to attach'
                  }
                </p>
                <p className="text-xs text-white/40">
                  PDF, MP4, JPG, JPEG, PNG, SVG (max 50MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask something about your documents..."
            className="luxury-input flex-1 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || (!inputMessage.trim() && attachedFiles.length === 0)}
            className="luxury-button-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatPanel
