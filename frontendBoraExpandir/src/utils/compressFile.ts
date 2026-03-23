/**
 * Comprime um arquivo usando a API de compressão
 * @param file - Arquivo original a ser comprimido
 * @returns Arquivo comprimido como File
 */
export async function compressFile(file: File): Promise<File> {
  console.log(`[Compressao] Iniciando compressao de: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/api/compress', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    console.error('[Compressao] Erro na API de compressao');
    throw new Error('Falha ao comprimir arquivo');
  }

  const blob = await response.blob();
  const compressedFile = new File([blob], file.name, { type: blob.type || file.type });
  
  console.log(`[Compressao] Concluido: ${compressedFile.name} (${(compressedFile.size / 1024).toFixed(2)} KB)`);
  
  // Retorna como File mantendo o nome original
  return compressedFile;
}
