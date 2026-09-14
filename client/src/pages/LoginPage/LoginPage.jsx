import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuote } from '../../hooks/useQuote.js';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { quote, isVisible } = useQuote();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.panel}>
        <div className={styles.panelMetaTop}>
          <span>01 // AUTHENTICATION</span>
        </div>

        <div className={styles.panelContent}>
          <h1 className={styles.wordmark}>SyncBoard</h1>
          <p className={styles.tagline}>
            Collaborate.<br />
            Organize.<br />
            Deliver.
          </p>

          <blockquote className={`${styles.quote} ${isVisible ? styles.quoteVisible : ''}`}>
            {quote}
          </blockquote>
        </div>

        <div className={styles.panelMetaBottom}>
          <p>© SYNCBOARD INC. — ALL RIGHTS RESERVED</p>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.formWrap}>
          <div className={styles.formHeader}>
            <span className={styles.stepBadge}>— SIGN IN</span>
            <h2 className={styles.heading}>Welcome back</h2>
            <p className={styles.subheading}>Enter your credentials to access your workspace.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.cubeLabel} htmlFor="email">Email address</label>
              <div className={`${styles.blockCube} ${styles.blockInput}`}>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <div className={styles.bgTop}><div className={styles.bgInner}></div></div>
                <div className={styles.bgRight}><div className={styles.bgInner}></div></div>
                <div className={styles.bg}><div className={styles.bgInner}></div></div>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label className={styles.cubeLabel} htmlFor="password">Password</label>
              </div>
              <div className={`${styles.blockCube} ${styles.blockInput}`}>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <div className={styles.bgTop}><div className={styles.bgInner}></div></div>
                <div className={styles.bgRight}><div className={styles.bgInner}></div></div>
                <div className={styles.bg}><div className={styles.bgInner}></div></div>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit}>
              Sign In →
            </button>

            <div className={styles.switchBox}>
              <p className={styles.switch}>
                New here?{' '}
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => navigate('/register')}
                >
                  Create an account
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}