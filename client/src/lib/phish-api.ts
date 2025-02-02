export async function getPhishShows(username: string) {
  const response = await fetch(
    `/api/phish/shows?username=${username}`,
  );
  console.log("response=", response);
  if (!response.ok) {
    throw new Error("Failed to fetch shows");
  }
  return response.json();
}