import React from 'react'
import { supabase } from '../lib/supabase'
import { LogOut, MessageCircle, User } from 'lucide-react'

const Header = ({ user, selectedClassification, onToggleChat, isChatOpen }) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="glass-dark border-b border-white/10 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-lg sm:text-2xl font-bold text-white">iHost</h1>
          {selectedClassification && (
            <>
              <span className="text-white/40 hidden sm:inline">/</span>
              <span className="text-white/80 font-medium text-sm sm:text-base truncate max-w-32 sm:max-w-none">
                {selectedClassification.name}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onToggleChat}
            className={`luxury-button flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 ${
              isChatOpen ? 'bg-purple-600/40' : ''
            }`}
          >
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">AI Chat</span>
            <span className="sm:hidden">AI</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="glass rounded-full p-1 sm:p-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
            </div>
            <span className="text-white/80 font-medium text-xs sm:text-sm hidden md:block max-w-24 sm:max-w-none truncate">
              {user?.user_metadata?.name || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="luxury-button flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-6 py-2 sm:py-3"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
