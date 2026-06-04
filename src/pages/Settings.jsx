import { useState } from 'react';
import { Trash2, Download, Upload, Lock } from 'lucide-react';
import store from '../lib/store';
import { usePasscode } from '../hooks/usePasscode';
import PasscodeSetup from '../components/PasscodeSetup';

export default function Settings() {
  const [importMessage, setImportMessage] = useState(null);
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const { isEnabled, togglePasscode, clearPasscode } = usePasscode();

  const clearAllData = () => {
    if (window.confirm('Delete all expense data? This cannot be undone.')) {
      const req = indexedDB.deleteDatabase('silo');
      req.onsuccess = () => {
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith('silo_'))
            .forEach((k) => localStorage.removeItem(k));
        } catch {}
        window.location.reload();
      };
    }
  };

  const exportData = async () => {
    await store.init();
    const expenses = await store.getExpenses(null);
    const budgets = [];
    if (!store.fallbackUsed && store.db) {
      try {
        const tx = store.db.transaction('budgets', 'readonly');
        const bstore = tx.objectStore('budgets');
        const all = await new Promise((resolve, reject) => {
          const req = bstore.getAll();
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        budgets.push(...all);
      } catch {}
    }

    const payload = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        expenses,
        budgets,
      },
      null,
      2,
    );

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `silo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (e) => {
    setImportMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !Array.isArray(data.expenses)) {
        setImportMessage({ type: 'error', text: 'Invalid backup file.' });
        return;
      }

      if (
        !window.confirm(
          `Import ${data.expenses.length} expenses and ${data.budgets?.length || 0} budgets? This will replace all current data.`,
        )
      ) {
        e.target.value = '';
        return;
      }

      const req = indexedDB.deleteDatabase('silo');
      await new Promise((resolve) => {
        req.onsuccess = () => {
          try {
            Object.keys(localStorage)
              .filter((k) => k.startsWith('silo_'))
              .forEach((k) => localStorage.removeItem(k));
          } catch {}
          resolve();
        };
      });

      await store.init();

      for (const exp of data.expenses) {
        await store.addExpense({
          amount: exp.amount,
          category: exp.category,
          note: exp.note,
          date: exp.date,
        });
      }

      if (Array.isArray(data.budgets)) {
        for (const bud of data.budgets) {
          await store.setBudget(bud.month, bud.amount);
        }
      }

      setImportMessage({ type: 'success', text: `Imported ${data.expenses.length} expenses.` });
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setImportMessage({ type: 'error', text: 'Failed to read backup file.' });
    }

    e.target.value = '';
  };

  const handleTogglePasscode = async () => {
    if (isEnabled) {
      // Disable passcode
      if (window.confirm('Disable passcode protection?')) {
        await clearPasscode();
      }
    } else {
      // Enable passcode
      setShowPasscodeSetup(true);
    }
  };

  const handleChangePasscode = () => {
    if (window.confirm('Set a new passcode?')) {
      setShowPasscodeSetup(true);
    }
  };

  return (
    <>
      {showPasscodeSetup && (
        <PasscodeSetup
          onComplete={() => {
            setShowPasscodeSetup(false);
            window.location.reload();
          }}
          onSkip={() => setShowPasscodeSetup(false)}
        />
      )}

      <div className="flex flex-col gap-5">
        {/* Security Section */}
        <div className="bg-surface-elevated rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-0.5">
              Security
            </p>
            <p className="text-sm font-medium">Passcode Protection</p>
          </div>

          <button
            onClick={handleTogglePasscode}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-surface-card/50 transition-colors border-b border-border-light"
          >
            <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center">
              <Lock size={16} className={isEnabled ? 'text-accent' : 'text-text-tertiary'} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{isEnabled ? 'Disable' : 'Enable'} Passcode</p>
              <p className="text-xs text-text-tertiary">
                {isEnabled ? 'Your app is protected' : 'Protect your data with a 4-digit code'}
              </p>
            </div>
            <div
              className={`w-10 h-6 rounded-full transition-colors ${
                isEnabled ? 'bg-accent' : 'bg-surface-card'
              }`}
            />
          </button>

          {isEnabled && (
            <button
              onClick={handleChangePasscode}
              className="w-full flex items-center gap-3 px-5 py-4 active:bg-surface-card/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center">
                <Lock size={16} className="text-accent opacity-50" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Change Passcode</p>
                <p className="text-xs text-text-tertiary">Update your security code</p>
              </div>
            </button>
          )}
        </div>

        {/* About Section */}
        <div className="bg-surface-elevated rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-0.5">
            About
          </p>
          <p className="text-sm font-medium">SILO</p>
          <p className="text-xs text-text-tertiary">Minimalist budget planner · v1.0</p>
        </div>

        <button
          onClick={exportData}
          className="w-full flex items-center gap-3 px-5 py-4 active:bg-surface-card/50 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface border-b border-border-light"
        >
          <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center">
            <Download size={16} className="text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Export Data</p>
            <p className="text-xs text-text-tertiary">
              Save all expenses and budgets as a JSON file
            </p>
          </div>
        </button>

        <label className="w-full flex items-center gap-3 px-5 py-4 active:bg-surface-card/50 transition-colors cursor-pointer border-b border-border-light focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface">
          <div className="w-9 h-9 rounded-full bg-accent-muted flex items-center justify-center">
            <Upload size={16} className="text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium">Import Data</p>
            <p className="text-xs text-text-tertiary">
              Restore from a previous backup
            </p>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
          />
        </label>

        {importMessage && (
          <div
            className={`px-5 py-3 text-xs font-medium ${
              importMessage.type === 'success' ? 'text-success' : 'text-danger'
            }`}
          >
            {importMessage.text}
          </div>
        )}

        <button
          onClick={clearAllData}
          className="w-full flex items-center gap-3 px-5 py-4 active:bg-surface-card/50 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <div className="w-9 h-9 rounded-full bg-danger-muted flex items-center justify-center">
            <Trash2 size={16} className="text-danger" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-danger">Clear All Data</p>
            <p className="text-xs text-text-tertiary">
              Permanently remove all expenses and budgets
            </p>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-text-tertiary px-4">
        All data stored locally on your device.
        Nothing leaves this phone.
      </p>
    </div>
    </>
  );
}
