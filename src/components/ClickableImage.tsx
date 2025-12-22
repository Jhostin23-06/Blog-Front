// Componente ClickableImage.tsx
import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface ClickableImageProps {
  src: string;
  alt: string;
  type: 'profile' | 'cover';
  onUpload: (file: File) => void;
  editable: boolean;
  children?: React.ReactNode;
}

export const ClickableImage: React.FC<ClickableImageProps> = ({ 
  src, 
  alt, 
  type, 
  onUpload, 
  editable,
  children 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        cursor: editable ? 'pointer' : 'default',
        '&:hover': {
          '& .edit-overlay': {
            opacity: editable ? 0.7 : 0,
          }
        }
      }}
      onClick={handleClick}
    >
      <img
        src={src}
        alt={alt}
        style={{ 
          width: '100%', 
          height: type === 'cover' ? '350px' : '168px', 
          objectFit: 'cover',
          borderRadius: type === 'profile' ? '50%' : 'none'
        }}
      />
      
      {editable && (
        <>
          <Box
            className="edit-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              opacity: 0,
              transition: 'opacity 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              borderRadius: type === 'profile' ? '50%' : 'none'
            }}
          >
            <EditIcon fontSize="large" />
            <Typography variant="body1">Cambiar imagen</Typography>
          </Box>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </>
      )}
      
      {children}
    </Box>
  );
};