import { useState } from 'react';
import { usePasscode } from '../hooks/usePasscode';

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

export default function PasscodeSetup({ onComplete, onSkip }) {
  const [step, setStep] = useState('create'); // 'create' | 'confirm'
  const [firstPasscode, setFirstPasscode] = useState('');
  const [secondPasscode, setSecondPasscode] = useState('');
  const [error, setError] = useState('');
  const { setPasscode } = usePasscode();

  const handleKeyPress = (key, input, setInput) => {
    if (key === '⌫') {
      setInput((prev) => prev.slice(0, -1));
      setError('');
    } else if (key && input.length < 4) {
      setInput((prev) => prev + key);
      setError('');
    }
  };

  const handleNext = () => {
    if (firstPasscode.length !== 4) {
      setError('Enter 4 digits');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const handleConfirm = async () => {
    if (secondPasscode.length !== 4) {
      setError('Enter 4 digits');
      return;
    }

    if (firstPasscode !== secondPasscode) {
      setError('Passcodes do not match');
      setFirstPasscode('');
      setSecondPasscode('');
      setStep('create');
      return;
    }

    await setPasscode(firstPasscode);
    onComplete?.();
  };

  const isCreateStep = step === 'create';
  const currentInput = isCreateStep ? firstPasscode : secondPasscode;
  const setCurrentInput = isCreateStep ? setFirstPasscode : setSecondPasscode;

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
          <h2 className="text-xl font-bold mb-1">
            {isCreateStep ? 'Create Passcode' : 'Confirm Passcode'}
          </h2>
          <p className="text-xs text-text-tertiary">
            {isCreateStep ? 'Set a 4-digit code to protect your data' : 'Enter your passcode again'}
          </p>
        </div>

        {/* Passcode Display */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-full bg-surface-elevated border-2 border-border-light flex items-center justify-center font-semibold text-lg transition-all"
            >
              {currentInput[i] ? '●' : ''}
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
              onClick={() => handleKeyPress(key, currentInput, setCurrentInput)}
              className={`h-14 rounded-full font-semibold text-lg transition-all ${
                key === ''
                  ? 'invisible'
                  : 'bg-surface-elevated hover:bg-surface-card active:bg-accent/20 text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 h-12 rounded-full bg-surface-elevated text-text-secondary font-semibold transition-all active:scale-95"
          >
            Skip
          </button>
          <button
            onClick={isCreateStep ? handleNext : handleConfirm}
            disabled={currentInput.length !== 4}
            className="flex-1 h-12 rounded-full bg-accent text-surface font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isCreateStep ? 'Next' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
