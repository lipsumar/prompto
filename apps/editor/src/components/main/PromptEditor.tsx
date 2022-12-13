type PromptProps = {
  body: string;
  onChange: (body: string) => void;
};
export default function Prompt({ body, onChange }: PromptProps) {
  return (
    <textarea
      onChange={(e) => onChange(e.target.value)}
      value={body}
      className="bp4-running-text text-mono"
    ></textarea>
  );
}
