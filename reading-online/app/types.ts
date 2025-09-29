// app/types.ts
export interface GenreDto {
  genreId: number; // Optional cho create
  genreName: string;
  comicGenres?: any; // Null trong response
}

export interface AuthorDto {
  authorId: number;
  authorName: string;
  comics?: any; // Null trong response
}

export interface ComicCreateDto {
  title: string;
  comicDescription?: string;
  comicImage?: File;
  authorId: number;
  genreIds: number[];
  price: number;
  totalViews: number;
}

export interface ComicResponseDto {
  comicId: number; // Thay ComicId → comicId (camelCase)
  title: string; // Thay Title → title
  comicImageUrl: string; // Thay ComicImageUrl → comicImageUrl
  comicDescription: string; // Thay ComicDescription → comicDescription
  price: number; // Thay Price → price
  totalViews: number; // Thay TotalViews → totalViews
  authorId: number; // Thay AuthorId → authorId
  createAt: string; // Thay CreateAt → createAt (DateTime as ISO string)
  author: AuthorDto;
  genres: GenreDto[];
  chapters: ChapterResponseDto[];
}

export interface ChapterCreateDto {
  chapterNumber: number;
  chapterTitle?: string;
  images: File[];
}

export interface ChapterResponseDto {
  chapterId: number; // Thay ChapterId → chapterId
  comicId: number; // Thay ComicId → comicId
  chapterNumber: number;
  chapterTitle: string;
  createAt: string; // Thay CreateAt → createAt
  chapterImages: ChapterImage[];
}

export interface ChapterImage {
  imageId: number; // Thay ImageId → imageId
  chapterId: number;
  imageUrl: string; // Thay ImageUrl → imageUrl
  imageOrder: number; // Thay ImageOrder → imageOrder
  chapter?: any; // Null trong response
}
export interface UserCreateDto {
  userName: string;
  password: string;
  email: string;
}

export interface UserLoginDto {
  userName: string;
  password: string;

}

export interface UserResponseDto {
  userName: string;
  email: string;
  roleId: number; // 2 = Admin, 1 = Reader
}
export interface LoginResponse {
  message: string;
  token: string;
  username: string;
  roleId: number;
}
export interface RegisterResponse extends UserResponseDto {}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface JwtPayload {
  sub: string; // userName - required for our app
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Reader' | 'Admin' | 'Unknown'; // role claim
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string; // / email claim
  roleId: string; // required for our app
  jti: string; // JWT ID
  exp: number; // Token expiration timestamp - required
  iss: string; // Issuer
  aud: string; // Audience
  iat?: number; // Issued at (optional)
  nbf?: number; // Not before (optional)
}
// Type guard function để validate JWT payload
// export function isValidJwtPayload(obj: any): obj is JwtPayload {
//   return (
//     obj &&
//     typeof obj === 'object' &&
//     typeof obj.sub === 'string' &&
//     typeof obj.email === 'string' &&
//     typeof obj.roleId === 'string' &&
//     typeof obj.role === 'string' &&
//     ['Reader', 'Admin', 'Unknown'].includes(obj.role) &&
//     typeof obj.exp === 'number' &&
//     typeof obj.jti === 'string'
//   );
// }
export function isValidJwtPayload(obj: any): obj is JwtPayload {
  const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const emailClaimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
  
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.sub === 'string' &&
    typeof obj[emailClaimKey] === 'string' &&
    typeof obj.roleId === 'string' &&
    typeof obj[roleClaimKey] === 'string' &&
    ['Reader', 'Admin', 'Unknown'].includes(obj[roleClaimKey]) &&
    typeof obj.exp === 'number' &&
    typeof obj.jti === 'string'
  );
}
// Helper interface for easier access
export interface ParsedJwtPayload {
  sub: string;
  role: 'Reader' | 'Admin' | 'Unknown';
  email: string;
  roleId: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
  iat?: number;
  nbf?: number;
}
export function parseJwtPayload(payload: JwtPayload): ParsedJwtPayload {
  const roleClaimKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
  const emailClaimKey = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
  
  return {
    sub: payload.sub,
    role: payload[roleClaimKey],
    email: payload[emailClaimKey],
    roleId: payload.roleId,
    jti: payload.jti,
    exp: payload.exp,
    iss: payload.iss,
    aud: payload.aud,
    iat: payload.iat,
    nbf: payload.nbf
  };
}
export interface AuthState {
  user: UserResponseDto | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}