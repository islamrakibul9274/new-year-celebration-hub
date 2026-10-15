"use client";

import React from "react";

let uid = 0;
const nextId = () => `field-${++uid}`;

const CONTROL_TAGS = new Set(["input", "textarea", "select"]);

/** Our control components (declared below; function declarations hoist). */
function isControl(node: React.ReactNode): node is React.ReactElement {
  if (!React.isValidElement(node)) return false;
  const type = node.type;
  if (typeof type === "string" && CONTROL_TAGS.has(type)) return true;
  return type === Input || type === Textarea || type === Select;
}

/**
 * Locate the form control, walking through icon wrapper divs.
 * Uses props.children directly (React.Children.toArray clones elements,
 * which would break identity checks in the injection step below).
 */
function findControl(node: React.ReactNode): React.ReactElement | null {
  if (!React.isValidElement(node)) return null;
  if (isControl(node)) return node;
  const kids = (node as React.ReactElement<{ children?: React.ReactNode }>).props.children;
  if (Array.isArray(kids)) {
    for (const kid of kids) {
      const found = findControl(kid);
      if (found) return found;
    }
    return null;
  }
  return kids ? findControl(kids) : null;
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/** Wraps a control with a label, hint and error text (aria-describedby wired). */
export function Field({ label, htmlFor, error, hint, children, className = "" }: FieldProps) {
  const generatedId = React.useMemo(nextId, []);
  const id = htmlFor || generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const control = findControl(children);
  let rendered = children;

  if (control) {
    const cloned = React.cloneElement(control as React.ReactElement<Record<string, unknown>>, {
      id,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy,
    });

    const inject = (node: React.ReactNode): React.ReactNode => {
      if (!React.isValidElement(node)) return node;
      if (node === control) return cloned;
      const kids = (node as React.ReactElement<{ children?: React.ReactNode }>).props.children;
      if (kids === undefined || kids === null) return node;
      const nextKids = Array.isArray(kids)
        ? kids.map((kid, i) => (
            <React.Fragment key={kid && React.isValidElement(kid) && kid.key ? kid.key : i}>
              {inject(kid)}
            </React.Fragment>
          ))
        : inject(kids);
      return React.cloneElement(node as React.ReactElement, {}, nextKids);
    };

    rendered = inject(children);
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {rendered}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[11px] text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[11px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`input ${className}`} />;
}

export function Textarea({ className = "", ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={`input resize-none ${className}`} />;
}

export function Select({ className = "", ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={`input ${className}`} />;
}
