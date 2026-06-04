import { useState } from 'react';
import { usePasscode } from '../hooks/usePasscode';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PasscodeAuth({ onSuccess }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const { verifyPasscode } = usePasscode();

  const handleKeyPress = (key) => {
    if (locked) return;

    if (key === '⌫') {
      setInput((prev) => prev.slice(0, -1));
      setError('');
    } else if (key && input.length < 4) {
      setInput((prev) => prev + key);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (input.length !== 4) {
      setError('Enter 4 digits');
      return;
    }

    const isValid = await verifyPasscode(input);

    if (isValid) {
      setInput('');
      setAttempts(0);
      onSuccess?.();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setInput('');

      if (newAttempts >= 5) {
        setError('Too many attempts. Try again in 30 seconds.');
        setLocked(true);
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
          setError('');
        }, 30000);
      } else {
        setError(`Wrong passcode. ${5 - newAttempts} attempt${5 - newAttempts === 1 ? '' : 's'} left.`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-surface">S</span>
          </div>
          <p className="text-lg font-bold tracking-wider">SILO</p>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-1">Enter Passcode</h2>
          <p className="text-xs text-text-tertiary">Your app is protected</p>
        </div>

        {/* Passcode Display */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-full bg-surface-elevated border-2 border-border-light flex items-center justify-center font-semibold text-lg transition-all"
            >
              {input[i] ? '●' : ''}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-xs text-danger text-center">{error}</p>}

        {/* Keypad */}
        <div className="w-full grid grid-cols-3 gap-2">
          {KEYPAD.map((key, idx) => (
            <button
              key={idx}
              onClick={() => handleKeyPress(key)}
              disabled={locked}
              className={`h-14 rounded-full font-semibold text-lg transition-all ${
                key === ''
                  ? 'invisible'
                  : locked
                    ? 'bg-surface-elevated text-text-tertiary cursor-not-allowed opacity-50'
                    : 'bg-surface-elevated hover:bg-surface-card active:bg-accent/20 text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={locked || input.length !== 4}
          className="w-full h-12 rounded-full bg-accent text-surface font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
