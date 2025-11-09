# 📸 Implementar Múltiplas Fotos - Supabase Storage

## 🎯 O Que Vamos Fazer

1. ✅ Criar bucket de Storage no Supabase
2. ✅ Adicionar campo `images` (array) na tabela products
3. ✅ Interface de upload de múltiplas fotos
4. ✅ Galeria de fotos na página de detalhes
5. ✅ Sistema de avaliações

## 📋 Passo 1: Criar Bucket no Supabase

### No Dashboard do Supabase:

1. Vá em **Storage**
2. Clique em **Create bucket**
3. Nome: `product-images`
4. Público: ✅ Marque esta opção
5. Clique em **Create bucket**

### Configurar Política RLS:

Execute este SQL no SQL Editor:

```sql
-- Política para permitir leitura pública
CREATE POLICY "Product images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Política para permitir upload (apenas autenticados)
CREATE POLICY "Users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir deleção (apenas autenticados)
CREATE POLICY "Users can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

## 📋 Passo 2: Atualizar Tabela Products

Execute este SQL para adicionar campo de múltiplas imagens:

```sql
-- Adicionar campo images (array de URLs)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;

-- Verificar
SELECT id, name, image, images, specifications FROM products LIMIT 1;
```

## 📋 Passo 3: Criar Componente de Upload

Arquivo: `src/components/ProductImageUpload.tsx`

```typescript
import { useState } from 'react';
import { supabase } from '@/config/supabase';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  productId?: string;
  onImagesChange: (images: string[]) => void;
}

export function ProductImageUpload({ productId, onImagesChange }: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

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
        const filePath = productId 
          ? `${productId}/${fileName}` 
          : `temp/${fileName}`;

        // Upload para Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return publicUrl;
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
          disabled={uploading}
        >
          <Upload className="h-4 w4 mr-2" />
          {uploading ? 'Carregando...' : 'Adicionar Fotos'}
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
```

## 📋 Passo 4: Atualizar Admin para Múltiplas Fotos

No arquivo `src/pages/Admin.tsx`, adicione o campo de imagens.

## 📋 Passo 5: Criar Tabela de Avaliações

```sql
-- Criar tabela de avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- RLS Policy
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
ON reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can insert reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

## ✅ Próximos Passos

1. Execute os SQLs acima no Supabase
2. Crie o componente `ProductImageUpload.tsx`
3. Integre no Admin para adicionar múltiplas fotos
4. A galeria já funciona na página de detalhes!

## 🎉 Vantagens do Supabase Storage

- ✅ **Alta qualidade** - Aceita até 5MB por imagem
- ✅ **CDN global** - Imagens carregam rapidamente
- ✅ **Público ou privado** - Controle total
- ✅ **De graça** - Free tier generoso
- ✅ **Fácil integração** - API simples

**NÃO precisa procurar outra base de dados!** O Supabase é perfeito para isso.

