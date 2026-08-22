import styles from './Button.module.css';

export default function Button({ variant = 'primary', size = 'md', disabled = false, children, ...rest }) {
  const cls = [styles.btn, styles[variant], styles[size]].join(' ');
  return (
    <button className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}