import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsModal = ({ open, onOpenChange }: TermsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Termos e Condições</DialogTitle>
          <DialogDescription>
            Leia atentamente os termos e condições de uso da Papel & Pixel Store
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-bold text-lg mb-2">1. Informações da Empresa</h3>
              <p className="text-muted-foreground mb-2"><strong>Papel & Pixel Store</strong></p>
              <p className="text-muted-foreground mb-2">Cidade da Beira, Moçambique</p>
              <p className="text-muted-foreground mb-1">E-mail: suporte.papelepixel@outlook.com</p>
              <p className="text-muted-foreground mb-1">Telefone: +258 874383621</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. Cadastro de Usuário</h3>
              <p className="text-muted-foreground mb-2">
                Você é responsável por manter a confidencialidade de sua senha e por todas as atividades em sua conta. 
                Dados obrigatórios: nome, e-mail, telefone, endereço e senha segura.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. Compra e Pagamento</h3>
              <p className="text-muted-foreground mb-2">
                Aceitamos: PayPal, M-Pesa, Visa/Mastercard, Transferência Bancária e Dinheiro na Entrega. 
                Preços em MZN podem ser alterados sem aviso prévio.
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Produtos Digitais:</strong> Download imediato após pagamento. 
                <strong>Produtos Físicos:</strong> Envio via transportadora.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. Entrega e Rastreamento</h3>
              <p className="text-muted-foreground mb-2">
                <strong>Produtos Físicos:</strong> 15-20 dias úteis. Código de rastreamento automático (PX-AAAAMMDD-XXXXXX) 
                enviado por e-mail quando marcado como "Enviado".
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Produtos Digitais:</strong> Disponível imediatamente em "Meus Pedidos".
              </p>
              <p className="text-muted-foreground">Frete grátis para compras acima de 500 MZN.</p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. Cancelamento e Reembolso</h3>
              <p className="text-muted-foreground mb-2">
                Pedidos podem ser cancelados antes do envio. Produtos digitais: cancelamento em até 7 dias, exceto casos específicos. 
                Reembolsos no mesmo método de pagamento (5-10 dias úteis).
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. Responsabilidade</h3>
              <p className="text-muted-foreground mb-2">
                A loja garante qualidade dos produtos e processamento seguro. O cliente é responsável por fornecer dados verdadeiros 
                e manter a segurança de sua conta.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. Modificações</h3>
              <p className="text-muted-foreground mb-2">
                Reservamo-nos o direito de atualizar estes termos a qualquer momento. Ao continuar usando o site após alterações, 
                você concorda com os novos termos.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">8. Contato</h3>
              <p className="text-muted-foreground mb-1">E-mail: suporte.papelepixel@outlook.com</p>
              <p className="text-muted-foreground mb-1">Telefone: +258 874383621</p>
              <p className="text-muted-foreground">Para versão completa, acesse: <a href="/terms" className="text-primary underline">/terms</a></p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;










