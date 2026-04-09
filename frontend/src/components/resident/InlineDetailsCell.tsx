type Props = {
  text: string | null | undefined;
  /** e.g. "Show or hide full session narrative" */
  ariaLabel: string;
};

export function InlineDetailsCell({ text, ariaLabel }: Props) {
  const body = text?.trim() ?? "";
  if (!body) {
    return <span className="text-muted">{"\u2014"}</span>;
  }
  return (
    <details className="resident-inline-disclosure">
      <summary className="resident-inline-disclosure__summary" aria-label={ariaLabel}>
        Details
      </summary>
      <div className="resident-inline-disclosure__body">{body}</div>
    </details>
  );
}
