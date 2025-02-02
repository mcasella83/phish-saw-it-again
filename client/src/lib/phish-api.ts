export async function getPhishShows(username: string) {
  console.log("Making API request for username:", username);
  const response = await fetch(`/api/phish/shows?username=${username}`);

  //let path = rootPath + 'attendance/username/%username%.json'
  //  path += '?order_by=%order_by%&apikey=%apikey%'

  console.log("response=", response);
  if (!response.ok) {
    throw new Error("Failed to fetch shows");
  }
  const data = await response.json();
  console.log("API response data:", data);

  if (data.error && data.error_message) {
    throw new Error("Error getting shows: ", data.error_message);
  }

  return data;
}