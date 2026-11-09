import { useEffect, useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';

/**
 * A drop-down list drawn by the page instead of the browser. Native <select> menus are drawn by the
 * operating system, so they don't appear when the screen is shared in a meeting. Follows the ARIA
 * "select-only combobox" pattern: focus stays on the button and the open list tracks the active option.
 * `options` are strings or { value, label }; `onChange` receives the new value.
 *
 * With `multiple`, `value` is an array kept in the order the options were picked (chart colors follow that
 * order), each option has a checkbox, and the list stays open while picking. At least one option always stays
 * picked: unchecking the last one does nothing, and "Clear" leaves the first option. The button names the pick,
 * or counts them with `noun` ("3 districts").
 */
export default function Select({ id, value, options, onChange, disabled = false, multiple = false, noun = 'selected' }) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const picked = multiple ? value : [value];
  const selected = Math.max(0, items.findIndex((o) => o.value === picked[0]));
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
    const v = items[i].value;
    if (!multiple) {
      setOpen(false);
      if (v !== value) onChange(v);
    } else if (!value.includes(v)) {
      onChange([...value, v]);
    } else if (value.length > 1) {
      onChange(value.filter((x) => x !== v));
    }
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
    };
    if (e.key === 'Tab') {
      if (open && !multiple) pick(active);
      setOpen(false);
    } else if (e.key === 'Escape') {
      // Only stop Escape while the list is open, so a closed drop-down inside a dialog still lets it close.
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
    } else if (actions[e.key]) {
      e.preventDefault();
      actions[e.key]();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      typeahead(e.key);
    }
  }

  const labelOf = (v) => items.find((o) => o.value === v)?.label ?? v;
  const summary = !multiple || value.length === 1 ? labelOf(picked[0])
    : value.length === items.length ? `All ${items.length} ${noun}`
    : `${value.length} ${noun}`;

  const list = (
    <ul id={listId} role="listbox" className={multiple ? 'dropdown__options' : 'dropdown__list'} aria-labelledby={id} aria-multiselectable={multiple || undefined}>
      {items.map((o, i) => {
        const on = picked.includes(o.value);
        return (
          <li
            key={o.value}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={on}
            className={`dropdown__option${i === active ? ' is-active' : ''}${multiple ? ' dropdown__option--check' : ''}`}
            title={multiple && on && value.length === 1 ? 'At least one stays picked' : undefined}
            onPointerMove={() => setActive(i)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(i)}
          >
            {multiple && <span className="dropdown__box" aria-hidden="true">{on && <Icon name="check" size={12} strokeWidth={3} />}</span>}
            {o.label}
          </li>
        );
      })}
    </ul>
  );

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
        <span className="dropdown__value">{summary}</span>
        <Icon name="chevronDown" size={16} strokeWidth={2} />
      </button>
      {open && !multiple && list}
      {open && multiple && (
        <div className="dropdown__list dropdown__list--multi">
          {/* Mouse shortcuts; keyboard users toggle options with Space or Enter. */}
          <div className="dropdown__actions" onMouseDown={(e) => e.preventDefault()}>
            <button type="button" tabIndex={-1} className="link-btn" onClick={() => onChange([...value, ...items.map((o) => o.value).filter((v) => !value.includes(v))])}>Select all</button>
            <button type="button" tabIndex={-1} className="link-btn" onClick={() => onChange([items[0].value])}>Clear</button>
          </div>
          {list}
        </div>
      )}
    </div>
  );
}
