export async function addSavedLists(productlist) {
  const res = await fetch('/api/recommendations/addsavedlist', {
    method: 'POST',
    body: JSON.stringify({ 'productlist': productlist }),
    headers: {
      'content-type': 'application/json',
    },
  });

  if (res.status === 200) {
    return true;
  } else {
    return false;
  }
}
