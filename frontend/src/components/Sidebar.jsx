import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { supabase } from '../lib/supabase'
import { Folder, FolderOpen, Plus, ChevronRight, ChevronDown } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'

const ClassificationItem = ({ classification, isSelected, onSelect, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setNodeRef, isOver } = useDroppable({
    id: classification.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        cursor-pointer transition-all duration-200 rounded-lg
        ${isSelected ? 'bg-white/20' : 'hover:bg-white/10'}
        ${isOver ? 'bg-purple-500/20 ring-2 ring-purple-400/50' : ''}
      `}
      style={{ paddingLeft: `${level * 16 + 12}px` }}
      onClick={() => onSelect(classification)}
    >
      <div className="flex items-center gap-1 sm:gap-2 py-2 px-2">
        {classification.children?.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-1 hover:bg-white/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
            ) : (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
            )}
          </button>
        )}
        {isSelected ? (
          <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
        ) : (
          <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
        )}
        <span className="text-white/80 text-xs sm:text-sm font-medium truncate">
          {classification.name}
        </span>
      </div>

      {isExpanded && classification.children?.map((child) => (
        <ClassificationItem
          key={child.id}
          classification={child}
          isSelected={isSelected?.id === child.id}
          onSelect={onSelect}
          level={level + 1}
        />
      ))}
    </div>
  )
}

const Sidebar = ({ classifications, selectedClassification, onSelectClassification, onRefresh }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const { setNodeRef: rootRef, isOver: isRootOver } = useDroppable({
    id: 'root',
  })

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to create folders')
        return
      }
      
      const { data, error } = await supabase
        .from('classifications')
        .insert({
          name: newFolderName.trim(),
          owner_id: user.id,
          parent_id: selectedClassification?.id || null,
        })
        .select()

      if (error) throw error

      setNewFolderName('')
      setIsCreating(false)
      onRefresh()
      toast.success(`Folder "${newFolderName.trim()}" created successfully!`)
    } catch (error) {
      console.error('Error creating folder:', error)
      toast.error('Failed to create folder: ' + error.message)
    }
  }

  // Build tree structure
  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildTree(items, item.id)
      }))
  }

  const tree = buildTree(classifications)

  return (
    <div className="w-full h-full glass-dark flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Folders</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="luxury-button p-2"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateFolder} className="mb-4">
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="luxury-input w-full text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="luxury-button-primary px-3 py-1 text-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setNewFolderName('')
                }}
                className="luxury-button px-3 py-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Root folder */}
        <div
          ref={rootRef}
          className={`
            cursor-pointer transition-all duration-200 rounded-lg p-3 mb-2
            ${!selectedClassification ? 'bg-white/20' : 'hover:bg-white/10'}
            ${isRootOver ? 'bg-purple-500/20 ring-2 ring-purple-400/50' : ''}
          `}
          onClick={() => onSelectClassification(null)}
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm font-medium">All Documents</span>
          </div>
        </div>

        {/* Folder tree */}
        {tree.map((classification) => (
          <ClassificationItem
            key={classification.id}
            classification={classification}
            isSelected={selectedClassification?.id === classification.id}
            onSelect={onSelectClassification}
          />
        ))}
      </div>
    </div>
  )
}

export default Sidebar
