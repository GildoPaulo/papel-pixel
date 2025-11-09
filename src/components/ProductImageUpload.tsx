import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  productId?: string;
  initialImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ProductImageUpload({ 
  productId,
  initialImages = [],
  onImagesChange,
  maxImages = 10
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>(initialImages);

  // Sincronizar uploadedImages com initialImages quando mudarem externamente
  useEffect(() => {
    setUploadedImages(initialImages);
  }, [initialImages]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Verificar limite de imagens
    if (uploadedImages.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          throw new Error('Apenas imagens são permitidas');
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Imagem muito grande (máximo 5MB)');
        }

        // Gerar nome único
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Criar FormData para upload
        const formData = new FormData();
        formData.append('image', file);
        if (productId) {
          formData.append('productId', productId);
        }

        // Upload para backend MySQL
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {},
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Erro ao fazer upload' }));
          throw new Error(errorData.error || 'Erro ao fazer upload da imagem');
        }

        const data = await response.json();
        
        // Retornar URL da imagem (pode ser URL relativa ou absoluta)
        return data.url || data.imageUrl || `/uploads/${data.filename}`;
      });

      const urls = await Promise.all(uploadPromises);
      const newImages = [...uploadedImages, ...urls];
      
      setUploadedImages(newImages);
      onImagesChange(newImages);
      
      toast.success(`${urls.length} imagem(ns) carregada(s) com sucesso!`);
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Erro ao carregar imagens');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesChange(newImages);
    toast.success('Imagem removida');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Fotos do Produto</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || uploadedImages.length >= maxImages}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Fotos ({uploadedImages.length}/{maxImages})
            </>
          )}
        </Button>
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />

      {/* Galeria de miniaturas */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma imagem carregada. Clique em "Adicionar Fotos".
          </p>
        </div>
      )}
    </div>
  );
}

