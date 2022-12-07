import './EditorLayout.scss';

type EditorLayoutProps = {
  side: JSX.Element;
  main: JSX.Element;
};
export default function EditorLayout({ side, main }: EditorLayoutProps) {
  return (
    <div className="editor-layout">
      <div className="editor-layout__side">{side}</div>
      <div className="editor-layout__main">{main}</div>
    </div>
  );
}
