export type CaseIllustrationName =
  | 'explorer-globe'
  | 'detective-kit'
  | 'confidential-dossier'
  | 'brass-compass'
  | 'sealed-letter'
  | 'magnifying-glass'
  | 'greyton-detective'
  | 'oil-lantern';

export function CaseIllustration({
  name,
  className = '',
}: {
  name: CaseIllustrationName;
  className?: string;
}) {
  return (
    <img
      className={`case-illustration ${className}`}
      src={`${import.meta.env.BASE_URL}illustrations/${name}.webp`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
    />
  );
}