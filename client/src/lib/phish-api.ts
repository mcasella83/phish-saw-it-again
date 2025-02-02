export async function getPhishShows(username: string) {
  const response = await fetch(`/api/phish/shows?username=${username}`);
  if (!response.ok) {
    throw new Error('Failed to fetch shows');
  }
  return response.json();
}