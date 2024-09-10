import Button from "@atoms/Button/button";
import TransitionModal from "@molecules/TransitionModal/transitionModal";

import { ConfirmationModalProps } from "./types";

const ConfirmationModal = ({
  description,
  isOpen,
  onConfirm,
  onOpenChange,
  title,
  confirmIsLoading = false
}: ConfirmationModalProps) => {
  return (
    <TransitionModal isOpen={isOpen} setIsOpen={onOpenChange}>
      <div>
        <h1 className="mb-4 text-[23px] font-medium text-greenBlue-1000">
          {title}
        </h1>
        <p className="text-base">{description}</p>
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              buttonType="button"
              className="border border-greenDark-1000 bg-transparent text-greenDark-1000"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button onClick={onConfirm} loading={confirmIsLoading}>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </TransitionModal>
  );
};

export default ConfirmationModal;
