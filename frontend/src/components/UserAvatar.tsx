import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, size = 50, className = "", style }) => {
  const [imgError, setImgError] = useState(false);
  
  const isPlaceholder = !src || src.includes('employee-02.jpg') || src === '' || imgError;
  
  const getInitial = (name: string | null | undefined) => {
    if (!name || typeof name !== 'string') return '?';
    const trimmed = name.trim();
    if (!trimmed) return '?';
    
    // Get the first non-space character (works for Arabic and English)
    return trimmed.charAt(0).toUpperCase();
  };

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.45, // Slightly larger for better readability
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#016A74',
    objectFit: 'cover',
    flexShrink: 0,
    userSelect: 'none',
    ...style
  };

  if (isPlaceholder) {
    return (
      <div 
        className={`user-avatar-initial ${className}`} 
        style={containerStyle}
        title={name || ''}
      >
        {getInitial(name)}
      </div>
    );
  }

  return (
    <img
      src={src!}
      alt={name || "user"}
      className={`user-avatar-img ${className}`}
      onError={() => setImgError(true)}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        ...style
      }}
    />
  );
};

export default UserAvatar;
