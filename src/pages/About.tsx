import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import TeamMemberModal from "@/components/TeamMemberModal";
import { Users, Target, Heart, Eye, Clock, Award, MapPin, Mail, Phone, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  achievements?: string[];
  skills?: string[];
}

const About = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const team: TeamMember[] = [
    {
      name: "Gildo Paulo Correia Victor",
      role: "CEO / Fundador",
      bio: "Diretor Executivo e Fundador da Papel & Pixel Lda. Estudante de Engenharia Informática na Universidade Zambeze. Responsável pela visão estratégica e o posicionamento da empresa, supervisionando o desenvolvimento de novos produtos, gerindo parcerias institucionais e coordenando a equipa.",
      email: "gildo@papelpixel.co.mz",
      phone: "+258 850411768",
      location: "Beira, Moçambique",
      experience: "CEO e Fundador da Papel & Pixel Lda.\nLiderança de projetos tecnológicos e gestão de equipas multidisciplinares\nExperiência em desenvolvimento de estratégias de mercado e inovação tecnológica",
      education: "Estudante de Engenharia Informática - Universidade Zambeze\nFormação em Gestão e Liderança de Equipas",
      achievements: [
        "Fundou a Papel & Pixel Lda. em 2024",
        "Desenvolveu a visão estratégica e posicionamento da empresa",
        "Estabeleceu parcerias institucionais estratégicas"
      ],
      skills: ["Liderança", "Estratégia", "Gestão", "Empreendedorismo", "Inovação Tecnológica"]
    },
    {
      name: "Crimilda Marcos Manuel",
      role: "CMO / Marketing e Vendas",
      bio: "Diretora de Marketing e Comunicação da Papel & Pixel Lda. Estudante de Engenharia Informática na Universidade Zambeze. Responsável por desenvolver campanhas de marketing digital, gerir a comunicação institucional e implementar estratégias de vendas e fidelização.",
      email: "crimilda@papelpixel.co.mz",
      phone: "+258 850411771",
      location: "Beira, Moçambique",
      experience: "CMO na Papel & Pixel Lda.\nSólida experiência em publicidade digital e marketing de conteúdo\nEspecialista em análise de métricas de desempenho e engajamento",
      education: "Estudante de Engenharia Informática - Universidade Zambeze\nFormação em Marketing Digital e Comunicação",
      achievements: [
        "Fortalecimento da imagem da Papel & Pixel no mercado",
        "Aumento da visibilidade e confiança dos clientes",
        "Implementação de estratégias de crescimento orgânico"
      ],
      skills: ["Marketing Digital", "Publicidade", "Redes Sociais", "Comunicação", "Vendas"]
    },
    {
      name: "Armando da Maria Mendes",
      role: "CTO / Desenvolvimento",
      bio: "Diretor Técnico e Desenvolvimento de Sistemas na Papel & Pixel Lda. Estudante de Engenharia Informática na Universidade Zambeze. Especialista em programação web e bases de dados, responsável por manter o sistema estável, seguro e escalável.",
      email: "armando@papelpixel.co.mz",
      phone: "+258 850411769",
      location: "Beira, Moçambique",
      experience: "CTO na Papel & Pixel Lda.\nEspecialista em Python/Django, HTML, CSS, JavaScript\nSupervisão do desenvolvimento técnico do e-commerce",
      education: "Estudante de Engenharia Informática - Universidade Zambeze\nEspecialização em Desenvolvimento Web e Bases de Dados",
      achievements: [
        "Desenvolveu e implementou a plataforma e-commerce",
        "Garantiu integração com gateways de pagamento",
        "Assegurou segurança e desempenho da plataforma"
      ],
      skills: ["Python/Django", "HTML/CSS/JavaScript", "Bases de Dados", "Segurança", "Desenvolvimento Web"]
    },
    {
      name: "Ozley Bata",
      role: "Diretor de Operações e Logística",
      bio: "Coordenador de Operações e Logística na Papel & Pixel Lda. Estudante de Engenharia Informática na Universidade Zambeze. Responsável por gerir stock e inventário, supervisionar armazenamento e envio, e garantir qualidade e pontualidade nas operações.",
      email: "ozley@papelpixel.co.mz",
      phone: "+258 850411770",
      location: "Beira, Moçambique",
      experience: "Diretor de Operações e Logística na Papel & Pixel Lda.\nCoordenação de fornecedores e transportadoras\nGestão de inventário e controle de stock",
      education: "Estudante de Engenharia Informática - Universidade Zambeze\nFormação em Gestão de Operações e Logística",
      achievements: [
        "Organização eficiente do processo logístico",
        "Garantia de qualidade e pontualidade nas entregas",
        "Otimização de controle de stock"
      ],
      skills: ["Logística", "Operações", "Gestão de Estoque", "Fornecedores", "Controle de Qualidade"]
    }
  ];

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-white py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Sobre a Papel & Pixel
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Conheça nossa história, valores e equipe comprometida em oferecer o melhor para você
            </p>
          </div>
        </section>

        <div className="container py-12 space-y-16">
          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-heading font-bold">Missão</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Oferecer produtos de qualidade e conteúdo educativo e criativo, proporcionando acesso fácil e acessível a materiais de papelaria, livros e revistas para incentivar a leitura e a criatividade em Moçambique.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-8 w-8 text-secondary" />
                  <h2 className="text-2xl font-heading font-bold">Visão</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Ser referência em inovação e confiabilidade no comércio digital, tornando-nos a maior e mais confiável loja online de produtos educativos, criativos e de escritório em Moçambique.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-8 w-8 text-accent" />
                  <h2 className="text-2xl font-heading font-bold">Valores</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Transparência, confiança e qualidade. Comprometemo-nos com a ética, transparência e o compromisso com o cliente em todas as nossas operações.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          <section className="bg-card p-8 rounded-2xl border">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-heading font-bold">Nossa História</h2>
            </div>
            <div className="space-y-4 text-muted-foreground">
              <p className="leading-relaxed">
                A Papel & Pixel Store nasceu da paixão por educação e criatividade. Fundada na Cidade da Beira, Moçambique, 
                nossa loja foi criada com o objetivo de democratizar o acesso a materiais de qualidade para estudantes, 
                profissionais e amantes da leitura.
              </p>
              <p className="leading-relaxed">
                Começamos como uma pequena loja física, focada em atender as necessidades da comunidade local. Com o tempo, 
                percebemos a necessidade de expandir nosso alcance através do comércio digital.
              </p>
              <p className="leading-relaxed">
                Hoje, somos uma plataforma e-commerce completa, oferecendo uma vasta seleção de livros, revistas e papelaria 
                premium. Nosso compromisso continua sendo oferecer qualidade, transparência e confiança em cada interação.
              </p>
              <p className="leading-relaxed">
                Estamos localizados na Cidade da Beira, mas nosso impacto já se estende por todo Moçambique, ajudando 
                a promover educação, cultura e criatividade.
              </p>
            </div>
          </section>

          {/* Team Section */}
          <section className="bg-card p-8 rounded-2xl border">
            <div className="flex items-center gap-3 mb-8">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-heading font-bold">Nossa Equipe</h2>
            </div>
            <p className="text-muted-foreground mb-8 text-lg">
              Conheça as pessoas que fazem a Papel & Pixel funcionar todos os dias
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {team.map((member) => (
                <Card 
                  key={member.name} 
                  className="hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] border-2 hover:border-primary"
                  onClick={() => handleMemberClick(member)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-lg mb-1">{member.name}</h3>
                        <p className="text-sm text-primary font-semibold mb-2">{member.role}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{member.bio}</p>
                        <div className="mt-3 text-xs text-primary font-medium flex items-center gap-1">
                          <span>Ver perfil completo</span>
                          <Users className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="bg-muted rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <Award className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-heading font-bold">Por Que Escolher a Papel & Pixel?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Qualidade Garantida</h3>
                  <p className="text-muted-foreground">
                    Trabalhamos apenas com produtos de alta qualidade e fornecedores confiáveis.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Atendimento Personalizado</h3>
                  <p className="text-muted-foreground">
                    Nossa equipe está sempre pronta para ajudar com qualquer dúvida ou necessidade.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Entrega Rápida</h3>
                  <p className="text-muted-foreground">
                    Frete grátis para compras acima de 500 MZN em todo Moçambique.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Suporte Completo</h3>
                  <p className="text-muted-foreground">
                    Atendimento via WhatsApp, e-mail e chat online durante todo o processo de compra.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-accent text-white rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Pronto para Fazer Parte da Nossa História?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Explore nossos produtos e descubra como podemos ajudar você em suas necessidades educacionais e criativas.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/products">Ver Produtos</a>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                <a href="/contact">Fale Conosco</a>
              </Button>
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default About;
