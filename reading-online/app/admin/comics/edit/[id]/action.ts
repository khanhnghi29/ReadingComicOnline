'use server';

import { revalidatePath } from 'next/cache';

export async function updateComicAction(formData: FormData) {
  const id = formData.get('id') as string;
  const data = new FormData();
  data.append('title', formData.get('title') as string);
  data.append('comicDescription', formData.get('description') as string || '');
  const image = formData.get('image') as File;
  if (image?.size > 0) data.append('comicImage', image);
  data.append('authorId', formData.get('authorId') as string);
  const genreIds = formData.getAll('genreIds').map(String);
  genreIds.forEach((id) => data.append('genreIds', id));
  data.append('price', formData.get('price') as string || '0');

  const res = await fetch(`http://localhost:5244/api/Comics/${id}`, {
    method: 'PUT',
    body: data,
  });
  console.log('Update comic status:', res.status);
  if (res.ok) {
    revalidatePath('/admin/comics'); // Revalidate danh sách comics
    return { success: true };
  } else {
    const errorText = await res.text();
    console.error('Update comic error:', errorText);
    throw new Error('Failed to update comic: ' + errorText);
  }
}