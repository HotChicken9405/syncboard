import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuote } from '../../hooks/useQuote.js';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const { quote, isVisible } = useQuote();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <aside className={styles.panel}>
        <div className={styles.panelMetaTop}>
          <span>02 // ONBOARDING</span>
        </div>

        <div className={styles.panelContent}>
          <h1 className={styles.wordmark}>SyncBoard</h1>
          <p className={styles.tagline}>
            Join the team.<br />
            Build together.<br />
            Ship faster.
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
            <span className={styles.stepBadge}>— REGISTER</span>
            <h2 className={styles.heading}>Create an account</h2>
            <p className={styles.subheading}>Start collaborating with your team today.</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label className={styles.cubeLabel} htmlFor="name">Full Name</label>
              <div className={`${styles.blockCube} ${styles.blockInput}`}>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
                <div className={styles.bgTop}><div className={styles.bgInner}></div></div>
                <div className={styles.bgRight}><div className={styles.bgInner}></div></div>
                <div className={styles.bg}><div className={styles.bgInner}></div></div>
              </div>
            </div>

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
              <label className={styles.cubeLabel} htmlFor="password">Password</label>
              <div className={`${styles.blockCube} ${styles.blockInput}`}>
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <div className={styles.bgTop}><div className={styles.bgInner}></div></div>
                <div className={styles.bgRight}><div className={styles.bgInner}></div></div>
                <div className={styles.bg}><div className={styles.bgInner}></div></div>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit}>
              Create Account →
            </button>

            <div className={styles.switchBox}>
              <p className={styles.switch}>
                Already have an account?{' '}
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}