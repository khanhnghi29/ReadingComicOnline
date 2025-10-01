'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth, getServerAuthToken, isTokenExpired } from '@/app/lib/serverAuth';

// Helper function for authenticated API calls
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getServerAuthToken();
  
  if (!token || isTokenExpired(token)) {
    throw new Error('Authentication required');
  }
  
  // For FormData, don't set Content-Type header (browser will set it with boundary)
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
export async function deleteComic(formData: FormData){
    try{
    // Verify Admin authentication
    await requireAuth('Admin');
    const id = formData.get('id') as string;
    const res = await fetchWithAuth(`http://localhost:5244/api/Comics/${id}`,{ method: 'DELETE' });
        if (res.ok) {
        revalidatePath('/admin/comics');
        } else {
        throw new Error('Failed to delete comic');
        }
    } catch (error) {
        console.error('Error deleting comic:', error);
    
        if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
        throw error;
        }
        
        throw new Error(error instanceof Error ? error.message : 'Failed to delete comic');
    }
   
}
export async function deleteChapter(formData: FormData){
    try{
    // Verify Admin authentication  
    await requireAuth('Admin');
    const chapterId = formData.get('chapterId') as string;
    const comicId = formData.get('comicId') as string;
    const res = await fetchWithAuth('http://localhost:5244/api/Comics/' + comicId + '/Chapters/' + chapterId, { method: 'DELETE' });
    console.log('Delete chapter status:', res.status);
    if (res.ok) {
    revalidatePath('/admin/comics/' + comicId + '/chapters');
    } else {
    const errorText = await res.text();
    console.error('Delete chapter error:', errorText);
    throw new Error('Failed to delete chapter: ' + errorText);
    }
    } catch (error) {
        console.error('Error deleting chapter:', error);
    
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to delete chapter');
    }
}