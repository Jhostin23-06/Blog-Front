export type Notification = {
  _id: string;
  user_id: string;
  emitter_id: string;
  emitter_username: string;
  post_id?: string;
  comment_id?: string;
  image_id?: string; // Nuevo campo
  image_url?: string; // Nuevo campo
  image_owner_id?: string; // Nuevo campo
  image_created_at?: string; // Nuevo campo
  type: 'like' | 'comment' | 'new_follower' | 'friend_request' | 'friend_accepted' | 'ping' | 'image_comment';

  message: string;
  read: boolean;
  created_at: string;
};