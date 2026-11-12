import { CloseIcon } from "./icons";

/** Round "×" button in the top corner of the public modals (review, prices, Viber). */
export function DialogCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="დახურვა"
      className="-m-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-card hover:text-fg"
    >
      <CloseIcon className="size-5" />
    </button>
  );
}
