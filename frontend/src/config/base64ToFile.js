function base64ToFile(base64Data, filename) {
    const arr = base64Data.split(',');
    const header = arr[0];
    
    let mimeType;
    let ext;
  
    if (header.includes('image/jpeg')) {
      mimeType = 'image/jpeg';
      ext = 'jpg';
    } else if (header.includes('image/png')) {
      mimeType = 'image/png';
      ext = 'png';
    } else if (header.includes('image/svg+xml')) {
      mimeType = 'image/svg+xml';
      ext = 'svg';
    } // Add more cases for other image formats
  
    if (!mimeType) {
      throw new Error('Unsupported image format');
    }
  
    const data = atob(arr[1]);
    const buffer = new Uint8Array(data.length);
  
    for (let i = 0; i < data.length; i++) {
      buffer[i] = data.charCodeAt(i);
    }
  
    return new File([buffer], `${filename}.${ext}`, { type: mimeType });
  }
export default base64ToFile;