import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import Select from './Select.jsx';
import { STAGES, STAGE_ORDER } from '../data/stages.js';
import { SECTIONS } from '../data/help.js';

/**
 * The "Send feedback" form, opened from any page with `useFeedback()()`. It is a modal <dialog>, so the browser
 * handles focus, Escape and the backdrop. This mock-up has no backend: Send checks the form and shows a thank-you.
 */
const FeedbackContext = createContext(() => {});
export const useFeedback = () => useContext(FeedbackContext);

const TYPES = ['Question', 'Problem', 'Suggestion'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { about: '', type: TYPES[0], message: '', email: '' };

// Names the page the form was opened from, such as "Explore · High school", so feedback arrives with its context.
function pageName({ pathname, search }) {
  const q = new URLSearchParams(search);
  if (pathname === '/explore') return `Explore · ${STAGES[STAGE_ORDER.includes(q.get('stage')) ? q.get('stage') : 'readiness'].short}`;
  if (pathname === '/learn') return `Glossary and help · ${(SECTIONS.find((s) => s.key === q.get('section')) ?? SECTIONS[0]).label}`;
  return 'Home';
}

export function FeedbackProvider({ children }) {
  const dialog = useRef(null);
  const location = useLocation();
  const [opened, setOpened] = useState(0);
  const [here, setHere] = useState('Home');
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  // Shows the dialog after the reset form has rendered, so the browser focuses its first control.
  useEffect(() => {
    if (opened) dialog.current.showModal();
  }, [opened]);

  useEffect(() => {
    if (sent) dialog.current.querySelector('.dialog__done')?.focus();
  }, [sent]);

  function open() {
    const page = pageName(location);
    setHere(page);
    setFields({ ...EMPTY, about: page });
    setErrors({});
    setSent(false);
    setOpened((n) => n + 1);
  }

  const close = () => dialog.current.close();
  const set = (field) => (value) => setFields((f) => ({ ...f, [field]: value }));

  function submit(e) {
    e.preventDefault();
    const email = fields.email.trim();
    const found = {
      ...(fields.message.trim() ? {} : { message: 'Enter a message.' }),
      ...(email && !EMAIL.test(email) ? { email: 'Enter an email address like name@example.com, or leave it blank.' } : {}),
    };
    setErrors(found);
    if (Object.keys(found).length) document.getElementById(found.message ? 'fb-msg' : 'fb-email').focus();
    else setSent(true);
  }

  return (
    <FeedbackContext.Provider value={open}>
      {children}
      {/* A click on the dialog itself (not its contents) is a click on the backdrop. */}
      <dialog ref={dialog} className="dialog" aria-labelledby="fb-h" onClick={(e) => e.target === dialog.current && close()}>
        <div className="dialog__inner">
          <div className="dialog__head">
            <h2 id="fb-h" className="h3">Send feedback</h2>
            <button type="button" className="dialog__close" aria-label="Close" onClick={close}>
              <Icon name="close" size={16} strokeWidth={2.2} />
            </button>
          </div>
          {sent ? (
            <div className="stack gap-12" role="status">
              <p className="strong">Thanks for your feedback.</p>
              <p className="body-sm">
                The SLDS team reviews every message.
                {fields.email.trim() ? ` If we need to follow up, we’ll write to ${fields.email.trim()}.` : ''}
              </p>
              <p className="caption">Illustrative mock-up: nothing was sent.</p>
              <div className="dialog__actions">
                <button type="button" className="btn btn--primary btn--sm dialog__done" onClick={close}>Close</button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="stack gap-16">
              <p className="body-sm muted">
                Tell us what’s working, what’s confusing or what’s missing. For questions about an individual student,
                contact the school.
              </p>
              <div className="field">
                <label htmlFor="fb-about">About</label>
                <Select id="fb-about" value={fields.about} onChange={set('about')} options={[here, 'Another page', 'The whole site']} />
              </div>
              <div className="field" role="radiogroup" aria-labelledby="fb-type">
                <span id="fb-type" className="field__label">Type</span>
                <div className="choices">
                  {TYPES.map((t) => (
                    <label key={t} className="choice">
                      <input type="radio" name="fb-type" value={t} checked={fields.type === t} onChange={() => set('type')(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="fb-msg">Message</label>
                <textarea
                  id="fb-msg"
                  className="input textarea"
                  rows={5}
                  value={fields.message}
                  onChange={(e) => set('message')(e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'fb-msg-err' : undefined}
                />
                {errors.message && <span id="fb-msg-err" className="field__error">{errors.message}</span>}
              </div>
              <div className="field">
                <label htmlFor="fb-email">Email <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="fb-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  value={fields.email}
                  onChange={(e) => set('email')(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'fb-email-hint fb-email-err' : 'fb-email-hint'}
                />
                <span id="fb-email-hint" className="caption">Only if you’d like a reply.</span>
                {errors.email && <span id="fb-email-err" className="field__error">{errors.email}</span>}
              </div>
              <div className="dialog__actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--sm">Send</button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </FeedbackContext.Provider>
  );
}
