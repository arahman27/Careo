// retrieves all product data
export async function getProductDataById(id) {
    const res = await fetch('/api/product/getproduct?productId=' + id, {
        method: 'GET'
    });
  
    const data = await res.json();
  
    if (res.status === 200) {
      return data;
    } else {
      return {};
    }
  }