// App-wide icon set. Components import icons from here, so the whole
// look can be changed in one place.
import * as P from "@phosphor-icons/react";

const icon = (Icon, weight = "duotone") => {
  const AppIcon = (props) => <Icon size={24} weight={weight} {...props} />;
  AppIcon.displayName = Icon.displayName;
  return AppIcon;
};

export const AlertCircle = icon(P.WarningCircle);
export const ArrowLeft = icon(P.ArrowLeft, "bold");
export const ArrowRight = icon(P.ArrowRight, "bold");
export const Award = icon(P.Medal);
export const BarChart3 = icon(P.ChartBar);
export const Book = icon(P.BookOpen);
export const Bookmark = icon(P.BookmarkSimple);
export const Briefcase = icon(P.Briefcase);
export const Building = icon(P.Building);
export const Building2 = icon(P.Buildings);
export const Calendar = icon(P.CalendarBlank);
export const CheckCircle = icon(P.CheckCircle);
export const CheckCircle2 = icon(P.SealCheck);
export const ChevronDown = icon(P.CaretDown, "bold");
export const ChevronUp = icon(P.CaretUp, "bold");
export const Clock = icon(P.Clock);
export const DollarSign = icon(P.CurrencyDollar);
export const Download = icon(P.DownloadSimple);
export const Edit = icon(P.PencilSimple);
export const Edit3 = icon(P.PencilLine);
export const Eye = icon(P.Eye);
export const EyeOff = icon(P.EyeSlash);
export const FileText = icon(P.FileText);
export const Filter = icon(P.Funnel);
export const Grid = icon(P.GridFour);
export const IndianRupee = icon(P.CurrencyInr);
export const LayoutDashboard = icon(P.SquaresFour);
export const List = icon(P.ListBullets);
export const Loader = icon(P.CircleNotch, "bold");
export const Lock = icon(P.LockSimple);
export const LogOut = icon(P.SignOut);
export const Mail = icon(P.EnvelopeSimple);
export const MapPin = icon(P.MapPin);
export const Menu = icon(P.List, "bold");
export const MessageSquare = icon(P.ChatCircleText);
export const Plus = icon(P.Plus, "bold");
export const Save = icon(P.FloppyDisk);
export const Search = icon(P.MagnifyingGlass, "bold");
export const Send = icon(P.PaperPlaneTilt);
export const Shield = icon(P.ShieldCheck);
export const Target = icon(P.Target);
export const Trash2 = icon(P.Trash);
export const TrendingUp = icon(P.TrendUp);
export const Upload = icon(P.UploadSimple);
export const User = icon(P.User);
export const UserCheck = icon(P.UserCheck);
export const Users = icon(P.UsersThree);
export const X = icon(P.X, "bold");
