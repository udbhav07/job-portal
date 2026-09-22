import { Bookmark, Building, Building2, Calendar, MapPin } from "../../utils/icons";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import StatusBadge from "../../components/StatusBadge";

const JobCard = ({ job, onClick, onToggleSave, onApply, saved, hideApply }) => {
  const { user } = useAuth();

  //   const formatSalary = (min, max) => {
  //     const formatNumber = (num) => {
  //       if (num >= 1000) return `\u20B9${(num / 1000).toFixed(0)}k`;
  //       return `\u20B9${num}`;
  //     };
  //     return `${formatNumber(min)}/m`;
  //   };

  // const formatSalary = (min, max) => {
  //   const formatNumber = (num) => {
  //     if (num >= 10000000) return `\u20B9${(num / 10000000).toFixed(2)}Cr`; // Crore
  //     if (num >= 100000) return `\u20B9${(num / 100000).toFixed(2)}L`; // Lakh
  //     if (num >= 1000) return `\u20B9${(num / 1000).toFixed(0)}k`; // Thousand
  //     return `\u20B9${num}`;
  //   };

  //   if (max) {
  //     return `${formatNumber(min)} – ${formatNumber(max)} /yr`;
  //   } else {
  //     return `${formatNumber(min)} /yr`;
  //   }
  // };

  // salary format monthly
  const formatSalary = (min, max) => {
    const formatNumber = (num) => {
      if (num >= 10000000) return `\u20B9${(num / 10000000).toFixed(2)}Cr`; // Crore
      if (num >= 100000) return `\u20B9${(num / 100000).toFixed(2)}L`; // Lakh
      if (num >= 1000) return `\u20B9${(num / 1000).toFixed(0)}k`; // Thousand
      return `\u20B9${num}`;
    };

    // Convert annual to monthly
    const monthlyMin = min / 12;
    const monthlyMax = max ? max / 12 : null;

    if (monthlyMax) {
      return `${formatNumber(monthlyMin)} – ${formatNumber(monthlyMax)} /mo`;
    } else {
      return `${formatNumber(monthlyMin)} /mo`;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200 transition-all duration-300 group relative overflow-hidden cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {job?.company?.companyLogo ? (
            <img
              src={job?.company?.companyLogo}
              alt="Company Logo"
              className="w-14 h-14 object-cover rounded-xl border-4 border-white/20 shadow-lg"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base group-hover:text-teal-700 transition-colors leading-snug">
              {job?.title}
            </h3>
            <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
              <Building2 className="w-3.5 h-3.5" />
              {job?.company?.companyName}
            </p>
          </div>
        </div>
        {user && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bookmark
              className={`w-5 h-5 hover:text-teal-700 ${
                job?.isSaved || saved ? "text-teal-700" : "text-gray-400"
              }`}
            />
          </button>
        )}
      </div>
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
            <MapPin className="w-3 h-3" />
            {job?.location}
          </span>
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              job?.type === "Full-Time"
                ? "bg-green-100 text-green-800"
                : job?.type === "Part-Time"
                ? "bg-yellow-100 text-yellow-800"
                : job?.type === "Contract"
                ? "bg-amber-100 text-amber-800"
                : "bg-teal-100 text-teal-900"
            } `}
          >
            {job?.type}
          </span>
          <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
            {job?.category}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {job?.createdAt
              ? moment(job.createdAt).format("Do MMM YYYY")
              : "N/A"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-teal-700 font-semibold text-lg">
          {formatSalary(job?.salaryMin, job?.salaryMax)}
        </div>
        {!saved && (
          <>
            {job?.applicationStatus ? (
              <StatusBadge status={job?.applicationStatus} />
            ) : (
              !hideApply && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply();
                  }}
                  className="bg-teal-50 text-sm text-teal-800 hover:text-white px-6 py-2.5 rounded-full hover:bg-teal-600 transition-all duration-200 font-semibold transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Apply Now
                </button>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobCard;
