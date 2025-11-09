import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatBox from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const Cart = () => {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    toggleItemSelection, 
    selectAllItems, 
    total, 
    itemCount, 
    selectedTotal, 
    selectedItemCount,
    selectedItems 
  } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-heading font-bold mb-2">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-6">
              Explore nossos produtos e adicione itens ao carrinho
            </p>
            <Button onClick={() => navigate("/products")} className="bg-gradient-accent">
              Ver Produtos
            </Button>
          </div>
        </main>
        <Footer />
        <ChatBox />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">Carrinho de Compras ({itemCount} {itemCount === 1 ? 'item' : 'itens'})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="select-all" 
                    checked={items.length > 0 && items.every(item => item.selected !== false)}
                    onCheckedChange={(checked) => selectAllItems(checked === true)}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Selecionar todos ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
                  </label>
                </div>
              </CardContent>
            </Card>

            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start pt-1">
                      <Checkbox 
                        id={`item-${item.id}`}
                        checked={item.selected !== false}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </div>

                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.originalPrice && (
                          <span className="line-through mr-2">
                            {item.originalPrice.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                          </span>
                        )}
                        {item.price.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                      </p>

                      <div className="flex items-center gap-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {(item.price * item.quantity).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-20">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                
                {selectedItemCount === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Selecione pelo menos um item para continuar
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Itens selecionados ({selectedItemCount} {selectedItemCount === 1 ? 'item' : 'itens'})
                        </span>
                        <span>{selectedTotal.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Frete</span>
                        <span className="text-green-600 font-semibold">
                          {selectedTotal >= 500 ? 'Grátis' : '50 MZN'}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between text-lg font-bold mb-6">
                      <span>Total</span>
                      <span className="text-primary">
                        {selectedTotal >= 500 
                          ? selectedTotal.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
                          : (selectedTotal + 50).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })
                        }
                      </span>
                    </div>

                    {selectedTotal < 500 && (
                      <p className="text-sm text-green-600 mb-4 text-center">
                        Adicione mais {(500 - selectedTotal).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} para frete grátis!
                      </p>
                    )}

                    <Button 
                      className="w-full bg-gradient-accent mb-3"
                      onClick={() => navigate("/checkout?fromCart=true")}
                      disabled={selectedItemCount === 0}
                    >
                      Finalizar Compra ({selectedItemCount} {selectedItemCount === 1 ? 'item' : 'itens'})
                    </Button>
                  </>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/products")}
                >
                  Continuar Comprando
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <ChatBox />
    </div>
  );
};

export default Cart;

