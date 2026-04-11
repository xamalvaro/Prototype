import TopBar from './TopBar';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <TopBar />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
