import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { ShoppingCart, Trash2, X } from 'lucide-react';

const LICENSE_LABELS = {
  single: 'Single User',
  multi: 'Multi User (5)',
  enterprise: 'Enterprise',
};

export default function CartDrawer({ open, onClose, cart, onRemove, onCheckout }) {
  const total = cart.reduce((sum, item) => {
    const priceKey = `price_${item.license_type}`;
    return sum + (item[priceKey] || item.price_single);
  }, 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-[#0F1D32] border-white/10 text-white w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white font-[Outfit] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#00B4D8]" />
            Your Cart ({cart.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-60px)] mt-6">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400 text-sm">Your cart is empty</p>
              <p className="text-slate-600 text-xs mt-1">Browse our reports to get started</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {cart.map((item, idx) => {
                  const priceKey = `price_${item.license_type}`;
                  const price = item[priceKey] || item.price_single;
                  return (
                    <div
                      key={`${item.id}-${item.license_type}-${idx}`}
                      data-testid={`cart-item-${item.id}`}
                      className="glass rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex gap-3">
                        <img src={item.cover_image} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                          <p className="text-xs text-[#00B4D8] mt-0.5">{LICENSE_LABELS[item.license_type] || 'Single User'}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[#F59E0B] font-mono font-bold text-sm">${price.toLocaleString()}</span>
                            <button
                              data-testid={`remove-cart-${item.id}`}
                              onClick={() => onRemove(idx)}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Total</span>
                  <span className="text-2xl font-bold text-[#F59E0B] font-mono">${total.toLocaleString()}</span>
                </div>
                <button
                  data-testid="checkout-btn"
                  onClick={onCheckout}
                  className="w-full py-3.5 rounded-full bg-[#F59E0B] text-black font-bold text-sm hover:bg-[#D97706] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
                >
                  Continue Browsing
                </button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
