export const optimizeImage = (url, width = 300) => {
  if (!url || typeof url !== 'string') return "";
  if (!url.includes("cloudinary.com")) return url;
  if (url.includes("/upload/f_auto") || url.includes("/upload/q_auto") || url.includes("/upload/w_")) return url;
  
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
