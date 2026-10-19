interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast = ({ message, isVisible }: ToastProps) => {
  return (
    <div className={`toast ${isVisible ? 'on' : ''}`} id="toast" role="status">
      {message}
    </div>
  );
};
