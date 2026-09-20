import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  Briefcase,
  Building2,
  LayoutDashboard,
  Plus,
} from "./icons";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Smart Job Matching",
    description:
      "AI-Powered algorithm matches with relevant opportunities based on your skills and preferences",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description:
      "Create professional resumes with our intuitive builder and template designed by experts",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description:
      "Connect directly with hiring managers and recruiters through our secure messaging platform",
  },
  {
    icon: Award,
    title: "Skill Assessment",
    description:
      "Showcase your abilities with verified skill tests and earn badges that employer trust",
  },
];

export const employerFeatures = [
  {
    icon: Users,
    title: "Talent Pool Access",
    description:
      "Access our vast database of pre-screened candidates and find a perfect fit for your team",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track your hiring performance with detail analytics and insights on candidate engagement",
  },
  {
    icon: Shield,
    title: "Verified Candidates",
    description:
      "All candidates undergo background verification to ensure your hiring trustworthy professionals",
  },
  {
    icon: Clock,
    title: "Skill Assessment",
    description:
      "Streamline hiring process reduces time-to-hire by 60% with automated screening tools",
  },
];

// navigation item configuration
export const NAVIGATION_MENU = [
  { id: "employer-dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "post-job", name: "Post Job", icon: Plus },
  { id: "manage-jobs", name: "Manage Jobs", icon: Briefcase },
  { id: "company-profile", name: "Company Profile", icon: Building2 },
];

export const CATEGORIES = [
  { value: "Engineering", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "It & Software", label: "It & Software" },
  { value: "Customer-Service", label: "Customer-Service" },
  { value: "Product", label: "Product" },
  { value: "Operations", label: "Operations" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "HR" },
  { value: "Other", label: "Other" },
];

export const JOB_TYPES = [
  { value: "Remote", label: "Remote" },
  { value: "Full-Time", label: "Full-Time" },
  { value: "Part-Time", label: "Part-Time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

export const SALARY_RANGES = [
  "Less than $1000",
  "$1000 - $15,000",
  "More than $15,000",
];
