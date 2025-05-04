import './Spinner.scss';

interface SpinnerProps {
  isLoading: boolean;
}

const Spinner = ({ isLoading }: SpinnerProps) => {
  return (
    <>
      {isLoading && (
        <div className="spinnerBackdrop">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
}

export default Spinner;