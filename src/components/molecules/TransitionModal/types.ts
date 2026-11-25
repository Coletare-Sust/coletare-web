export interface TransitionModalProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  /** false: só os botões do conteúdo fecham (sem X, Esc ou clique fora). */
  dismissible?: boolean;
}
