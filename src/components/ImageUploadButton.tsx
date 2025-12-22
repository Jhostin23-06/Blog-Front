import React from 'react';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';

export function ImageUploadButton({
  type,
  onUpload,
  style
}: {
  type: 'profile' | 'cover';
  onUpload: (file: File) => Promise<void>;
  style?: React.CSSProperties;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onUpload(file);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  return (
    <>
      <IconButton
        onClick={handleUploadClick}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
          ...style
        }}
        size={type === 'profile' ? 'small' : 'medium'}
      >
        <Edit fontSize={type === 'profile' ? 'small' : 'medium'} />
      </IconButton>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </>
  );
}