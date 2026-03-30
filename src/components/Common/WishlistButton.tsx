import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FiHeart } from 'react-icons/fi'
import { useUserStore } from '../../store/userStore'

interface WishlistButtonProps {
  productId: string
  size?: number
  className?: string
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, size = 18, className = '' }) => {
  const navigate = useNavigate()
  const currentUser = useUserStore((s) => s.currentUser)
  const isInWishlist = useUserStore((s) => s.isInWishlist)
  const toggleWishlist = useUserStore((s) => s.toggleWishlist)

  const liked = isInWishlist(productId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUser) {
      navigate('/login')
      return
    }
    toggleWishlist(productId)
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all duration-200 ${
        liked
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
      } ${className}`}
      title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <FiHeart size={size} className={liked ? 'fill-red-500' : ''} />
    </button>
  )
}
