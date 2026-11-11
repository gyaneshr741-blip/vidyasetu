import { useState, type FormEvent } from 'react';
import {
  APP_NAME,
  DEMO_PASSWORD,
  DEMO_QUICK_FILL,
  UNIVERSITY_NAME,
} from '../data/initialState';

interface LoginViewProps {
  onLogin: (username: string, password: string) => string | null;
  hasCustomState: boolean;
  onResetDemo: () => void;
}

export function LoginView({
  onLogin,
  hasCustomState,
  onResetDemo,
}: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleQuickFill = (demoUser: string) => {
    setUsername(demoUser);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const errMsg = onLogin(username, password);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError('');
  };

  return (
    <section id="login">
      <div className="hero">
        <h1>{APP_NAME}</h1>
        <div className="bar" />
        <p>
          One portal for {UNIVERSITY_NAME}’s students, faculty, parents and
          administrators.
        </p>
      </div>
      <div className="form-wrap">
        <form className="form" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <label htmlFor="u">Username</label>
          <input
            id="u"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (error) setError('');
            }}
            autoComplete="username"
            required
          />
          <label htmlFor="p">Password</label>
          <input
            id="p"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError('');
            }}
            autoComplete="current-password"
            required
          />
          <div className="err" id="err" role="alert">
            {error}
          </div>
          <button type="submit">Sign in</button>
          <p className="demo-hint">
            Demo accounts (password: <code>{DEMO_PASSWORD}</code>). Tap to fill:
          </p>
          <div className="demo">
            {DEMO_QUICK_FILL.map((account) => (
              <button
                key={account.username}
                type="button"
                className="ghost sm"
                onClick={() => handleQuickFill(account.username)}
              >
                {account.label}
              </button>
            ))}
          </div>
          {hasCustomState ? (
            <div>
              <button
                type="button"
                className="ghost sm"
                onClick={onResetDemo}
              >
                Reset demo data
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
