export const apiClient = async (url: string, options?: RequestInit): Promise<any> => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData: any = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP Error ${response.status}`);
  }

  return response.json();
};
