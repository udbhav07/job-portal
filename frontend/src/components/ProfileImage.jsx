import { Building2 } from "../utils/icons";
import { getInitials } from "../utils/helper";

// Shows an uploaded image, or initials / a building icon when there is none
const ProfileImage = ({ src, alt, name, className = "", variant = "person" }) => {
  if (src) {
    return <img src={src} alt={alt} className={`object-cover ${className}`} />;
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-teal-50 text-teal-700 flex items-center justify-center ${className}`}
    >
      {variant === "company" || !name ? (
        <Building2 className="w-8 h-8" />
      ) : (
        <span className="text-xl font-semibold">{getInitials(name)}</span>
      )}
    </div>
  );
};

export default ProfileImage;
