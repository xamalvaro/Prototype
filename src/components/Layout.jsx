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
      <div className="ticker-bar">
        <div className="ticker-content">✦ NEWSPACE ONLINE ✦ CONNECT WITH OTHERS ✦ SHARE YOUR WORLD ✦ EST. 2024 ✦ BE YOURSELF ✦ FIND YOUR PEOPLE ✦ NEWSPACE ONLINE ✦ CONNECT WITH OTHERS ✦ SHARE YOUR WORLD ✦</div>
      </div>
    </div>
  );
}

export default Layout;
