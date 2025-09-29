// app/lib/serverActions/authorActions.ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAuth, getServerAuthToken, isTokenExpired } from '@/app/lib/serverAuth';
import { AuthorDto } from '@/app/types';

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
export async function fetchAuthors(): Promise<AuthorDto[]> {
//   try {
//     // Ensure user is authenticated and has Admin role
//     await requireAuth('Admin');
    
//     const res = await fetchWithAuth('http://localhost:5244/api/Authors', { 
//       cache: 'no-store' 
//     });
    
//     if (!res.ok) {
//       throw new Error(`Failed to fetch authors: ${res.status} ${res.statusText}`);
//     }
    
//     return await res.json();
//   } catch (error) {
//     console.error('Error fetching authors:', error);
//     throw error;
//   }
    const res = await fetch('http://localhost:5244/api/Authors', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch authors');
  return res.json();
}

// Add new author
export async function addAuthor(formData: FormData) {
  try {
    // Verify authentication
    await requireAuth('Admin');
    
    const authorName = formData.get('name') as string;
    
    if (!authorName?.trim()) {
      throw new Error('Author name is required');
    }
    
    const data = { authorName: authorName.trim() };
    
    const res = await fetchWithAuth('http://localhost:5244/api/Authors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to add author: ${res.status} ${errorText}`);
    }
    
    // Revalidate the page data and redirect
    revalidatePath('/admin/authors');
    redirect('/admin/authors');
    
  } catch (error) {
    console.error('Error adding author:', error);
    
    // If it's a redirect, let it through
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    // For other errors, you might want to handle them differently
    throw new Error(error instanceof Error ? error.message : 'Failed to add author');
  }
}

// Update existing author
export async function updateAuthor(formData: FormData) {
  try {
    await requireAuth('Admin');
    
    const id = formData.get('id') as string;
    const authorName = formData.get('name') as string;
    
    if (!id || !authorName?.trim()) {
      throw new Error('Author ID and name are required');
    }
    
    const data = { authorName: authorName.trim() };
    
    const res = await fetchWithAuth(`http://localhost:5244/api/Authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update author: ${res.status} ${errorText}`);
    }
    
    revalidatePath('/admin/authors');
    redirect('/admin/authors');
    
  } catch (error) {
    console.error('Error updating author:', error);
    
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to update author');
  }
}

// Delete author
export async function deleteAuthor(formData: FormData) {
  try {
    await requireAuth('Admin');
    
    const id = formData.get('id') as string;
    
    if (!id) {
      throw new Error('Author ID is required');
    }
    
    const res = await fetchWithAuth(`http://localhost:5244/api/Authors/${id}`, { 
      method: 'DELETE' 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete author: ${res.status} ${errorText}`);
    }
    
    revalidatePath('/admin/authors');
    redirect('/admin/authors');
    
  } catch (error) {
    console.error('Error deleting author:', error);
    
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to delete author');
  }
}