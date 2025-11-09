import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// Uncomment when you have Brevo API key:
// import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribed: boolean;
  createdAt: Date;
  tags: string[];
}

interface Campaign {
  id: string;
  title: string;
  content: string;
  status: "draft" | "scheduled" | "sent";
  sendDate: Date;
  subscribers: number;
  bannerUrl?: string;
  couponCode?: string;
  couponText?: string;
  ctaLabel?: string;
  destinationUrl?: string;
}

interface EmailMarketingContextType {
  subscribers: Subscriber[];
  campaigns: Campaign[];
  addSubscriber: (email: string, name: string) => void;
  sendPromotion: (campaign: Campaign) => void;
  sendToAll: (title: string, message: string, bannerUrl?: string, couponCode?: string, couponText?: string, ctaLabel?: string, destinationUrl?: string) => void;
  deleteCampaign: (campaignId: string) => Promise<{ success: boolean; error?: string }>;
}

const EmailMarketingContext = createContext<EmailMarketingContextType | undefined>(undefined);

export function EmailMarketingProvider({ children }: { children: ReactNode }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Carregar do backend se for admin
    const loadFromBackend = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Se não logado, carregar apenas do localStorage
        const savedSubscribers = localStorage.getItem("emailSubscribers");
        if (savedSubscribers) {
          setSubscribers(JSON.parse(savedSubscribers));
        }
        return;
      }
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        // Carregar subscribers do backend
        const subscribersRes = await fetch(`${API_URL}/subscribers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (subscribersRes.ok) {
          const subscribersData = await subscribersRes.json();
          if (subscribersData.success) {
            const mappedSubscribers: Subscriber[] = subscribersData.subscribers.map((s: any) => ({
              id: s.id.toString(),
              email: s.email,
              name: s.name || 'Subscriber',
              subscribed: true,
              createdAt: new Date(s.subscribed_at),
              tags: ["newsletter"]
            }));
            setSubscribers(mappedSubscribers);
            localStorage.setItem("emailSubscribers", JSON.stringify(mappedSubscribers));
          }
        }
        
        // Carregar campanhas do backend
        const campaignsRes = await fetch(`${API_URL}/campaigns`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json();
          if (campaignsData.success) {
            const mappedCampaigns: Campaign[] = campaignsData.campaigns.map((c: any) => ({
              id: c.id.toString(),
              title: c.title,
              content: c.content,
              status: c.status === 'sent' ? 'sent' : 'draft',
              sendDate: new Date(c.send_date || c.created_at),
              subscribers: c.subscribers_count || 0,
              bannerUrl: c.banner_url || undefined,
              couponCode: c.coupon_code || undefined,
              couponText: c.coupon_text || undefined,
              ctaLabel: c.cta_label || undefined,
              destinationUrl: c.destination_url || undefined
            }));
            setCampaigns(mappedCampaigns);
            localStorage.setItem("emailCampaigns", JSON.stringify(mappedCampaigns));
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar do backend, usando localStorage:', error);
        // Fallback para localStorage
        const savedSubscribers = localStorage.getItem("emailSubscribers");
        const savedCampaigns = localStorage.getItem("emailCampaigns");
        
        if (savedSubscribers) {
          setSubscribers(JSON.parse(savedSubscribers));
        }
        
        if (savedCampaigns) {
          setCampaigns(JSON.parse(savedCampaigns));
        }
      }
    };
    
    loadFromBackend();
  }, []);

  const addSubscriber = async (email: string, name: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Atualizar estado local
        const newSubscriber: Subscriber = {
          id: data.subscriber.id.toString(),
          email: data.subscriber.email,
          name: data.subscriber.name || name,
          subscribed: true,
          createdAt: new Date(data.subscriber.subscribed_at),
          tags: ["newsletter"]
        };
        
        const updated = [...subscribers, newSubscriber];
        setSubscribers(updated);
        localStorage.setItem("emailSubscribers", JSON.stringify(updated));
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao inscrever:', error);
      // Fallback para localStorage se backend falhar
      const newSubscriber: Subscriber = {
        id: Date.now().toString(),
        email,
        name,
        subscribed: true,
        createdAt: new Date(),
        tags: ["newsletter"]
      };
      
      const updated = [...subscribers, newSubscriber];
      setSubscribers(updated);
      localStorage.setItem("emailSubscribers", JSON.stringify(updated));
      
      return { success: true, message: 'Inscrito localmente (backend offline)' };
    }
  };

  const sendPromotion = async (campaign: Campaign) => {
    // TODO: Uncomment when you have Brevo API key from https://app.brevo.com/
    
    // const transactionEmailsApi = new TransactionalEmailsApi();
    // Set your API key here: (Get from https://app.brevo.com/settings/keys/api)
    // transactionEmailsApi.setApiKey(0, 'YOUR_BREVO_API_KEY_HERE');
    
    // For now, showing mock notification
    console.log(`📧 Sending promotion "${campaign.title}" to ${campaign.subscribers} subscribers`);
    
    // Uncomment when ready to send real emails:
    /*
    for (const subscriber of subscribers) {
      try {
        const sendSmtpEmail: SendSmtpEmail = {
          to: [{ email: subscriber.email, name: subscriber.name }],
          subject: campaign.title,
          htmlContent: campaign.content,
          sender: { email: 'sua-loja@exemplo.com', name: 'Papel & Pixel' }
        };
        
        await transactionEmailsApi.sendTransacEmail(sendSmtpEmail);
      } catch (error) {
        console.error(`Error sending to ${subscriber.email}:`, error);
      }
    }
    */
    
    alert(`📧 Promoção "${campaign.title}" enviada para ${subscribers.length} assinantes!`);
    
    setCampaigns([...campaigns, campaign]);
    localStorage.setItem("emailCampaigns", JSON.stringify([...campaigns, campaign]));
  };

  const sendToAll = async (
    title: string, 
    message: string,
    bannerUrl?: string,
    couponCode?: string,
    couponText?: string,
    ctaLabel?: string,
    destinationUrl?: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const body: any = { title, content: message };
      if (bannerUrl) body.bannerUrl = bannerUrl;
      if (couponCode) body.couponCode = couponCode;
      if (couponText) body.couponText = couponText;
      if (ctaLabel) body.ctaLabel = ctaLabel;
      if (destinationUrl) body.destinationUrl = destinationUrl;
      
      const response = await fetch(`${API_URL}/marketing/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (data.success) {
        const campaign: Campaign = {
          id: data.campaignId.toString(),
          title,
          content: message,
          status: "sent",
          sendDate: new Date(),
          subscribers: data.stats.total
        };
        
        setCampaigns([...campaigns, campaign]);
        localStorage.setItem("emailCampaigns", JSON.stringify([...campaigns, campaign]));
        
        return { success: true, stats: data.stats };
      }
      
      return { success: false, error: data.error };
    } catch (error: any) {
      console.error('Erro ao enviar promoção:', error);
      
      // Fallback: apenas atualizar localmente
      if (subscribers.length === 0) {
        return { success: false, error: "Nenhum assinante para enviar!" };
      }

      const campaign: Campaign = {
        id: Date.now().toString(),
        title,
        content: message,
        status: "sent",
        sendDate: new Date(),
        subscribers: subscribers.length
      };

      setCampaigns([...campaigns, campaign]);
      localStorage.setItem("emailCampaigns", JSON.stringify([...campaigns, campaign]));
      
      return { success: true, message: 'Campanha salva localmente (backend offline)' };
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remover da lista local
        const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
        setCampaigns(updatedCampaigns);
        localStorage.setItem("emailCampaigns", JSON.stringify(updatedCampaigns));
        
        return { success: true };
      }
      
      return { success: false, error: data.error || 'Erro ao deletar campanha' };
    } catch (error: any) {
      console.error('Erro ao deletar campanha:', error);
      
      // Fallback: remover apenas localmente
      const updatedCampaigns = campaigns.filter(c => c.id !== campaignId);
      setCampaigns(updatedCampaigns);
      localStorage.setItem("emailCampaigns", JSON.stringify(updatedCampaigns));
      
      return { success: true, message: 'Campanha removida localmente (backend offline)' };
    }
  };

  return (
    <EmailMarketingContext.Provider
      value={{
        subscribers,
        campaigns,
        addSubscriber,
        sendPromotion,
        sendToAll,
        deleteCampaign
      }}
    >
      {children}
    </EmailMarketingContext.Provider>
  );
}

export function useEmailMarketing() {
  const context = useContext(EmailMarketingContext);
  if (context === undefined) {
    throw new Error("useEmailMarketing must be used within EmailMarketingProvider");
  }
  return context;
}

