import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass rounded-2xl p-8 luxury-shadow">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white/80 mx-auto"></div>
        <p className="text-white/80 mt-4 text-center font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
