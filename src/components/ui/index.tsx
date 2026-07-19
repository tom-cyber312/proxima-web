import { forwardRef, type ReactNode, createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../utils/helpers';

export const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, variant = 'primary', size = 'md', disabled, loading, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
      secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/50 border border-white/10',
      outline: 'border border-white/20 text-white hover:bg-white/10 focus:ring-white/50',
      ghost: 'text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/50',
      danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
      success: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2',
      xl: 'px-8 py-4 text-xl gap-3',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export const IconButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: 'sm' | 'md' | 'lg' }>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors',
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, label, error, hint, leftIcon, rightIcon, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed',
            'error:border-red-500 error:focus:ring-red-500',
            leftIcon ? 'pl-10' : 'pl-4',
            rightIcon ? 'pr-10' : 'pr-4',
            'py-3 text-base',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${props.id}-hint`} className="mt-1.5 text-sm text-white/40">
          {hint}
        </p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; hint?: string; options: { value: string; label: string }[] }>(
  ({ className, label, error, hint, options, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full bg-white/5 border border-white/10 rounded-xl text-white appearance-none transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed',
            'error:border-red-500 error:focus:ring-red-500',
            'pl-4 pr-10 py-3 text-base',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${props.id}-hint`} className="mt-1.5 text-sm text-white/40">
          {hint}
        </p>
      )}
    </div>
  )
);
Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string }>(
  ({ className, label, error, hint, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      )}
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 transition-all duration-200 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-white/5 disabled:text-white/30 disabled:cursor-not-allowed',
          'error:border-red-500 error:focus:ring-red-500',
          'p-4 text-base min-h-[100px]',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${props.id}-hint`} className="mt-1.5 text-sm text-white/40">
          {hint}
        </p>
      )}
    </div>
  )
);
Textarea.displayName = 'Textarea';

export const Checkbox = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }>(
  ({ className, label, description, ...props }, ref) => (
    <label className={cn('flex items-start gap-3 cursor-pointer', className)}>
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'mt-1 w-4 h-4 rounded border-white/20 text-blue-500',
          'appearance-none',
          'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black',
          'checked:bg-blue-500 checked:border-blue-500',
          'transition-colors'
        )}
        {...props}
      />
      <div>
        <span className="text-white block">{label}</span>
        {description && <span className="text-white/40 text-sm block mt-0.5">{description}</span>}
      </div>
    </label>
  )
);
Checkbox.displayName = 'Checkbox';

export const Switch = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; description?: string }>(
  ({ className, label, description, ...props }, ref) => (
    <label className={cn('flex items-center gap-3 cursor-pointer', className)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        className={cn(
          'relative w-11 h-6 rounded-full border-2 border-white/20',
          'appearance-none transition-colors duration-200',
          'checked:bg-blue-500 checked:border-blue-500',
          'checked:after:translate-x-full',
          'after:content-[""] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:transition-transform after:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black',
        )}
        {...props}
      />
      {(label || description) && (
        <div>
          {label && <span className="text-white block">{label}</span>}
          {description && <span className="text-white/40 text-sm block">{description}</span>}
        </div>
      )}
    </label>
  )
);
Switch.displayName = 'Switch';

export const RadioGroup = forwardRef<HTMLDivElement, { name: string; value: string; onChange: (value: string) => void; options: { value: string; label: string; description?: string }[]; className?: string }>(
  ({ name, value, onChange, options, className }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className={cn(
              'w-4 h-4 text-blue-500 border-white/20',
              'appearance-none',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black'
            )}
          />
          <div>
            <span className="text-white block">{opt.label}</span>
            {opt.description && <span className="text-white/40 text-sm block">{opt.description}</span>}
          </div>
        </label>
      ))}
    </div>
  )
);
RadioGroup.displayName = 'RadioGroup';

export const Card = ({ className, children, padded = true }: { className?: string; children: ReactNode; padded?: boolean }) => (
  <div className={cn('bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm', padded ? 'p-6' : '', className)}>
    {children}
  </div>
);

export const CardHeader = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

export const CardTitle = ({ className, children }: { className?: string; children: ReactNode }) => (
  <h3 className={cn('text-lg font-semibold text-white', className)}>{children}</h3>
);

export const CardDescription = ({ className, children }: { className?: string; children: ReactNode }) => (
  <p className={cn('text-white/50 text-sm mt-1', className)}>{children}</p>
);

export const CardContent = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn(className)}>{children}</div>
);

export const CardFooter = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('mt-4 pt-4 border-t border-white/10 flex items-center gap-2', className)}>
    {children}
  </div>
);

export const Badge = ({ className, variant = 'default', children }: { className?: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; children: ReactNode }) => {
  const variants = {
    default: 'bg-white/10 text-white/80 border border-white/10',
    success: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
};

export const Avatar = ({ className, src, alt, fallback, size = 'md' }: { className?: string; src?: string; alt?: string; fallback?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };
  return (
    <div className={cn('relative inline-flex items-center justify-center rounded-full overflow-hidden bg-white/10', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-medium text-white/80">{fallback || '?'}</span>
      )}
    </div>
  );
};

export const Divider = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <div className={cn('flex items-center gap-4', className)}>
    <div className="flex-1 h-px bg-white/10" />
    {children && <span className="text-white/40 text-sm whitespace-nowrap">{children}</span>}
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

export const Spinner = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg className={cn('animate-spin text-blue-500', sizes[size], className)} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

export const Tooltip = ({ children, content, position = 'top' }: { children: ReactNode; content: string; position?: 'top' | 'bottom' | 'left' | 'right' }) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  return (
    <div className="relative inline-block" tabIndex={0}>
      {children}
      <div className={cn('absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap opacity-0 invisible transition-all duration-200', positions[position])}>
        {content}
        <div className={cn(
          'absolute w-0 h-0 border-4 border-transparent',
          position === 'top' && 'bottom-[-8px] left-1/2 -translate-x-1/2 border-t-gray-900',
          position === 'bottom' && 'top-[-8px] left-1/2 -translate-x-1/2 border-b-gray-900',
          position === 'left' && 'right-[-8px] top-1/2 -translate-y-1/2 border-l-gray-900',
          position === 'right' && 'left-[-8px] top-1/2 -translate-y-1/2 border-r-gray-900'
        )} />
      </div>
    </div>
  );
};

export const EmptyState = ({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && <div className="text-white/20 mb-4 text-6xl">{icon}</div>}
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    {description && <p className="text-white/50 mb-4 max-w-sm">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export const LoadingSkeleton = ({ className, variant = 'text', width, height }: { className?: string; variant?: 'text' | 'circular' | 'rectangular'; width?: string; height?: string }) => {
  const base = 'animate-pulse bg-white/10 rounded';
  const variants = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  return (
    <div
      className={cn(base, variants[variant], className)}
      style={{ width, height }}
    />
  );
};

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({ value: '', onValueChange: () => {} });

export const Tabs = ({ className, children, defaultValue, value: controlledValue, onValueChange: controlledOnChange, onChange, variant = 'default' }: { 
  className?: string; 
  children: ReactNode; 
  defaultValue?: string; 
  value?: string;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  
  const handleValueChange = useCallback((val: string) => {
    if (!isControlled) setInternalValue(val);
    controlledOnChange?.(val);
    onChange?.(val);
  }, [isControlled, controlledOnChange, onChange]);

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn(className)} data-tabs>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabList = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('flex gap-1 bg-white/5 p-1 rounded-xl', className)} role="tablist">
    {children}
  </div>
);
export const TabsList = TabList;

export const TabTrigger = ({ className, value, children, disabled }: { className?: string; value: string; children: ReactNode; disabled?: boolean }) => {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => !disabled && ctx.onValueChange(value)}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer',
        'data-[state=active]:bg-white/10 data-[state=active]:text-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
};
export const TabsTrigger = TabTrigger;

export const TabContent = ({ className, children, value }: { className?: string; children: ReactNode; value: string }) => {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn(className)}>
      {children}
    </div>
  );
};
export const TabsContent = TabContent;