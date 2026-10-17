import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, RotateCcw, Delete, History, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ScientificCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCalculatorModal: React.FC<ScientificCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [history, setHistory] = useState<Array<{ expr: string; res: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isRad, setIsRad] = useState<boolean>(false); // false = DEG, true = RAD
  const [memory, setMemory] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const displayEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (displayEndRef.current) {
      displayEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [expression]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input elsewhere
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if ((e.key >= '0' && e.key <= '9') || ['.', '+', '-', '*', '/', '(', ')', '^', '%'].includes(e.key)) {
        e.preventDefault();
        appendChar(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, expression, isRad]);

  if (!isOpen) return null;

  // Factorial helper
  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
      if (!isFinite(res)) return Infinity;
    }
    return res;
  };

  // Safe evaluation engine for scientific expressions
  const evaluateExpression = (expr: string): number => {
    if (!expr.trim()) return 0;

    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, `${Math.PI}`)
      .replace(/\be\b/g, `${Math.E}`);

    // Replace power operator
    sanitized = sanitized.replace(/\^/g, '**');

    // Replace functions with Math counterparts
    // Handle trig with Deg/Rad
    const degToRad = isRad ? 1 : Math.PI / 180;
    const radToDeg = isRad ? 1 : 180 / Math.PI;

    // Custom functions dictionary
    const funcs: { [key: string]: string } = {
      'sin': isRad ? 'Math.sin' : `((x) => Math.sin(x * ${degToRad}))`,
      'cos': isRad ? 'Math.cos' : `((x) => Math.cos(x * ${degToRad}))`,
      'tan': isRad ? 'Math.tan' : `((x) => Math.tan(x * ${degToRad}))`,
      'asin': isRad ? 'Math.asin' : `((x) => Math.asin(x) * ${radToDeg})`,
      'acos': isRad ? 'Math.acos' : `((x) => Math.acos(x) * ${radToDeg})`,
      'atan': isRad ? 'Math.atan' : `((x) => Math.atan(x) * ${radToDeg})`,
      'sqrt': 'Math.sqrt',
      'cbrt': 'Math.cbrt',
      'ln': 'Math.log',
      'log': 'Math.log10',
      'abs': 'Math.abs'
    };

    Object.entries(funcs).forEach(([name, replacement]) => {
      const regex = new RegExp(`\\b${name}\\(`, 'g');
      sanitized = sanitized.replace(regex, `${replacement}(`);
    });

    // Replace factorial syntax: e.g. 5! -> factorial(5)
    sanitized = sanitized.replace(/(\d+)!/g, 'fact($1)');

    // Context for evaluation
    const evalScope = {
      Math,
      fact: factorial
    };

    // Use safe Function constructor with whitelist
    // eslint-disable-next-line no-new-func
    const runner = new Function(
      'Math',
      'fact',
      `"use strict"; return (${sanitized});`
    );

    return runner(evalScope.Math, evalScope.fact);
  };

  const calculate = () => {
    if (!expression) return;
    try {
      const resVal = evaluateExpression(expression);
      if (isNaN(resVal) || !isFinite(resVal)) {
        setResult('ত্রুটি (Error)');
        return;
      }

      // Format result cleanly
      let formatted: string;
      if (Math.abs(resVal) < 1e-7 && resVal !== 0) {
        formatted = resVal.toExponential(4);
      } else if (Number.isInteger(resVal)) {
        formatted = resVal.toString();
      } else {
        formatted = parseFloat(resVal.toFixed(8)).toString();
      }

      setResult(formatted);
      setHistory(prev => [{ expr: expression, res: formatted }, ...prev.slice(0, 19)]);
    } catch {
      setResult('সিনট্যাক্স এরর');
    }
  };

  const appendChar = (char: string) => {
    setExpression(prev => prev + char);
  };

  const appendFunction = (fn: string) => {
    setExpression(prev => prev + fn + '(');
  };

  const clearAll = () => {
    setExpression('');
    setResult('0');
  };

  const backspace = () => {
    setExpression(prev => prev.slice(0, -1));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs select-none no-print">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                সায়েন্টিফিক ক্যালকুলেটর
              </h3>
              <p className="text-[10px] text-indigo-300">
                Scientific Calculator • {isRad ? 'RAD (রেডিয়ান)' : 'DEG (ডিগ্রি)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRad(!isRad)}
              className="px-2 py-1 rounded-lg text-[10px] font-black border transition-colors bg-slate-800 border-slate-700 hover:border-indigo-500 text-indigo-300"
              title="ডিগ্রি / রেডিয়ান মোড পরিবর্তন"
            >
              {isRad ? 'RAD' : 'DEG'}
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                showHistory ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="হিস্ট্রি"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Panel */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 relative">
          <div className="text-right min-h-[22px] text-xs font-mono text-slate-400 overflow-x-auto whitespace-nowrap no-scrollbar">
            {expression || ' '}
            <div ref={displayEndRef} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <button
              onClick={handleCopy}
              className="text-[10px] text-slate-500 hover:text-indigo-300 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-slate-900/60"
              title="ফলাফল কপি করুন"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>
            <div className="text-right text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight overflow-x-auto no-scrollbar">
              {result}
            </div>
          </div>
        </div>

        {/* History Drawer */}
        {showHistory && (
          <div className="bg-slate-950/90 border-b border-slate-800 p-3 max-h-40 overflow-y-auto space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800 text-[10px] text-slate-500 uppercase">
              <span>পূর্ববর্তী হিসাবসমূহ ({history.length})</span>
              <button
                onClick={() => setHistory([])}
                className="text-rose-400 hover:underline"
              >
                মুছুন
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-3">কোনো হিস্ট্রি নেই</p>
            ) : (
              history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setExpression(h.expr);
                    setResult(h.res);
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/80 cursor-pointer transition-colors"
                >
                  <span className="text-slate-400 truncate max-w-[180px]">{h.expr}</span>
                  <span className="text-emerald-400 font-bold ml-2">= {h.res}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Scientific Keypad Grid */}
        <div className="p-3 sm:p-4 bg-slate-900/90 overflow-y-auto grow space-y-2">
          
          {/* Row 1: Memory & Advanced scientific functions */}
          <div className="grid grid-cols-6 gap-1.5 text-xs font-semibold">
            <button
              onClick={() => appendFunction('sin')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              sin
            </button>
            <button
              onClick={() => appendFunction('cos')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              cos
            </button>
            <button
              onClick={() => appendFunction('tan')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              tan
            </button>
            <button
              onClick={() => appendFunction('asin')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              sin⁻¹
            </button>
            <button
              onClick={() => appendFunction('acos')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              cos⁻¹
            </button>
            <button
              onClick={() => appendFunction('atan')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              tan⁻¹
            </button>
          </div>

          {/* Row 2: Roots, Logs, Powers */}
          <div className="grid grid-cols-6 gap-1.5 text-xs font-semibold">
            <button
              onClick={() => appendFunction('sqrt')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              √x
            </button>
            <button
              onClick={() => appendFunction('cbrt')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              ∛x
            </button>
            <button
              onClick={() => appendChar('^2')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              x²
            </button>
            <button
              onClick={() => appendChar('^')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              xʸ
            </button>
            <button
              onClick={() => appendFunction('ln')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              ln
            </button>
            <button
              onClick={() => appendFunction('log')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              log₁₀
            </button>
          </div>

          {/* Row 3: Constants & Parentheses */}
          <div className="grid grid-cols-6 gap-1.5 text-xs font-semibold">
            <button
              onClick={() => appendChar('π')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-amber-300 border border-slate-700/60 transition-all active:scale-95"
            >
              π
            </button>
            <button
              onClick={() => appendChar('e')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-amber-300 border border-slate-700/60 transition-all active:scale-95"
            >
              e
            </button>
            <button
              onClick={() => appendChar('!')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              x!
            </button>
            <button
              onClick={() => appendChar('(')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95 font-mono"
            >
              (
            </button>
            <button
              onClick={() => appendChar(')')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95 font-mono"
            >
              )
            </button>
            <button
              onClick={() => appendChar('%')}
              className="py-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/60 text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            >
              %
            </button>
          </div>

          {/* Standard Keypad (4 columns: 7 8 9 /, 4 5 6 *, 1 2 3 -, 0 . = +) */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/90 text-sm sm:text-base font-bold font-mono">
            {/* Top Function Row */}
            <button
              onClick={clearAll}
              className="py-3 rounded-2xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 transition-all active:scale-95 shadow-sm"
            >
              AC
            </button>
            <button
              onClick={backspace}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95 flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              onClick={() => appendFunction('abs')}
              className="py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 text-xs font-sans font-semibold"
            >
              |x|
            </button>
            <button
              onClick={() => appendChar('÷')}
              className="py-3 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 transition-all active:scale-95 text-lg"
            >
              ÷
            </button>

            {/* Numbers Row 1 */}
            <button
              onClick={() => appendChar('7')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              7
            </button>
            <button
              onClick={() => appendChar('8')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              8
            </button>
            <button
              onClick={() => appendChar('9')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              9
            </button>
            <button
              onClick={() => appendChar('×')}
              className="py-3 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 transition-all active:scale-95 text-lg"
            >
              ×
            </button>

            {/* Numbers Row 2 */}
            <button
              onClick={() => appendChar('4')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              4
            </button>
            <button
              onClick={() => appendChar('5')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              5
            </button>
            <button
              onClick={() => appendChar('6')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              6
            </button>
            <button
              onClick={() => appendChar('-')}
              className="py-3 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 transition-all active:scale-95 text-xl"
            >
              -
            </button>

            {/* Numbers Row 3 */}
            <button
              onClick={() => appendChar('1')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              1
            </button>
            <button
              onClick={() => appendChar('2')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              2
            </button>
            <button
              onClick={() => appendChar('3')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              3
            </button>
            <button
              onClick={() => appendChar('+')}
              className="py-3 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 transition-all active:scale-95 text-lg"
            >
              +
            </button>

            {/* Bottom Row */}
            <button
              onClick={() => appendChar('0')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              0
            </button>
            <button
              onClick={() => appendChar('.')}
              className="py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white border border-slate-700/70 transition-all active:scale-95"
            >
              .
            </button>
            <button
              onClick={calculate}
              className="col-span-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-98"
            >
              =
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-500 text-center flex items-center justify-between">
          <span>কিবোর্ড সাপোর্ট: 0-9, +, -, *, /, Enter, Backspace</span>
          <span className="text-indigo-400 font-bold">BS E-Learning Tool</span>
        </div>
      </div>
    </div>
  );
};
