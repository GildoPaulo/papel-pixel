import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "URL da Imagem" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 5MB)');
      return;
    }

    setIsUploading(true);

    try {
      // Fazer upload real para o servidor
      const formData = new FormData();
      formData.append('image', file);

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
      
      // Usar URL retornada pelo servidor (prioridade: imageUrl > url > fullUrl)
      let imageUrl = data.imageUrl || data.url || data.fullUrl || `/uploads/products/${data.filename}`;
      
      // Garantir que comece com /uploads se for relativa
      if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/uploads')) {
        imageUrl = `/uploads/products/${data.filename}`;
      }
      
      console.log('✅ [IMAGE UPLOAD] URL retornada:', imageUrl);
      onChange(imageUrl);
      toast.success('Imagem carregada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Erro ao carregar imagem');
      
      // Fallback para base64 se upload falhar
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          onChange(base64);
          toast.info('Imagem salva localmente (use URL para melhor performance)');
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    toast.success('Imagem removida');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('image-upload-input')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Preview da imagem */}
      {value && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-input">
          <img 
            src={(() => {
              // Se é base64 muito longo, não tentar carregar
              if (value.startsWith('data:image') && value.length > 50000) {
                console.warn('⚠️ [IMAGE UPLOAD] Base64 muito longo, usando placeholder');
                return '/placeholder-image.png'; // Ou um placeholder
              }
              
              // URL relativa
              if (value.startsWith('/uploads')) {
                return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${value}`;
              }
              
              // Base64 ou URL completa
              return value;
            })()} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('❌ [IMAGE UPLOAD] Erro ao carregar imagem');
              // Usar placeholder em caso de erro
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW0gbsOjbyBkaXNwb27DrXZlbDwvdGV4dD48L3N2Zz4=';
            }}
          />
        </div>
      )}

      {/* URL manual */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          💡 Cole uma URL de imagem de alta qualidade abaixo:
        </Label>
        <input
          type="url"
          placeholder="https://exemplo.com/imagem-produto.jpg"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground">
          Para atualizar fotos dos produtos, cole URLs de imagens profissionais ou faça upload de uma imagem.
        </p>
      </div>
    </div>
  );
}

export function MultipleImageUpload({ 
  value = [], 
  onChange 
}: { 
  value: string[]; 
  onChange: (images: string[]) => void;
}) {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar limite de imagens
    const maxImages = 10;
    if (value.length >= maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const newImages: string[] = [];
    const uploadPromises: Promise<void>[] = [];

    for (const file of Array.from(files)) {
      // Verificar se atingiu o limite antes de processar mais arquivos
      if (value.length + newImages.length >= maxImages) {
        toast.error(`Máximo de ${maxImages} imagens permitidas`);
        break;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Apenas imagens são permitidas');
        continue;
      }

      // Validar tamanho
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande (máximo 5MB)');
        continue;
      }

      // Fazer upload real
      const uploadPromise = (async () => {
        try {
          const formData = new FormData();
          formData.append('image', file);

          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: token ? {
              'Authorization': `Bearer ${token}`
            } : {},
            body: formData
          });

          if (response.ok) {
            const data = await response.json();
            const imageUrl = data.imageUrl || data.url || `/uploads/products/${data.filename}`;
            newImages.push(imageUrl);
          } else {
            // Fallback para base64 se upload falhar
            const base64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string);
              };
              reader.onerror = () => resolve('');
              reader.readAsDataURL(file);
            });
            if (base64) newImages.push(base64);
          }
        } catch (error) {
          // Fallback para base64
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
          if (base64) newImages.push(base64);
        }
      })();

      uploadPromises.push(uploadPromise);
    }

    await Promise.all(uploadPromises);
    
    if (newImages.length > 0) {
      onChange([...value, ...newImages]);
      toast.success(`${newImages.length} imagem(ns) adicionada(s)!`);
    }
  };

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Imagem removida');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Imagens do Produto</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('multiple-image-upload')?.click()}
          disabled={value.length >= 10}
        >
          <Upload className="h-4 w-4 mr-2" />
          Adicionar Imagens ({value.length}/10)
        </Button>
      </div>

      <input
        id="multiple-image-upload"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileUpload(e);
          // Reset input para permitir selecionar o mesmo arquivo novamente
          e.target.value = '';
        }}
      />

      {/* Galeria de imagens */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <img 
                src={image} 
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



