# Form Optimization for Mobile (React/Next.js)

## Critical Rules

1. `font-size ≥ 16px` on all inputs — prevents iOS auto-zoom
2. Correct `type` attribute — triggers right mobile keyboard
3. `autoComplete` attributes — enables browser/OS autofill
4. Full-width inputs on mobile
5. Labels always above inputs (never placeholder-only)
6. Submit button full-width on mobile, min 48px height

---

## 1. Input Type → Keyboard Reference

```tsx
<input type="email"  autoComplete="email" />           // @ key
<input type="tel"    autoComplete="tel" />              // numpad
<input type="url"    autoComplete="url" />              // .com key
<input type="search" />                                  // Search key
<input type="number" inputMode="numeric" />             // number pad
<input type="text"   inputMode="decimal" />             // decimal numpad
<input type="text"   inputMode="numeric"
       autoComplete="cc-number" />                      // credit card
<input type="date" />                                    // native date picker
<input type="password" autoComplete="current-password" />
<input type="password" autoComplete="new-password" />
```

---

## 2. MobileInput Component — Tailwind

```tsx
// components/ui/MobileInput.tsx
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function MobileInput({ label, error, hint, id, required, ...props }: MobileInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden>
            *
          </span>
        )}
      </label>

      {hint && <p className="text-xs text-gray-500">{hint}</p>}

      <input
        id={inputId}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full rounded-xl border px-4 py-3
          text-base               /* ≥16px — no iOS zoom */
          min-h-[48px]            /* 48dp touch target */
          bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}
        `}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
```

---

## 3. MobileInput Component — Styled Components

```tsx
import styled from "styled-components";

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const StyledInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  font-size: 1rem; /* 16px — prevents iOS zoom */
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$error ? "#f87171" : "#d1d5db")};
  background: ${(p) => (p.$error ? "#fef2f2" : "white")};
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const ErrorText = styled.p`
  font-size: 12px;
  color: #dc2626;
`;
```

---

## 4. Multi-Column → Single Column Layout

```tsx
// Tailwind
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
  <MobileInput label="First Name" autoComplete="given-name" required />
  <MobileInput label="Last Name" autoComplete="family-name" required />
  <MobileInput label="Email" type="email" autoComplete="email" className="md:col-span-2" required />
  <MobileInput label="Phone" type="tel" autoComplete="tel" />
  <MobileInput label="Company" autoComplete="organization" />
</div>;

// Styled Components
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  ${mq.md} {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
`;
const FullWidth = styled.div`
  ${mq.md} {
    grid-column: span 2;
  }
`;
```

---

## 5. Submit Button

```tsx
// Tailwind
<button
  type="submit"
  className="
    w-full md:w-auto
    min-h-[52px] px-8
    bg-blue-600 hover:bg-blue-700 active:bg-blue-800
    text-white font-semibold text-base rounded-xl
    active:scale-[0.98] transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
  "
>
  Submit
</button>;

// Styled Components
const SubmitButton = styled.button`
  width: 100%;
  min-height: 52px;
  padding: 0 32px;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:active {
    transform: scale(0.98);
    background: #1d4ed8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${mq.md} {
    width: auto;
  }
`;
```

---

## 6. Keyboard Avoidance (Next.js PWA)

```tsx
// Scroll focused input into view when keyboard opens
useEffect(() => {
  const handler = () => {
    const focused = document.activeElement as HTMLElement;
    if (focused?.tagName === "INPUT" || focused?.tagName === "TEXTAREA") {
      setTimeout(() => focused.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  };
  window.visualViewport?.addEventListener("resize", handler);
  return () => window.visualViewport?.removeEventListener("resize", handler);
}, []);
```

---

## 7. autoComplete Reference

```
name, given-name, family-name, email, tel
street-address, postal-code, country
cc-number, cc-exp, cc-csc
new-password, current-password
one-time-code   ← OTP autofill from SMS
```
