require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

class SupabaseStorage {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.bucketName = process.env.SUPABASE_BUCKET || 'broker-booster';
  }

  /**
   * Faz o upload de um arquivo para o Supabase Storage
   * @param {Buffer} fileBuffer - O conteúdo do arquivo em formato Buffer
   * @param {String} fileName - O nome do arquivo no bucket
   * @param {String} filePath - O caminho dentro do bucket (ex: "avatars/")
   * @returns {Promise<Object>} - Resposta do Supabase com dados do upload
   */
  async uploadFile(fileBuffer, fileName, filePath = '') {
    try {
      const fullPath = filePath ? `${filePath}/${fileName}` : fileName;
      
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(fullPath, fileBuffer, {
          upsert: true,
          contentType: this._getContentType(fileName)
        });
      
      if (error) {
        throw error;
      }
      
      return {
        path: data.path,
        fullUrl: this._getPublicUrl(data.path),
        success: true
      };
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      return {
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Remove um arquivo do Supabase Storage
   * @param {String} filePath - O caminho completo do arquivo no bucket
   * @returns {Promise<Object>} - Resposta com status da operação
   */
  async deleteFile(filePath) {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        message: 'Arquivo removido com sucesso'
      };
    } catch (error) {
      console.error('Erro ao remover arquivo:', error);
      return {
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Obtém a URL pública de um arquivo no Storage
   * @param {String} filePath - O caminho do arquivo no bucket
   * @returns {String} - URL pública do arquivo
   */
  _getPublicUrl(filePath) {
    const { data } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * Determina o tipo de conteúdo baseado na extensão do arquivo
   * @param {String} fileName - Nome do arquivo com extensão
   * @returns {String} - Content-Type apropriado
   */
  _getContentType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const contentTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    
    return contentTypes[extension] || 'application/octet-stream';
  }
}

module.exports = SupabaseStorage; 