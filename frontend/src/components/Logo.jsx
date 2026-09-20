// Brand mark: an open ring with a dot breaking out of it (stepping into a new role)
export const LogoMark = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M27 16A11 11 0 1 1 16 5"
        fill="none"
        stroke="#0f766e"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <circle cx="25" cy="7" r="3.75" fill="#f59e0b" />
    </svg>
  );
};

const Logo = ({
  markClassName = "w-8 h-8",
  textClassName = "text-xl font-bold text-gray-900",
  className = "flex items-center space-x-3",
}) => {
  return (
    <div className={className}>
      <LogoMark className={markClassName} />
      <span className={textClassName}>JobPortal</span>
    </div>
  );
};

export default Logo;
