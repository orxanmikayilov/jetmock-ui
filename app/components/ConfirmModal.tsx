import React from "react";

interface Props {
    open: boolean;
    title?: string;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<Props> = ({
                                           open,
                                           title = "Are you sure?",
                                           message = "This action cannot be undone.",
                                           onConfirm,
                                           onCancel
                                       }) => {

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-80 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
                <p className="text-gray-300 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
