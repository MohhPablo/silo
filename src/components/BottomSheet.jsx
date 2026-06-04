import { useState, useEffect, useRef } from 'react';
import { X, Banknote, Tag, Calendar, CreditCard, UtensilsCrossed, Car, ShoppingBag, HelpCircle } from 'lucide-react';
import { CATEGORIES, getCategoryColor } from '../lib/categories';
import { detectCategory } from '../lib/categorize';

function CategoryIcon({ category, size = 16 }) {
  const icons = {
    food: <UtensilsCrossed size={size} />,
    transport: <Car size={size} />,
    shopping: <ShoppingBag size={size} />,
    bills: <CreditCard size={size} />,
    other: <HelpCircle size={size} />,
  };
  return icons[category] || icons.other;
}

export default function BottomSheet({ open, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [autoCategory, setAutoCategory] = useState(null);
  const inputRef = useRef(null);
  const touchStartY = useRef(null);
  const sheetRef = useRef(null);
  const lastManualCategory = useRef('food');
  const categoryTimer = useRef(null);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsClosing(false);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    // Haptic feedback on successful save
    try { navigator.vibrate?.(10); } catch {}

    onSave({
      amount: parseFloat(amount).toFixed(2),
      category,
      note: note.trim() || null,
      date: new Date().toISOString(),
    });
    setAmount('');
    setCategory('food');
    setNote('');
    setAutoCategory(null);
    lastManualCategory.current = 'food';
    handleClose();
  };

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);

    if (categoryTimer.current) clearTimeout(categoryTimer.current);
    categoryTimer.current = setTimeout(() => {
      const detected = detectCategory(val);
      if (detected && detected !== category) {
        setCategory(detected);
        setAutoCategory(detected);
      } else if (!detected && autoCategory) {
        setCategory(lastManualCategory.current);
        setAutoCategory(null);
      }
    }, 300);
  };

  const handleCategoryChange = (catId) => {
    setCategory(catId);
    setAutoCategory(null);
    lastManualCategory.current = catId;
  };

  const handleTouchStart = (e) => {
    if (e.target === e.currentTarget) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartY.current) {
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      if (delta > 60) handleClose();
      touchStartY.current = null;
    }
  };

  if (!isVisible && !open) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] ${open && !isClosing ? 'animate-fade-in' : ''}`}
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-surface-elevated rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)] ${
          open && !isClosing ? 'animate-slide-up' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-semibold">New Expense</h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <X size={16} className="text-text-secondary" />
          </button>
        </div>

        <div className="px-5 pb-4">
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            Amount
          </label>
          <div className="flex items-center bg-surface-card rounded-xl px-4 h-14 mb-5 focus-within:ring-2 focus-within:ring-accent/50 transition-shadow">
            <Banknote size={18} className="text-text-tertiary mr-3 flex-shrink-0" />
            <span className="text-text-secondary text-lg mr-1">₦</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-lg text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>

          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            Category
          </label>
          <div className="flex gap-2 mb-5 overflow-x-auto ios-scroll pb-2 -mx-1 px-1">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              const wasAutoDetected = autoCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
                    isActive
                      ? wasAutoDetected
                        ? 'bg-accent-muted ring-1 ring-accent/30 animate-fade-in'
                        : 'bg-accent-muted ring-1 ring-accent/30'
                      : 'bg-surface-card'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon category={cat.id} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? 'text-accent' : 'text-text-secondary'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          <label className="text-xs font-medium text-text-secondary mb-1.5 block">
            Note
          </label>
          <div className="flex items-center bg-surface-card rounded-xl px-4 h-12 mb-6 focus-within:ring-2 focus-within:ring-accent/50 transition-shadow">
            <Tag size={16} className="text-text-tertiary mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="What was this for?"
              value={note}
              onChange={handleNoteChange}
              maxLength={60}
              className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-tertiary text-sm"
            />
            {autoCategory && (
              <span className="text-xs text-accent font-medium flex-shrink-0 ml-2">
                Auto: {CATEGORIES.find((c) => c.id === autoCategory)?.label}
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-12 rounded-xl bg-accent text-surface font-semibold text-base active:scale-[0.98] transition-transform disabled:opacity-30 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            Add Expense
          </button>
        </div>
      </div>
    </div>
  );
}
