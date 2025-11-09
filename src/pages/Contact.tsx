import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Contact = () => {
  const phoneNumber = "+258874383621";
  const whatsappLink = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-white py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Entre em Contato
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Estamos aqui para ajudar! Entre em contato conosco através do formulário, WhatsApp ou e-mail
            </p>
          </div>
        </section>

        <div className="container py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {/* Contact Cards */}
              <div className="grid gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-lg">Endereço</h3>
                        <p className="text-muted-foreground">
                          Cidade da Beira<br />
                          Moçambique
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-lg">Telefone / WhatsApp</h3>
                        <a href={`tel:${phoneNumber}`} className="text-muted-foreground hover:text-primary transition-colors">
                          {phoneNumber}
                        </a>
                        <Button asChild className="mt-2 w-full" variant="default">
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Abrir WhatsApp
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-lg">E-mail</h3>
                        <a href="mailto:atendimento@papelepixel.co.mz" className="text-muted-foreground hover:text-primary transition-colors">
                          atendimento@papelepixel.co.mz
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-bold mb-1 text-lg">Horário de Atendimento</h3>
                        <p className="text-muted-foreground">
                          Segunda a Sexta: 9h - 18h<br />
                          Sábado: 9h - 13h<br />
                          Domingo: Fechado
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading font-bold mb-4 text-lg">Localização</h3>
                  <p className="text-muted-foreground mb-4">
                    Nossa loja está localizada na Cidade da Beira, Moçambique. Venha nos visitar ou entre em contato online!
                  </p>
                  <div className="aspect-video rounded-lg overflow-hidden border">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.8928!2d34.8396!3d-19.8436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDUwJzM3LjAiUyAzNMKwNTAnMjIuNiJF!5e0!3m2!1spt-PT!2smz!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Localização Papel & Pixel Store"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-heading font-bold mb-6">Envie uma Mensagem</h2>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" placeholder="Seu nome" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (Opcional)</Label>
                      <Input id="phone" type="tel" placeholder="+258 XX XXX XXXX" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Assunto</Label>
                      <Input id="subject" placeholder="Como podemos ajudar?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea id="message" placeholder="Escreva sua mensagem aqui..." rows={6} />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-accent">
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Contact;
