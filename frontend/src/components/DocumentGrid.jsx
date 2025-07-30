import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import { useDraggable } from '@dnd-kit/core'
import { Upload, File, Image, Video, FileText, Trash2, Eye, Download, X } from 'lucide-react'

const DocumentCard = ({ document, isSelected, onSelect, onView }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: document.id,
    disabled: false,
  })

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
    if (mimeType.startsWith('video/')) return <Video className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
    return <File className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      if (document.file_path) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path])
        
        if (storageError) console.error('Storage deletion error:', storageError)
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)

      if (error) throw error
      
      toast.success('Document deleted successfully')
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const handleView = (e) => {
    e.stopPropagation()
    onView(document)
  }

  const handleDownload = async (e) => {
    e.stopPropagation()
    
    if (!document.file_path) return

    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path, 3600)

      if (error) throw error
      
      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = document.title || 'document'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Download started')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        glass rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-200 luxury-shadow
        ${isSelected ? 'ring-2 ring-purple-400 bg-white/20' : 'hover:bg-white/15'}
        ${isDragging ? 'z-50' : ''}
      `}
      onClick={() => onSelect(document)}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div 
          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          {...listeners}
          {...attributes}
        >
          {getFileIcon(document.mime_type)}
        </div>
        
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-white font-medium text-xs sm:text-sm truncate">
            {document.title || 'Untitled'}
          </h3>
          <p className="text-white/60 text-xs mt-1">
            {new Date(document.created_at).toLocaleDateString()}
          </p>
          <p className="text-white/40 text-xs">
            {document.mime_type.split('/')[1].toUpperCase()}
          </p>
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={handleView}
            className="p-1.5 rounded hover:bg-white/20 transition-colors"
            title="View document"
          >
            <Eye className="w-3.5 h-3.5 text-white/60" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-blue-500/20 transition-colors"
            title="Download document"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded hover:bg-red-500/20 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

const DocumentPreviewModal = ({ document, onClose }) => {
  const [signedUrl, setSignedUrl] = useState('')
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const getSignedUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path, 3600)

        if (error) throw error
        setSignedUrl(data.signedUrl)
      } catch (error) {
        console.error('Error getting signed URL:', error)
        toast.error('Failed to load document preview')
      } finally {
        setLoading(false)
      }
    }

    if (document?.file_path) {
      getSignedUrl()
    }
  }, [document])

  if (!document) return null

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white/80"></div>
        </div>
      )
    }

    if (document.mime_type.startsWith('image/')) {
      return (
        <img 
          src={signedUrl} 
          alt={document.title}
          className="max-w-full max-h-96 object-contain mx-auto rounded-lg"
        />
      )
    }

    if (document.mime_type === 'application/pdf') {
      return (
        <iframe
          src={signedUrl}
          className="w-full h-96 rounded-lg"
          title={document.title}
        />
      )
    }

    if (document.mime_type.startsWith('video/')) {
      return (
        <video
          src={signedUrl}
          controls
          className="max-w-full max-h-96 mx-auto rounded-lg"
        >
          Your browser does not support the video tag.
        </video>
      )
    }

    return (
      <div className="text-center p-8">
        <File className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">Preview not available for this file type</p>
        <button
          onClick={() => window.open(signedUrl, '_blank')}
          className="luxury-button-primary mt-4"
        >
          Open in New Tab
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-white font-semibold text-lg">{document.title}</h3>
            <p className="text-white/60 text-sm">{document.mime_type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
        
        <div className="p-4 overflow-auto max-h-[70vh]">
          {renderPreview()}
        </div>
        
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={() => {
              const link = document.createElement('a')
              link.href = signedUrl
              link.download = document.title || 'document'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="luxury-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          <button onClick={onClose} className="luxury-button-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

const DocumentGrid = ({ documents, selectedDocument, onSelectDocument, onRefresh, selectedClassification }) => {
  const [uploading, setUploading] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)

  const onDrop = async (acceptedFiles) => {
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      let successCount = 0
      for (const file of acceptedFiles) {
        try {
          // Upload to Supabase Storage
          const fileExt = file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `${user.id}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          // Save to database
          const { error: dbError } = await supabase
            .from('documents')
            .insert({
              title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              file_path: filePath,
              mime_type: file.type,
              owner_id: user.id,
              classification_id: selectedClassification?.id || null,
            })

          if (dbError) throw dbError
          successCount++
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError)
          toast.error(`Failed to upload ${file.name}`)
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount === 1 ? '' : 's'}!`)
        onRefresh()
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    disabled: uploading,
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        {...getRootProps()}
        className={`
          glass rounded-xl p-4 sm:p-8 border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragActive ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 hover:border-white/40'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-white/60 mx-auto mb-2 sm:mb-4" />
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-white/20 border-t-white/60 mx-auto"></div>
              <p className="text-white/80 text-sm sm:text-base">Uploading files...</p>
            </div>
          ) : (
            <div>
              <p className="text-white/80 text-sm sm:text-lg font-medium mb-1 sm:mb-2">
                {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
              </p>
              <p className="text-white/60 text-xs sm:text-sm">
                Supports PDF, images, and videos
              </p>
            </div>
          )}
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              isSelected={selectedDocument?.id === document.id}
              onSelect={onSelectDocument}
              onView={setPreviewDocument}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-6 sm:p-8 text-center">
          <File className="w-12 h-12 sm:w-16 sm:h-16 text-white/40 mx-auto mb-4" />
          <p className="text-white/60 text-base sm:text-lg">
            {selectedClassification 
              ? `No documents in "${selectedClassification.name}"`
              : 'No documents yet'
            }
          </p>
          <p className="text-white/40 text-xs sm:text-sm mt-2">
            Upload your first document to get started
          </p>
        </div>
      )}

      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  )
}

export default DocumentGrid
