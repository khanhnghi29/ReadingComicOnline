// 'use server';
// import { revalidatePath } from 'next/cache';

// export async function addChapterAction(formData: FormData) {
//   try {
//     const comicId = formData.get('comicId') as string;
//     const data = new FormData();
//     data.append('chapterNumber', formData.get('chapterNumber') as string);
//     data.append('chapterTitle', formData.get('chapterTitle') as string || '');

//     const images = formData.getAll('chapterImages') as File[];
//     console.log('Received chapterImages:', images.map((img) => ({ name: img.name, size: img.size, type: img.type })));
//     let totalSize = 0;
//     images.forEach((image, index) => {
//       if (image.size > 0 && image.name) {
//         data.append('Images', image); // Đổi key thành Images
//         totalSize += image.size;
//       }
//     });
//     console.log(`Total image size: ${totalSize / 1024 / 1024} MB for comicId: ${comicId}`);
//     if (images.length === 0 || totalSize === 0) {
//       console.warn('No valid images provided in FormData');
//     }

//     const res = await fetch(`http://localhost:5244/api/Comics/${comicId}/Chapters`, {
//       method: 'POST',
//       body: data,
//     });
//     console.log('Add chapter status:', res.status);
//     const responseBody = await res.text();
//     console.log('Add chapter response:', responseBody);
//     if (res.ok) {
//       revalidatePath(`/admin/comics/${comicId}/chapters`);
//       return { success: true };
//     } else {
//       console.error('Add chapter error:', responseBody);
//       throw new Error('Failed to add chapter: ' + responseBody);
//     }
//   } catch (error) {
//     console.error('Server Action error:', error);
//     throw error;
//   }
// }
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
export async function addChapterAction(formData: FormData) {
  try {
    // Verify Admin authentication
    await requireAuth('Admin');

    const comicId = formData.get('comicId') as string;
    const data = new FormData();
    data.append('chapterNumber', formData.get('chapterNumber') as string);
    data.append('chapterTitle', formData.get('chapterTitle') as string || '');

    const images = formData.getAll('chapterImages') as File[];
    console.log('Received chapterImages:', images.map((img) => ({ name: img.name, size: img.size, type: img.type })));
    let totalSize = 0;
    images.forEach((image, index) => {
      if (image.size > 0 && image.name) {
        data.append('Images', image); // Đổi key thành Images
        totalSize += image.size;
      }
    });
    console.log(`Total image size: ${totalSize / 1024 / 1024} MB for comicId: ${comicId}`);
    if (images.length === 0 || totalSize === 0) {
      console.warn('No valid images provided in FormData');
    }

    const res = await fetchWithAuth(`http://localhost:5244/api/Comics/${comicId}/Chapters`, {
      method: 'POST',
      body: data,
    });
    console.log('Add chapter status:', res.status);
    const responseBody = await res.text();
    console.log('Add chapter response:', responseBody);
    if (res.ok) {
      revalidatePath(`/admin/comics/${comicId}/chapters`);
      return { success: true };
    } else {
      console.error('Add chapter error:', responseBody);
      throw new Error('Failed to add chapter: ' + responseBody);
    }
  } catch (error) {
    console.error('Server Action error:', error);
     
    // If it's a redirect error, rethrow it
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }  
    throw new Error(error instanceof Error ? error.message : 'Failed to add a chapter');
  }
}