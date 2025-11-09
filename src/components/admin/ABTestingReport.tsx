import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Award, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Variant {
  variant_id: number;
  variant_label: string;
  variant_type: string;
  variant_value: number;
  emails_sent: number;
  coupons_used: number;
  conversions: number;
  conversion_rate: number;
  total_revenue: number;
  avg_order_value: number;
  is_active: boolean;
}

export default function ABTestingReport() {
  const [report, setReport] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const fetchReport = async () => {
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

      const response = await fetch(`${API_URL}/ab-testing/report`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao buscar relatório');
      }
      
      const data = await response.json();
      setReport(data.report || []);
    } catch (error: any) {
      console.error('Erro ao carregar relatório A/B:', error);
      toast.error(error.message || 'Erro ao carregar relatório de A/B Testing');
      setReport([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Tem certeza que deseja reiniciar o experimento? Todos os dados serão perdidos.')) {
      return;
    }

    setResetting(true);
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

      const response = await fetch(`${API_URL}/ab-testing/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao reiniciar experimento');
      }
      
      toast.success('Experimento reiniciado com sucesso');
      await fetchReport();
    } catch (error: any) {
      console.error('Erro ao reiniciar experimento:', error);
      toast.error(error.message || 'Erro ao reiniciar experimento');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  // Encontrar a melhor variante
  const bestVariant = report.length > 0 ? report[0] : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>A/B Testing - Cupons de Recuperação</CardTitle>
          <CardDescription>
            Teste automático de diferentes ofertas para maximizar conversão
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReport} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleReset} 
            disabled={resetting}
            variant="destructive"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {resetting ? 'Reiniciando...' : 'Reiniciar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {report.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum dado de teste ainda. Aguarde emails serem enviados.</p>
          </div>
        ) : (
          <>
            {/* Vencedor Atual */}
            {bestVariant && bestVariant.emails_sent > 10 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">
                    Melhor Performer
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {bestVariant.variant_label}
                    </div>
                    <div className="text-sm text-green-700">
                      Taxa de conversão: {parseFloat(bestVariant.conversion_rate || 0).toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-900">
                      {parseFloat(bestVariant.total_revenue || 0).toLocaleString('pt-MZ', {
                        style: 'currency',
                        currency: 'MZN',
                      })}
                    </div>
                    <div className="text-sm text-green-700">
                      receita gerada
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de Resultados */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variante</TableHead>
                  <TableHead className="text-right">Emails</TableHead>
                  <TableHead className="text-right">Cupons Usados</TableHead>
                  <TableHead className="text-right">Conversões</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((variant, index) => (
                  <TableRow key={variant.variant_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index === 0 && variant.emails_sent > 10 && (
                          <Award className="w-4 h-4 text-yellow-500" />
                        )}
                        <span>{variant.variant_label}</span>
                        {!variant.is_active && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{variant.emails_sent}</TableCell>
                    <TableCell className="text-right">{variant.coupons_used}</TableCell>
                    <TableCell className="text-right">{variant.conversions}</TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant={parseFloat(variant.conversion_rate || 0) > 5 ? "default" : "secondary"}
                        className={parseFloat(variant.conversion_rate || 0) > 5 ? "bg-green-600" : ""}
                      >
                        {parseFloat(variant.conversion_rate || 0).toFixed(2)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(variant.total_revenue || 0).toLocaleString('pt-MZ', {
                        style: 'currency',
                        currency: 'MZN',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {variant.avg_order_value 
                        ? parseFloat(variant.avg_order_value).toLocaleString('pt-MZ', {
                            style: 'currency',
                            currency: 'MZN',
                          })
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Explicação */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Como funciona:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>O sistema testa automaticamente diferentes ofertas de cupons</li>
                    <li>80% dos emails usam a melhor variante, 20% testam outras</li>
                    <li>A taxa de conversão é calculada automaticamente</li>
                    <li>Recomendado: aguardar pelo menos 50 emails enviados antes de concluir</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

