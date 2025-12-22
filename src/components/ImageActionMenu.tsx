// components/ImageActionMenu.tsx
import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as ProfileIcon,
  Wallpaper as CoverIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface ImageActionMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onSetAsProfile: () => void;
  onSetAsCover: () => void;
  onDelete: () => void;
  isOwnProfile: boolean;
  imageType?: 'profile_picture' | 'cover_photo';
}

export const ImageActionMenu: React.FC<ImageActionMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onSetAsProfile,
  onSetAsCover,
  onDelete,
  isOwnProfile,
  imageType
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={onClose}
    >
      {isOwnProfile ? [
        <>
          {imageType !== 'profile_picture' && (
            <MenuItem onClick={onSetAsCover}>
              <ListItemIcon>
                <ProfileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Usar como portada</ListItemText>
            </MenuItem>
          )}
          {imageType !== 'cover_photo' && (
            <MenuItem onClick={onSetAsProfile}>
              <ListItemIcon>
                <CoverIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Usar como perfil</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={onDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Eliminar</ListItemText>
          </MenuItem>
        </>
      ].filter(Boolean) : null}
    </Menu>
  );
};