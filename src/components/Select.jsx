import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * A drop-down list drawn by the page instead of the browser. Native <select> menus are drawn by the
 * operating system, so they don't appear when the screen is shared in a meeting. Follows the ARIA
 * "select-only combobox" pattern: focus stays on the button and the open list tracks the active option.
 * `options` are strings or { value, label }; `onChange` receives the new value.
 */
export default function Select({ id, value, options, onChange, disabled = false }) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const selected = Math.max(0, items.findIndex((o) => o.value === value));
  const listId = useId();
  const root = useRef(null);
  const typed = useRef({ text: '', at: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    if (open) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, listId]);

  function show(i = selected) {
    setActive(i);
    setOpen(true);
  }

  function pick(i) {
    setOpen(false);
    if (items[i].value !== value) onChange(items[i].value);
  }

  // Typing letters jumps to the next option that starts with them, like a native select.
  function typeahead(key) {
    const now = Date.now();
    const text = now - typed.current.at < 600 ? typed.current.text + key : key;
    typed.current = { text, at: now };
    const from = text.length === 1 ? active + 1 : active;
    const order = [...items.keys()].map((k) => (k + from) % items.length);
    const hit = order.find((k) => items[k].label.toLowerCase().startsWith(text.toLowerCase()));
    if (hit != null) show(hit);
  }

  function onKeyDown(e) {
    const last = items.length - 1;
    const actions = {
      ArrowDown: () => (open ? setActive(Math.min(last, active + 1)) : show()),
      ArrowUp: () => (open ? setActive(Math.max(0, active - 1)) : show()),
      Home: () => show(0),
      End: () => show(last),
      PageDown: () => show(Math.min(last, active + 10)),
      PageUp: () => show(Math.max(0, active - 10)),
      Enter: () => (open ? pick(active) : show()),
      ' ': () => (open ? pick(active) : show()),
      Escape: () => setOpen(false),
    };
    if (e.key === 'Tab') {
      if (open) pick(active);
    } else if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      typeahead(e.key);
    }
  }

  return (
    <div className="dropdown" ref={root}>
      <button
        id={id}
        type="button"
        role="combobox"
        className="select dropdown__button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        <span className="dropdown__value">{items[selected]?.label}</span>
        <Icon name="chevronDown" size={16} strokeWidth={2} />
      </button>
      {open && (
        <ul id={listId} role="listbox" className="dropdown__list" aria-labelledby={id}>
          {items.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === selected}
              className={`dropdown__option${i === active ? ' is-active' : ''}`}
              onPointerMove={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
