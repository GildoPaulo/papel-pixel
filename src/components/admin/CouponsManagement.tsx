import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, RefreshCw, Percent, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  valid_until: string;
  max_uses: number;
  times_used: number;
  min_purchase: number;
  applicable_categories: string | null;
  status: string;
  created_at: string;
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    valid_until: '',
    max_uses: '',
    min_purchase: '',
    applicable_categories: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Usuário não autenticado');
      }
      
      const user = JSON.parse(userStr);
      const token = user?.token;
      
      if (!token || token === 'undefined' || token === 'null') {
        throw new Error('Token inválido. Por favor, faça login novamente.');
      }

      const response = await fetch(`${API_URL}/coupons`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao buscar cupons');
      }
      
      const data = await response.json();
      setCoupons(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar cupons:', error);
      toast.error(error.message || 'Erro ao carregar cupons');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Usuário não autenticado');
      }
      
      const user = JSON.parse(userStr);
      const token = user?.token;
      
      if (!token || token === 'undefined' || token === 'null') {
        throw new Error('Token inválido');
      }

      const url = editingCoupon 
        ? `${API_URL}/coupons/${editingCoupon.id}`
        : `${API_URL}/coupons`;
      
      const method = editingCoupon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          type: formData.type,
          value: parseFloat(formData.value),
          valid_until: formData.valid_until,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : 0,
          applicable_categories: formData.applicable_categories || null,
          status: 'active'
        }),
      });

      if (!response.ok) throw new Error('Erro ao salvar cupom');
      
      toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom criado!');
      setShowAddDialog(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
      toast.error('Erro ao salvar cupom');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cupom?')) return;

    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('Usuário não autenticado');
      }
      
      const user = JSON.parse(userStr);
      const token = user?.token;
      
      if (!token || token === 'undefined' || token === 'null') {
        throw new Error('Token inválido');
      }

      const response = await fetch(`${API_URL}/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao excluir cupom');
      
      toast.success('Cupom excluído!');
      fetchCoupons();
    } catch (error) {
      console.error('Erro ao excluir cupom:', error);
      toast.error('Erro ao excluir cupom');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      valid_until: coupon.valid_until?.split('T')[0] || '',
      max_uses: coupon.max_uses?.toString() || '',
      min_purchase: coupon.min_purchase?.toString() || '',
      applicable_categories: coupon.applicable_categories || ''
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      valid_until: '',
      max_uses: '',
      min_purchase: '',
      applicable_categories: ''
    });
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingCoupon(null);
    resetForm();
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gerenciar Cupons de Desconto</CardTitle>
            <CardDescription>
              Crie e gerencie cupons promocionais
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchCoupons} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Percent className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Nenhum cupom cadastrado</p>
              <p className="text-sm mt-2">Clique em "Novo Cupom" para criar seu primeiro cupom de desconto</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Pedido Mín.</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-bold">
                      {coupon.code}
                    </TableCell>
                    <TableCell>
                      {coupon.type === 'percentage' && 'Percentual'}
                      {coupon.type === 'fixed' && 'Fixo'}
                      {coupon.type === 'free_shipping' && 'Frete Grátis'}
                    </TableCell>
                    <TableCell>
                      {coupon.type === 'percentage' && `${coupon.value}%`}
                      {coupon.type === 'fixed' && `${coupon.value} MZN`}
                      {coupon.type === 'free_shipping' && '-'}
                    </TableCell>
                    <TableCell>
                      {coupon.valid_until 
                        ? new Date(coupon.valid_until).toLocaleDateString('pt-PT')
                        : 'Sem limite'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {coupon.times_used}/{coupon.max_uses || '∞'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {coupon.min_purchase > 0 
                        ? `${coupon.min_purchase} MZN`
                        : 'Sem mínimo'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                        {coupon.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar Cupom */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Atualize as informações do cupom' : 'Crie um novo cupom de desconto'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Código do Cupom *</Label>
              <Input
                id="code"
                placeholder="Ex: BLACKFRIDAY50"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Desconto *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentual (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (MZN)</SelectItem>
                  <SelectItem value="free_shipping">Frete Grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type !== 'free_shipping' && (
              <div>
                <Label htmlFor="value">
                  Valor {formData.type === 'percentage' ? '(%)' : '(MZN)'} *
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={formData.type === 'percentage' ? '10' : '50'}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  min="0"
                  max={formData.type === 'percentage' ? '100' : undefined}
                />
              </div>
            )}

            <div>
              <Label htmlFor="valid_until">Data de Validade</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe em branco para cupom sem data de expiração
              </p>
            </div>

            <div>
              <Label htmlFor="max_uses">Uso Máximo</Label>
              <Input
                id="max_uses"
                type="number"
                placeholder="Ilimitado"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                min="1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe em branco para uso ilimitado
              </p>
            </div>

            <div>
              <Label htmlFor="min_purchase">Pedido Mínimo (MZN)</Label>
              <Input
                id="min_purchase"
                type="number"
                placeholder="0"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="categories">Categorias Aplicáveis</Label>
              <Input
                id="categories"
                placeholder="Ex: Livros, Papelaria (separado por vírgula)"
                value={formData.applicable_categories}
                onChange={(e) => setFormData({ ...formData, applicable_categories: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe em branco para aplicar em todas as categorias
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCoupon ? 'Salvar Alterações' : 'Criar Cupom'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

