export const optimizeImage = (url, width = 300) => {
  if (!url || typeof url !== 'string') return "";
  if (!url.includes("cloudinary.com")) return url;

  // Handle accidental Cloudinary console thumbnail links
  if (url.includes("res-console.cloudinary.com") && url.includes("/thumbnails/v1/")) {
    try {
      const parts = url.split('/image/upload/');
      if (parts.length === 2) {
        const prefix = parts[0].replace("res-console.cloudinary.com", "res.cloudinary.com").replace("/thumbnails/v1", "");
        let rest = parts[1].split('/drilldown')[0];
        
        const restParts = rest.split('/');
        const version = restParts[0];
        const base64Id = restParts[1];
        const decodedId = atob(base64Id);
        
        // Reconstruct proper optimized URL
        return `${prefix}/image/upload/f_auto,q_auto,w_${width}/${version}/${decodedId}`;
      }
    } catch (e) {
      // Fallback if decoding fails
      return url;
    }
  }

  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto") || url.includes("/upload/w_")) return url;
  
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
