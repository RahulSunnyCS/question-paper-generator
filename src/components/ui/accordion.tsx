import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type AccordionType = 'single' | 'multiple';

interface AccordionContextValue {
  type: AccordionType;
  valueSet: Set<string>;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  type?: AccordionType;
  defaultValue?: string | string[];
  className?: string;
}

export const Accordion = ({
  type = 'single',
  defaultValue,
  className,
  children,
}: PropsWithChildren<AccordionProps>) => {
  const initial = useMemo(() => {
    if (Array.isArray(defaultValue)) return new Set(defaultValue);
    if (typeof defaultValue === 'string' && defaultValue) return new Set([defaultValue]);
    return new Set<string>();
  }, [defaultValue]);

  const [valueSet, setValueSet] = useState<Set<string>>(initial);

  const toggle = (value: string) => {
    setValueSet((prev) => {
      const next = new Set(prev);
      const open = next.has(value);

      if (type === 'single') {
        next.clear();
        if (!open) {
          next.add(value);
        }
        return next;
      }

      if (open) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ type, valueSet, toggle }}>
      <div className={cn('space-y-3', className)}>{children}</div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  className?: string;
}

const AccordionItemContext = createContext<{ value: string } | null>(null);

export const AccordionItem = ({ value, className, children }: PropsWithChildren<AccordionItemProps>) => (
  <AccordionItemContext.Provider value={{ value }}>
    <div className={cn('rounded-lg border border-slate-200 bg-white', className)}>{children}</div>
  </AccordionItemContext.Provider>
);

export const AccordionTrigger = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) return null;

  const open = accordionContext.valueSet.has(itemContext.value);

  return (
    <button
      type="button"
      onClick={() => accordionContext.toggle(itemContext.value)}
      className={cn('flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium', className)}
    >
      <span>{children}</span>
      <span className="text-sm leading-none text-slate-500">{open ? '▾' : '▸'}</span>
    </button>
  );
};

export const AccordionContent = ({ className, children }: PropsWithChildren<{ className?: string }>) => {
  const accordionContext = useContext(AccordionContext);
  const itemContext = useContext(AccordionItemContext);

  if (!accordionContext || !itemContext) return null;

  if (!accordionContext.valueSet.has(itemContext.value)) {
    return null;
  }

  return <div className={cn('border-t border-slate-200 p-4', className)}>{children}</div>;
};
