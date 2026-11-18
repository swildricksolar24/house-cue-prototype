import { Icon } from '../../components/Icon/Icon';
import './DialogClose.css';

/**
 * Review change: every modal (dialogs and bottom sheets) has a × in its top-right corner that closes it, the same as
 * Cancel / Esc / a click outside. Put it first inside the panel; the panel becomes the positioning box and the title
 * after it gets room so it doesn't run under the ×.
 */
export function DialogClose({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="hc-dialog-close" aria-label={label} title={label} onClick={onClick}>
      <Icon name="close-small" size={20} />
    </button>
  );
}
