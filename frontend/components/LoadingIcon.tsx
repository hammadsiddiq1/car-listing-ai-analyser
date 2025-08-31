import './loadingIcon.css';

const Loader = ({ color = '#4F46E5' }) => {
  const loaderStyle = {
    borderColor: `${color} transparent ${color} transparent`,
  };

  return (
    <div className="loader-container">
      <div className="loader" style={loaderStyle}></div>
    </div>
  );
};

export default Loader;
