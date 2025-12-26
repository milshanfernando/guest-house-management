import toast from "react-hot-toast";

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

export const confirmToast = ({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}: ConfirmOptions) => {
  toast(
    (t) => (
      <div className="w-72 space-y-3">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 border rounded text-sm"
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity }
  );
};
