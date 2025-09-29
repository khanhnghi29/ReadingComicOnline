// app/lib/serverActions/genreActions.ts
'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth, getServerAuthToken, isTokenExpired } from '@/app/lib/serverAuth';
import { GenreDto } from '@/app/types';

// Helper function for authenticated API calls
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getServerAuthToken();
  
  if (!token || isTokenExpired(token)) {
    throw new Error('Authentication required');
  }
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// Fetch all authors
export async function fetchGenres(): Promise<GenreDto[]> {

// Get genres without auth check for listing
    const res = await fetch('http://localhost:5244/api/Genres', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

// Add new author
export async function addGenre(formData: FormData) {
  try {
    // Verify authentication
    await requireAuth('Admin');
    
    const genreName = formData.get('name') as string;
    
    if (!genreName?.trim()) {
      throw new Error('Genre name is required');
    }
    
    const data = { genreName: genreName.trim() };
    
    const res = await fetchWithAuth('http://localhost:5244/api/Genres', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to add genre: ${res.status} ${errorText}`);
    }
    
    // Revalidate the page data and redirect
    revalidatePath('/admin/genres');
    redirect('/admin/genres');
    
  } catch (error) {
    console.error('Error adding genre:', error);
    
    // If it's a redirect, let it through
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    // For other errors, you might want to handle them differently
    throw new Error(error instanceof Error ? error.message : 'Failed to add genre');
  }
}

// Update existing genre
export async function updateGenre(formData: FormData) {
  try {
    await requireAuth('Admin');
    
    const id = formData.get('id') as string;
    const genreName = formData.get('name') as string;
    
    if (!id || !genreName?.trim()) {
      throw new Error('Genre ID and name are required');
    }
    
    const data = { genreName: genreName.trim() };
    
    const res = await fetchWithAuth(`http://localhost:5244/api/Genres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update genre: ${res.status} ${errorText}`);
    }
    
    revalidatePath('/admin/genres');
    redirect('/admin/genres');
    
  } catch (error) {
    console.error('Error updating genre:', error);
    
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to update genre');
  }
}

// Delete author
export async function deleteGenre(formData: FormData) {
  try {
    await requireAuth('Admin');
    
    const id = formData.get('id') as string;
    
    if (!id) {
      throw new Error('Genre ID is required');
    }
    
    const res = await fetchWithAuth(`http://localhost:5244/api/Genres/${id}`, { 
      method: 'DELETE' 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete genre: ${res.status} ${errorText}`);
    }
    
    revalidatePath('/admin/genres');
    redirect('/admin/genres');
    
  } catch (error) {
    console.error('Error deleting genres:', error);
    
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to delete author');
  }
}