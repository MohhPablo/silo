import { useState, useEffect, useRef } from 'react';
import { X, Banknote, Tag, Calendar, CreditCard } from 'lucide-react';

function CategoryIcon({ category, size = 18 }) {
  const icons = {
    food: <Tag size={size} />,
    transport: <CreditCard size={size} />,
    shopping: <Tag size={size} />,
    bills: <Banknote size={size} />,
    other: <Calendar size={size} />,
  };
  return icons[category] || icons.other;
}

const CATEGORIES = [
  { id: 'food', label: 'Food', color: 'bg-[#ff9f0a]' },
  { id: 'transport', label: 'Transport', color: 'bg-[#5e5ce6]' },
  { id: 'shopping', label: 'Shopping', color: 'bg-[#ff375f]' },
  { id: 'bills', label: 'Bills', color: 'bg-[#30d158]' },
  { id: 'other', label: 'Other', color: 'bg-[#8e8e93]' },
];

export default function BottomSheet({ open, onClose, onSave }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef(null);
  const touchStartY = useRef(null);
  const sheetRef = useRef(null);

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
    onSave({
      amount: parseFloat(amount).toFixed(2),
      category,
      note: note.trim() || null,
      date: new Date().toISOString(),
    });
    setAmount('');
    setCategory('food');
    setNote('');
    handleClose();
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
                  category === cat.id
                    ? 'bg-accent-muted ring-1 ring-accent/30'
                    : 'bg-surface-card'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full ${cat.color} flex items-center justify-center`}
                >
                  <CategoryIcon category={cat.id} />
                </div>
                <span
                  className={`text-xs font-medium ${
                    category === cat.id ? 'text-accent' : 'text-text-secondary'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            ))}
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
              onChange={(e) => setNote(e.target.value)}
              maxLength={60}
              className="flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-tertiary text-sm"
            />
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
