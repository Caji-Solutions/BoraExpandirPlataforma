import { XCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ReviewActionButtonsProps {
  onReject: () => void;
  onApprove: () => void;
  loading?: boolean;
  disabled?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  showMiddleButton?: boolean;
  onMiddleAction?: () => void;
  middleLabel?: string;
  middleDisabled?: boolean;
}

export function ReviewActionButtons({
  onReject,
  onApprove,
  loading = false,
  disabled = false,
  approveLabel = 'Aprovar',
  rejectLabel = 'Rejeitar',
  showMiddleButton = false,
  onMiddleAction,
  middleLabel = 'Solicitar Ação',
  middleDisabled = false,
}: ReviewActionButtonsProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-t flex items-center justify-between gap-4 shrink-0">
      <Button 
        variant="destructive" 
        className="flex-1 h-12 text-base shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        onClick={onReject}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <XCircle className="w-5 h-5 mr-2" />
        )}
        {rejectLabel}
      </Button>

      {showMiddleButton && onMiddleAction && (
        <Button 
          variant="secondary"
          className="flex-1 h-12 text-base border-2 bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white dark:border-gray-600 active:scale-[0.98]"
          onClick={onMiddleAction}
          disabled={middleDisabled || loading}
        >
          <AlertCircle className="w-5 h-5 mr-2" />
          {middleLabel}
        </Button>
      )}

      <Button 
        className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-green-200 dark:hover:shadow-none active:scale-[0.98]"
        onClick={onApprove}
        disabled={disabled || loading}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-2" />
        )}
        {approveLabel}
      </Button>
    </div>
  );
}
