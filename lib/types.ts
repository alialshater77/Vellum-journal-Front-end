export type Viewer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
};

export type Author = {
  id: string;
  firstName: string;
  lastName: string;
};

export type Post = {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
};

export type FeedPage = {
  posts: Post[];
  totalItems: number;
  page: number;
  totalPages: number;
};

export type ViewerState =
  | { status: "guest" }
  | { status: "offline"; message: string }
  | { status: "ready"; user: Viewer };

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<
    Record<"firstName" | "lastName" | "email" | "password" | "currentPassword" | "title" | "content" | "image" | "status", string>
  >;
};
