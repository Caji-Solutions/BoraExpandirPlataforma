import { supabase } from '../config/SupabaseClient'
import { prisma } from '../config/database'

// Tipo esperado para upload. Ajuste conforme integração (ex: Multer, Busboy etc.)
export interface UploadFile {
  name: string
  content: Buffer | ArrayBuffer | string
  type?: string
  size?: number
}

class DocumentsRepository {
  async saveFileToBucket(usuarioId: string, file: UploadFile) {
    const basePath = `usuarios/${usuarioId}`
    const uniqueName = `${Date.now()}_${file.name}`
    const objectPath = `${basePath}/${uniqueName}`

    const { data, error } = await supabase.storage
          .from('documentos')
          .upload(`public/${file.name}`, file.content, {
            contentType: file.type || 'application/octet-stream',
            upsert: false,
        })

      if (error) {
        throw new Error(`Erro ao salvar no bucket: ${error.message}`  )
      }

    const publicUrlData = supabase.storage.from('documentos').getPublicUrl(objectPath)

    return {
      path: data?.path || objectPath,
      publicUrl: publicUrlData.data.publicUrl,
    }
  }

  /* 
  async setUserBucketRootPath(usuarioId: string, filePath: string) {
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { bucketRootPath: filePath },
    })
    return usuario
  }
  */
}

export const documentsRepository = new DocumentsRepository()
