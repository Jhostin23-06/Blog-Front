export interface Comment {
  _id: string;
  content: string;
  post_id: string;
  author_id: string;
  author_username: string;
  author_profile_picture: string;
  created_at: string; // ISO string
}

export interface CommentCreate {
  content: string;
  post_id: string;
}