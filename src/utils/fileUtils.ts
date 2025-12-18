// Store uploaded files in memory for demo purposes
// In a real app, these would be stored on a server
const uploadedFiles = new Map<string, File>();

export const storeUploadedFile = (path: string, file: File): string => {
  const fileId = path.split('/').pop() || file.name;
  uploadedFiles.set(fileId, file);
  return path;
};

export const getFileUrl = (path: string): string => {
  // Extract filename from path
  const fileName = path.split('/').pop();
  
  // Check if this is an uploaded file we have in memory
  if (fileName && uploadedFiles.has(fileName)) {
    const file = uploadedFiles.get(fileName)!;
    return URL.createObjectURL(file);
  }
  
  // For mock/demo files, return a placeholder PDF
  return createMockPDF(fileName || 'document.pdf');
};

const createMockPDF = (filename: string): string => {
  // Create a simple PDF-like blob for demo purposes
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(${filename}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000120 00000 n 
0000000179 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
274
%%EOF`;

  const blob = new Blob([pdfContent], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
};

export const cleanupFileUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

export const isValidPDF = (file: File): boolean => {
  return file.type === 'application/pdf';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};