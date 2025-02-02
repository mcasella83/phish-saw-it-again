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
  console.log("data.error", data.error);
  console.log("data.error_message", data.error_message);

  if (data.error && data.error_message) {
    console.log("throwing error");
    throw new Error(data.error_message);
  }

  return data;
}