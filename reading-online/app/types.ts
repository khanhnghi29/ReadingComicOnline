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