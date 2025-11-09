import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const DebugAuth = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const testToken = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        setResult({
          valid: false,
          error: 'Nenhum usuário no localStorage',
          solution: 'Faça login primeiro'
        });
        return;
      }

      const user = JSON.parse(userStr);
      const token = user?.token;

      if (!token) {
        setResult({
          valid: false,
          error: 'Token não encontrado no user object',
          user: user,
          solution: 'Limpe localStorage e faça login novamente'
        });
        return;
      }

      // Testar token via API
      const response = await fetch(`${API_URL}/debug/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        valid: false,
        error: error.message,
        solution: 'Verifique se o backend está rodando'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAndReload = () => {
    if (confirm('Isso vai limpar todo o localStorage e recarregar a página. Continuar?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🔧 Debug de Autenticação</CardTitle>
            <CardDescription>
              Use esta página para diagnosticar problemas de token
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={testToken} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar Token Atual'
                )}
              </Button>
              <Button onClick={clearAndReload} variant="destructive">
                Limpar e Recarregar
              </Button>
            </div>

            {result && (
              <div className="mt-6 space-y-4">
                {/* Status */}
                <div className={`p-4 rounded-lg border ${
                  result.valid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {result.valid ? 'Token Válido!' : 'Token Inválido'}
                    </span>
                  </div>
                  
                  {result.message && (
                    <p className="text-sm text-green-700">{result.message}</p>
                  )}
                  
                  {result.error && (
                    <p className="text-sm text-red-700 font-mono">{result.error}</p>
                  )}
                </div>

                {/* Detalhes */}
                {result.decoded && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Dados Decodificados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(result.decoded, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {result.user && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Usuário no Banco</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(result.user, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Diagnóstico */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Diagnóstico
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={result.tokenDecoded ? "default" : "secondary"}>
                        Token decodificado: {result.tokenDecoded ? '✅' : '❌'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={result.userExists ? "default" : "secondary"}>
                        Usuário existe: {result.userExists ? '✅' : '❌'}
                      </Badge>
                    </div>
                    {result.jwt_secret_ok !== undefined && (
                      <div className="flex items-center gap-2">
                        <Badge variant={result.jwt_secret_ok ? "default" : "destructive"}>
                          JWT_SECRET: {result.jwt_secret_ok ? '✅' : '❌'}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Solução */}
                {result.solution && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-blue-900 mb-1">💡 Solução:</p>
                        <p className="text-sm text-blue-800">{result.solution}</p>
                        {result.hint && (
                          <pre className="mt-2 bg-blue-100 p-2 rounded text-xs text-blue-900">
                            {result.hint}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Informações do LocalStorage */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">LocalStorage Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                  {localStorage.getItem('user') || 'Nenhum usuário no localStorage'}
                </pre>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth;



