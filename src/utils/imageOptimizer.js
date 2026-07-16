export const optimizeImage = (url, width = 300) => {
  if (!url || typeof url !== 'string') return "";
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};
