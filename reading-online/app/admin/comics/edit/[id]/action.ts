'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, getServerAuthToken, isTokenExpired } from '@/app/lib/serverAuth';
import { AuthorDto, ComicResponseDto, GenreDto } from '@/app/types';

// Helper function for authenticated API calls
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getServerAuthToken();
  
  if (!token || isTokenExpired(token)) {
    throw new Error('Authentication required');
  }
  
  const isFormData = options.body instanceof FormData;
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
}

export async function updateComicAction(formData: FormData) {
  try {
    // Verify Admin authentication
    await requireAuth('Admin');
    
    const id = formData.get('id') as string;
    
    if (!id) {
      throw new Error('Comic ID is required');
    }
    
    const data = new FormData();
    data.append('title', formData.get('title') as string);
    data.append('comicDescription', formData.get('description') as string || '');
    
    const image = formData.get('image') as File;
    if (image?.size > 0) {
      data.append('comicImage', image);
    }
    
    data.append('authorId', formData.get('authorId') as string);
    
    const genreIds = formData.getAll('genreIds').map(String);
    genreIds.forEach((id) => data.append('genreIds', id));
    
    data.append('price', formData.get('price') as string || '0');

    const res = await fetchWithAuth(`http://localhost:5244/api/Comics/${id}`, {
      method: 'PUT',
      body: data,
    });

    console.log('Update comic status:', res.status);
    
    if (res.ok) {
      revalidatePath('/admin/comics');
      return { success: true };
    } else {
      const errorText = await res.text();
      console.error('Update comic error:', errorText);
      throw new Error('Failed to update comic: ' + errorText);
    }
  } catch (error) {
    console.error('Error in updateComicAction:', error);
    
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to update comic');
  }
}

// Fetch comic with authentication
export async function fetchComic(id: string) {
  const res = await fetch('http://localhost:5244/api/Comics/' + id, { cache: 'no-store' });
    console.log('Fetch comic status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Fetch comic error:', errorText);
      throw new Error('Failed to fetch comic');
    }
    return res.json() as Promise<ComicResponseDto>;
}

// Fetch authors with authentication
export async function fetchAuthors() {
  const res = await fetch('http://localhost:5244/api/Authors', { cache: 'no-store' });
    console.log('Fetch authors status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Fetch authors error:', errorText);
      throw new Error('Failed to fetch authors');
    }
    return res.json() as Promise<AuthorDto[]>;
}

// Fetch genres with authentication
export async function fetchGenres() {
  const res = await fetch('http://localhost:5244/api/Genres', { cache: 'no-store' });
    console.log('Fetch genres status:', res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Fetch genres error:', errorText);
      throw new Error('Failed to fetch genres');
    }
    return res.json() as Promise<GenreDto[]>;
}
// 'use server';

// import { revalidatePath } from 'next/cache';

// export async function updateComicAction(formData: FormData) {
//   const id = formData.get('id') as string;
//   const data = new FormData();
//   data.append('title', formData.get('title') as string);
//   data.append('comicDescription', formData.get('description') as string || '');
//   const image = formData.get('image') as File;
//   if (image?.size > 0) data.append('comicImage', image);
//   data.append('authorId', formData.get('authorId') as string);
//   const genreIds = formData.getAll('genreIds').map(String);
//   genreIds.forEach((id) => data.append('genreIds', id));
//   data.append('price', formData.get('price') as string || '0');

//   const res = await fetch(`http://localhost:5244/api/Comics/${id}`, {
//     method: 'PUT',
//     body: data,
//   });
//   console.log('Update comic status:', res.status);
//   if (res.ok) {
//     revalidatePath('/admin/comics'); // Revalidate danh sách comics
//     return { success: true };
//   } else {
//     const errorText = await res.text();
//     console.error('Update comic error:', errorText);
//     throw new Error('Failed to update comic: ' + errorText);
//   }
// }
