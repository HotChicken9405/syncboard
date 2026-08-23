import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>404</h1>
      <p>This page does not exist.</p>
      <Button variant="primary" onClick={() => navigate('/')}>Go Home</Button>
    </div>
  );
}