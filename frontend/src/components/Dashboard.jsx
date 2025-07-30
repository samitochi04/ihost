import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Sidebar from './Sidebar'
import DocumentGrid from './DocumentGrid'
import ChatPanel from './ChatPanel'
import Header from './Header'
import { DndContext, closestCenter } from '@dnd-kit/core'

const Dashboard = () => {
  const [classifications, setClassifications] = useState([])
  const [documents, setDocuments] = useState([])
  const [selectedClassification, setSelectedClassification] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [draggedFilesToChat, setDraggedFilesToChat] = useState([])

  useEffect(() => {
    fetchUser()
    fetchClassifications()
    fetchDocuments()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      
      // Ensure user exists in custom users table
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
        }, {
          onConflict: 'id'
        })
      
      if (error) {
        console.error('Error syncing user:', error)
      }
    }
  }

  const fetchClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from('classifications')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setClassifications(data || [])
    } catch (error) {
      console.error('Error fetching classifications:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setLoading(false)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!active || !over) return

    const documentId = active.id
    
    if (over.id === 'chat-panel') {
      const draggedDocument = documents.find(doc => doc.id === documentId)
      if (draggedDocument) {
        setDraggedFilesToChat([draggedDocument])
        setTimeout(() => setDraggedFilesToChat([]), 100)
      }
      return
    }

    if (over.id === active.id) return

    const currentDoc = documents.find(doc => doc.id === documentId)
    if (!currentDoc) return

    const newClassificationId = over.id === 'root' ? null : over.id
    
    if (currentDoc.classification_id === newClassificationId) return

    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          classification_id: newClassificationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error

      await fetchDocuments()
      
      toast.success('Document moved successfully')
    } catch (error) {
      console.error('Error moving document:', error)
      toast.error('Failed to move document')
    }
  }

  const getFilteredDocuments = () => {
    if (!selectedClassification) {
      return documents.filter(doc => !doc.classification_id)
    }
    return documents.filter(doc => doc.classification_id === selectedClassification.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-6 sm:p-8 luxury-shadow">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-white/20 border-t-white/80 mx-auto"></div>
          <p className="text-white/80 mt-4 text-center font-medium text-sm sm:text-base">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen flex flex-col">
        <Header 
          user={user}
          selectedClassification={selectedClassification}
          onToggleChat={() => setIsChatOpen(!isChatOpen)}
          isChatOpen={isChatOpen}
        />
        
        <div className="flex-1 flex">
          <div className={`
            ${isChatOpen ? 'hidden xl:block' : 'block'} 
            w-full xl:w-80 2xl:w-96 border-r border-white/10
          `}>
            <Sidebar
              classifications={classifications}
              selectedClassification={selectedClassification}
              onSelectClassification={setSelectedClassification}
              onRefresh={fetchClassifications}
            />
          </div>
          
          <div className={`
            flex-1 
            ${isChatOpen ? 'hidden xl:block' : 'block'}
          `}>
            <main className="flex-1 p-3 sm:p-6">
              <DocumentGrid
                documents={getFilteredDocuments()}
                selectedDocument={selectedDocument}
                onSelectDocument={setSelectedDocument}
                onRefresh={fetchDocuments}
                selectedClassification={selectedClassification}
              />
            </main>
          </div>

          {isChatOpen && (
            <div className="fixed inset-0 xl:relative xl:inset-auto w-full xl:w-96 2xl:w-[28rem] bg-black/50 xl:bg-transparent backdrop-blur-sm xl:backdrop-blur-none z-40 xl:z-auto">
              <ChatPanel
                selectedDocument={selectedDocument}
                selectedClassification={selectedClassification}
                onClose={() => setIsChatOpen(false)}
                draggedFiles={draggedFilesToChat}
              />
            </div>
          )}
        </div>
      </div>
    </DndContext>
  )
}

export default Dashboard
