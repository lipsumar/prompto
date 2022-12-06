import './AppLayout.scss';

type AppLayoutProps = {
  side: JSX.Element;
  main: JSX.Element;
};
export default function AppLayout({ side, main }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <div className="app-layout__side">{side}</div>
      <div className="app-layout__main">{main}</div>
    </div>
  );
}
