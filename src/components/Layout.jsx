import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

function Layout({ children }) {
  const { userProfile } = useAuth();

  return (
    <div className="layout">
      <TopBar />
      <div className="layout__body">
        <Sidebar username={userProfile?.username} />
        <main className="layout__main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
