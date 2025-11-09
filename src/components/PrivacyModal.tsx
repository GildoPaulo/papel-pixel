import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyModal = ({ open, onOpenChange }: PrivacyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Política de Privacidade</DialogTitle>
          <DialogDescription>
            Protegemos seus dados pessoais com total confidencialidade
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="font-bold text-lg mb-2">1. Dados Coletados</h3>
              <p className="text-muted-foreground mb-2">
                Coletamos: nome, e-mail, telefone, endereço de entrega. Dados de pagamento são processados por parceiros seguros 
                (não armazenamos cartões completos). Dados de navegação (IP, cookies).
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">2. Uso dos Dados</h3>
              <p className="text-muted-foreground mb-2">
                Processar pedidos, enviar confirmações, e-mails de marketing (com consentimento - pode descadastrar em /unsubscribe), 
                suporte ao cliente e melhorias dos serviços.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">3. Compartilhamento</h3>
              <p className="text-muted-foreground mb-2">
                <strong>Não vendemos seus dados.</strong> Compartilhamos apenas com transportadoras (para entregas), 
                gateways de pagamento (PayPal, M-Pesa, Visa/Mastercard) e quando exigido por lei.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">4. Segurança</h3>
              <p className="text-muted-foreground mb-2">
                Criptografia (HTTPS/SSL), backups regulares, controles de acesso restritos e monitoramento contínuo 
                para prevenir acessos não autorizados.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">5. Cookies</h3>
              <p className="text-muted-foreground mb-2">
                Usamos cookies para navegação (lembrar preferências, manter login) e rastreamento de marketing 
                (análise de uso, personalização). Você pode desabilitar nas configurações do navegador.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">6. Direitos do Cliente</h3>
              <p className="text-muted-foreground mb-2">
                Você tem direito a: acessar, corrigir, excluir seus dados, oposição ao processamento, portabilidade 
                e opt-out de newsletters.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-lg mb-2">7. Contato</h3>
              <p className="text-muted-foreground mb-1">E-mail: suporte.papelepixel@outlook.com</p>
              <p className="text-muted-foreground mb-1">Telefone: +258 874383621</p>
              <p className="text-muted-foreground">Para versão completa, acesse: <a href="/privacy" className="text-primary underline">/privacy</a></p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;










