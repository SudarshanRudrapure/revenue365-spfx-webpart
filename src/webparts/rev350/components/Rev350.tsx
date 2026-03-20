/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { Spinner, SpinnerSize } from '@fluentui/react';
import styles from './Rev350.module.scss';
import { setupList } from './services/ListSetupService';
import Products from './pages/Products';
import Services from './pages/Services';
import Subscriptions from './pages/Subscriptions';
import Bundles from './pages/Bundles';

type PageType = 'products' | 'services' | 'subscriptions' | 'bundles';

const Rev350: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<PageType>('products');
  const [isSettingUp, setIsSettingUp] = React.useState(true);
  const [setupStatus, setSetupStatus] = React.useState('Checking SharePoint list...');

  // useRef prevents the double-call from React StrictMode in development
  const hasRun = React.useRef(false);

    const runSetup = async () => {
    setIsSettingUp(true);
    setSetupStatus('Checking SharePoint list...');

    const result = await setupList();

    if (result === 'created')     setSetupStatus('✅ List created successfully!');
    else if (result === 'exists') setSetupStatus('✅ List found!');
    else                          setSetupStatus('❌ Error setting up list. Please check permissions.');

    setTimeout(() => setIsSettingUp(false), 1500);
  };

  React.useEffect(() => {
    // Guard against double execution in React StrictMode (dev mode)
    if (hasRun.current) return;
    hasRun.current = true;

    void runSetup().catch();
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'products':      return <Products />;
      case 'services':      return <Services />;
      case 'subscriptions': return <Subscriptions />;
      case 'bundles':       return <Bundles />;
      default:              return <Products />;
    }
  };

  if (isSettingUp) {
    return (
      <div className={styles.setupWrapper}>
        <Spinner size={SpinnerSize.large} />
        <span className={styles.setupText}>{setupStatus}</span>
      </div>
    );
  }

  return (
    <div className={styles.appWrapper}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}></span>
          <span className={styles.logoText}>Revenue 365</span>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${currentPage === 'products' ? styles.active : ''}`}
            onClick={() => setCurrentPage('products')}
          >Products</button>
          <button
            className={`${styles.navItem} ${currentPage === 'services' ? styles.active : ''}`}
            onClick={() => setCurrentPage('services')}
          >Services</button>
          <button
            className={`${styles.navItem} ${currentPage === 'subscriptions' ? styles.active : ''}`}
            onClick={() => setCurrentPage('subscriptions')}
          >Subscriptions</button>
          <button
            className={`${styles.navItem} ${currentPage === 'bundles' ? styles.active : ''}`}
            onClick={() => setCurrentPage('bundles')}
          >Bundles</button>
        </nav>
      </div>
      <div className={styles.mainContent}>{renderPage()}</div>
    </div>
  );
};

export default Rev350;