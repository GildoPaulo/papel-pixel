import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, ShoppingCart, DollarSign, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ABTestingReport from './ABTestingReport';

interface AbandonedCart {
  id: number;
  user_id: number | null;
  user_name: string | null;
  email: string;
  cart_items: any[];
  total: number;
  last_activity: string;
  email_sent_count: number;
  recovered: boolean;
  created_at: string;
}

interface Stats {
  total_abandoned: number;
  recovered: number;
  active: number;
  emails_sent: number;
  total_value: number;
  avg_value: number;
}

export default function AbandonedCartsAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const fetchData = async () => {
    setLoading(true);
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

      // Buscar estatísticas
      const statsResponse = await fetch(`${API_URL}/abandoned-carts/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!statsResponse.ok) {
        const errorData = await statsResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao buscar estatísticas');
      }
      
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Buscar lista de carrinhos
      const cartsResponse = await fetch(`${API_URL}/abandoned-carts/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!cartsResponse.ok) {
        const errorData = await cartsResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao buscar carrinhos');
      }
      
      const cartsData = await cartsResponse.json();
      setCarts(cartsData.carts);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error(error.message || 'Erro ao carregar dados de carrinhos abandonados');
      
      // Se erro de autenticação, limpar stats e carts
      setStats(null);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const processCartsManually = async () => {
    setProcessing(true);
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

      const response = await fetch(`${API_URL}/abandoned-carts/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao processar carrinhos');
      }
      
      const data = await response.json();
      toast.success(`${data.sent} emails enviados de ${data.total} carrinhos`);
      
      // Recarregar dados
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao processar carrinhos:', error);
      toast.error(error.message || 'Erro ao processar carrinhos abandonados');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!stats) return null;

  const recoveryRate = stats.total_abandoned > 0 
    ? ((stats.recovered / stats.total_abandoned) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Carrinhos Abandonados</h2>
          <p className="text-muted-foreground">
            Análise e recuperação de vendas perdidas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={processCartsManually} 
            disabled={processing}
            size="sm"
          >
            <Mail className="w-4 h-4 mr-2" />
            {processing ? 'Processando...' : 'Enviar Emails'}
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carrinhos Ativos
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando recuperação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recuperados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recovered}</div>
            <p className="text-xs text-muted-foreground">
              Taxa: {recoveryRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_value.toLocaleString('pt-MZ', {
                style: 'currency',
                currency: 'MZN',
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Potencial de recuperação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emails Enviados
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emails_sent}</div>
            <p className="text-xs text-muted-foreground">
              Campanhas de recuperação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pizza - Taxa de Recuperação */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Recuperação</CardTitle>
          <CardDescription>
            Comparação entre carrinhos recuperados e ativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center space-x-8">
            <div className="relative">
              <svg className="w-48 h-48" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(parseFloat(recoveryRate) / 100) * 251.2} 251.2`}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                />
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#10b981"
                >
                  {recoveryRate}%
                </text>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Recuperados: {stats.recovered}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span className="text-sm">Ativos: {stats.active}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Total: {stats.total_abandoned}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A/B Testing Report */}
      <ABTestingReport />

      {/* Lista de Carrinhos Abandonados */}
      <Card>
        <CardHeader>
          <CardTitle>Carrinhos Recentes</CardTitle>
          <CardDescription>
            Últimos 10 carrinhos abandonados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum carrinho abandonado no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {carts.slice(0, 10).map((cart) => (
                <div
                  key={cart.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {cart.user_name || 'Visitante'}
                      </p>
                      {cart.email_sent_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Mail className="w-3 h-3 mr-1" />
                          {cart.email_sent_count}x
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{cart.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {cart.cart_items.length} {cart.cart_items.length === 1 ? 'item' : 'itens'} · 
                      Última atividade: {new Date(cart.last_activity).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {cart.total.toLocaleString('pt-MZ', {
                        style: 'currency',
                        currency: 'MZN',
                      })}
                    </p>
                    <Badge
                      variant={cart.recovered ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {cart.recovered ? 'Recuperado' : 'Ativo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

