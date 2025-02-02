export async function getPhishShows() {
  const response = await fetch(`/api/phish/shows`);
  if (!response.ok) {
    throw new Error('Failed to fetch shows');
  }
  return response.json();
}
